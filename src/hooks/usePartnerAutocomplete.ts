import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { PartnerComboDto } from '../types/api.types';

/**
 * 🚀 Partner Autocomplete Hook with Debounce
 * 
 * **Problem:** Loading 6000+ partners at once causes:
 * - Browser freeze/crash
 * - Network timeout
 * - Poor user experience
 * 
 * **Solution:**
 * 1. Load partners ONLY when user starts typing (min 2 characters)
 * 2. Debounce user input (300ms delay)
 * 3. Client-side filtering after initial load
 * 4. Limit results to 50 items
 * 
 * @param searchTerm - User's search input
 * @param minChars - Minimum characters before search (default: 2)
 * @returns Filtered partners and loading state
 */
export const usePartnerAutocomplete = (
  searchTerm: string,
  minChars: number = 2
) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Only fetch if search term is long enough
  const shouldFetch = debouncedSearch.length >= minChars;

  // Query all partners (cached after first load)
  const { data: allPartners, isLoading, error } = useQuery(
    ['lookups', 'partners'],
    async () => api.lookup.getPartners(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      enabled: shouldFetch, // ⚠️ Only fetch when user types >= 2 chars
    }
  );

  // Client-side filtering and limiting
  const filteredPartners = useMemo(() => {
    if (!allPartners || !shouldFetch) return [];

    const searchLower = debouncedSearch.toLowerCase();

    return allPartners
      .filter((partner) => {
        const code = (partner.sifraPartner ?? partner.code ?? '').toLowerCase();
        const name = (partner.nazivPartnera ?? partner.name ?? '').toLowerCase();
        const city = (partner.mesto ?? partner.city ?? '').toLowerCase();

        return (
          code.includes(searchLower) ||
          name.includes(searchLower) ||
          city.includes(searchLower)
        );
      })
      .slice(0, 50); // Limit to 50 results for performance
  }, [allPartners, debouncedSearch, shouldFetch]);

  return {
    partners: filteredPartners,
    isLoading: shouldFetch && isLoading,
    error,
    isEmpty: shouldFetch && filteredPartners.length === 0,
    needsMoreChars: !shouldFetch && searchTerm.length > 0,
  };
};

/**
 * 📄 Helper function for partner label formatting
 */
export const formatPartnerLabel = (partner: PartnerComboDto): string => {
  const code = partner.sifraPartner ?? partner.code ?? 'N/A';
  const name = partner.nazivPartnera ?? partner.name ?? '';
  const city = partner.mesto ?? partner.city;
  return `${code} - ${name}${city ? ` (${city})` : ''}`;
};
