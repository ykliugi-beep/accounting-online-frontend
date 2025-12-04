import { useState, useEffect, useCallback } from 'react';

export interface UseDebouncedSearchOptions {
  /** Minimum query length before searching (default: 2) */
  minLength?: number;
  /** Debounce delay in milliseconds (default: 300) */
  delay?: number;
  /** Initial query value (default: '') */
  initialQuery?: string;
}

export interface UseDebouncedSearchResult {
  /** Current search query */
  query: string;
  /** Debounced query value (for API calls) */
  debouncedQuery: string;
  /** Update the query */
  setQuery: (value: string) => void;
  /** Whether the query is valid for searching */
  isValidQuery: boolean;
  /** Clear the query */
  clearQuery: () => void;
}

/**
 * Hook for debounced search input with validation.
 * 
 * @example
 * const { query, debouncedQuery, setQuery, isValidQuery } = useDebouncedSearch({ minLength: 2, delay: 300 });
 * 
 * // Use query for input value
 * <input value={query} onChange={(e) => setQuery(e.target.value)} />
 * 
 * // Use debouncedQuery for API calls
 * const { data } = useQuery(['partners', debouncedQuery], () => searchPartners(debouncedQuery), {
 *   enabled: isValidQuery
 * });
 */
export function useDebouncedSearch(
  options: UseDebouncedSearchOptions = {}
): UseDebouncedSearchResult {
  const {
    minLength = 2,
    delay = 300,
    initialQuery = '',
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [query, delay]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const isValidQuery = debouncedQuery.length >= minLength;

  return {
    query,
    debouncedQuery,
    setQuery,
    isValidQuery,
    clearQuery,
  };
}
