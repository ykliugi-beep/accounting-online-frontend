import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  PartnerComboDto,
  OrganizationalUnitComboDto,
  TaxationMethodComboDto,
  ReferentComboDto,
  ReferenceDocumentComboDto,
  TaxRateComboDto,
  ArticleComboDto,
  DocumentCostDto,
  CostTypeComboDto,
  CostDistributionMethodComboDto,
  DocumentLineItemDto,
} from '../types/api.types';
import { api } from '../api';

/**
 * Custom hook za sve 11 Stored Procedures
 * Koristi React Query za kesiranje i automatsku invalidaciju
 * 
 * SYNTAX: TanStack Query v4.36.1 positional arguments with cacheTime
 */

// ==========================================
// QUERY KEYS
// ==========================================

const queryKeys = {
  partners: ['lookups', 'partners'] as const,
  orgUnits: (docTypeId: string) => ['lookups', 'orgUnits', docTypeId] as const,
  taxationMethods: ['lookups', 'taxationMethods'] as const,
  referents: ['lookups', 'referents'] as const,
  documentsND: ['lookups', 'documentsND'] as const,
  taxRates: ['lookups', 'taxRates'] as const,
  articles: ['lookups', 'articles'] as const,
  documentCosts: (documentId: number) => ['lookups', 'documentCosts', documentId] as const,
  costTypes: ['lookups', 'costTypes'] as const,
  costDistributionMethods: ['lookups', 'costDistributionMethods'] as const,
  costArticles: (documentId: number) => ['lookups', 'costArticles', documentId] as const,
};

// ==========================================
// INDIVIDUAL HOOKS
// ==========================================

/**
 * SP 1: Svi partneri
 * ⚠️ DEPRECATED for autocomplete: Use usePartnerAutocomplete instead
 * This hook loads 6000+ records and should only be used when necessary
 */
export const usePartners = (): UseQueryResult<PartnerComboDto[], unknown> => {
  return useQuery(
    queryKeys.partners,
    async () => api.lookup.getPartners(),
    {
      staleTime: 5 * 60 * 1000, // 5 minuta
      cacheTime: 30 * 60 * 1000, // 30 minuta
      enabled: false, // ⚠️ DISABLED by default - use usePartnerAutocomplete
    }
  );
};

/**
 * SP 2: Org. jedinice za vrstu dokumenta
 */
export const useOrgUnits = (
  docTypeId: string = 'UR'
): UseQueryResult<OrganizationalUnitComboDto[], unknown> => {
  return useQuery(
    queryKeys.orgUnits(docTypeId),
    async () => api.lookup.getOrganizationalUnits(docTypeId),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
};

/**
 * SP 3: Nacini oporezivanja
 */
export const useTaxationMethods = (): UseQueryResult<
  TaxationMethodComboDto[],
  unknown
> => {
  return useQuery(
    queryKeys.taxationMethods,
    async () => api.lookup.getTaxationMethods(),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 60 * 60 * 1000,
    }
  );
};

/**
 * SP 4: Referenti (zaposleni)
 */
export const useReferents = (): UseQueryResult<ReferentComboDto[], unknown> => {
  return useQuery(
    queryKeys.referents,
    async () => api.lookup.getReferents(),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 60 * 60 * 1000,
    }
  );
};

/**
 * SP 5: ND dokumenti (Narudzbenice)
 * Za "POVEZANA AMBALAŽA" dropdown - povezuje UR sa ND
 */
export const useDocumentsND = (): UseQueryResult<ReferenceDocumentComboDto[], unknown> => {
  return useQuery(
    queryKeys.documentsND,
    async () => api.lookup.getReferenceDocuments(),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
};

/**
 * SP 6: Poreske stope
 */
export const useTaxRates = (): UseQueryResult<TaxRateComboDto[], unknown> => {
  return useQuery(
    queryKeys.taxRates,
    async () => api.lookup.getTaxRates(),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 60 * 60 * 1000,
    }
  );
};

/**
 * SP 7: Artikli
 * ✅ NOW ENABLED by default for DocumentCreatePage
 * Loads on mount when hook is called and refetch() is invoked
 * Uses React Query caching to avoid repeated requests
 */
export const useArticles = (): UseQueryResult<ArticleComboDto[], unknown> => {
  return useQuery(
    queryKeys.articles,
    async () => api.lookup.getArticles(),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      enabled: false, // ⚠️ Still disabled by default to avoid loading 11000+ records unnecessarily
      // but can be manually triggered via refetch() in DocumentCreatePage
    }
  );
};

/**
 * SP 8: Troskovi za dokument
 */
export const useDocumentCosts = (
  documentId: number
): UseQueryResult<DocumentCostDto[], unknown> => {
  return useQuery(
    queryKeys.documentCosts(documentId),
    async () => api.cost.list(documentId),
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      enabled: !!documentId, // Samo ako je documentId proslezen
    }
  );
};

/**
 * SP 9: Vrste troskova
 */
export const useCostTypes = (): UseQueryResult<CostTypeComboDto[], unknown> => {
  return useQuery(
    queryKeys.costTypes,
    async () => api.lookup.getCostTypes(),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 60 * 60 * 1000,
    }
  );
};

/**
 * SP 10: Nacini deljenja troskova (1, 2, 3)
 */
export const useCostDistributionMethods = (): UseQueryResult<
  CostDistributionMethodComboDto[],
  unknown
> => {
  return useQuery(
    queryKeys.costDistributionMethods,
    async () => api.lookup.getCostDistributionMethods(),
    {
      staleTime: Infinity, // Nikad se ne menja
      cacheTime: Infinity,
    }
  );
};

/**
 * SP 11: Artikli iz stavki dokumenta za raspodelu troskova
 */
export const useCostArticles = (
  documentId: number
): UseQueryResult<DocumentLineItemDto[], unknown> => {
  return useQuery(
    queryKeys.costArticles(documentId),
    async () => api.lineItem.list(documentId),
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      enabled: !!documentId,
    }
  );
};

// ==========================================
// COMBO HOOK - SVE ODJEDNOM (za initial load)
// ⚠️ EXCLUDES:
// - Partners (6000+ records) - Use usePartnerAutocomplete
// - Articles (11000+ records) - Use useArticles with manual refetch
// ==========================================

export interface AllCombos {
  // partners - REMOVED: Use usePartnerAutocomplete hook
  orgUnits: OrganizationalUnitComboDto[];
  taxationMethods: TaxationMethodComboDto[];
  referents: ReferentComboDto[];
  documentsND: ReferenceDocumentComboDto[];
  taxRates: TaxRateComboDto[];
  // articles - REMOVED: Use useArticles with manual refetch
  costTypes: CostTypeComboDto[];
  costDistributionMethods: CostDistributionMethodComboDto[];
}

export const useAllCombos = (
  docTypeId: string = 'UR'
): UseQueryResult<AllCombos, unknown> => {
  return useQuery(
    ['lookups', 'all', docTypeId] as const,
    async () => {
      const [
        // partners - REMOVED to prevent timeout
        orgUnits,
        taxationMethods,
        referents,
        documentsND,
        taxRates,
        // articles - REMOVED: 11000+ records cause timeout
        costTypes,
        costDistributionMethods,
      ] = await Promise.all([
        // api.lookup.getPartners(), - REMOVED: 6000+ records
        api.lookup.getOrganizationalUnits(docTypeId),
        api.lookup.getTaxationMethods(),
        api.lookup.getReferents(),
        api.lookup.getReferenceDocuments(),
        api.lookup.getTaxRates(),
        // api.lookup.getArticles(), - REMOVED: 11000+ records
        api.lookup.getCostTypes(),
        api.lookup.getCostDistributionMethods(),
      ]);

      return {
        // partners - NOT included, use usePartnerAutocomplete
        orgUnits,
        taxationMethods,
        referents,
        documentsND,
        taxRates,
        // articles - NOT included
        costTypes,
        costDistributionMethods,
      };
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
};

export default {
  usePartners,
  useOrgUnits,
  useTaxationMethods,
  useReferents,
  useDocumentsND,
  useTaxRates,
  useArticles,
  useDocumentCosts,
  useCostTypes,
  useCostDistributionMethods,
  useCostArticles,
  useAllCombos,
};
