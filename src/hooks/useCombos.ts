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
 * UPDATED: TanStack Query v4 object syntax with explicit generics
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
 */
export const usePartners = (): UseQueryResult<PartnerComboDto[], unknown> => {
  return useQuery<PartnerComboDto[], Error, PartnerComboDto[], readonly ['lookups', 'partners']>({
    queryKey: queryKeys.partners,
    queryFn: async () => api.lookup.getPartners(),
    staleTime: 5 * 60 * 1000, // 5 minuta
    gcTime: 30 * 60 * 1000, // 30 minuta (v4: gcTime replaces cacheTime)
  });
};

/**
 * SP 2: Org. jedinice za vrstu dokumenta
 */
export const useOrgUnits = (
  docTypeId: string = 'UR'
): UseQueryResult<OrganizationalUnitComboDto[], unknown> => {
  return useQuery<OrganizationalUnitComboDto[], Error, OrganizationalUnitComboDto[], readonly ['lookups', 'orgUnits', string]>({
    queryKey: queryKeys.orgUnits(docTypeId),
    queryFn: async () => api.lookup.getOrganizationalUnits(docTypeId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * SP 3: Nacini oporezivanja
 */
export const useTaxationMethods = (): UseQueryResult<
  TaxationMethodComboDto[],
  unknown
> => {
  return useQuery<TaxationMethodComboDto[], Error, TaxationMethodComboDto[], readonly ['lookups', 'taxationMethods']>({
    queryKey: queryKeys.taxationMethods,
    queryFn: async () => api.lookup.getTaxationMethods(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * SP 4: Referenti (zaposleni)
 */
export const useReferents = (): UseQueryResult<ReferentComboDto[], unknown> => {
  return useQuery<ReferentComboDto[], Error, ReferentComboDto[], readonly ['lookups', 'referents']>({
    queryKey: queryKeys.referents,
    queryFn: async () => api.lookup.getReferents(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * SP 5: ND dokumenti
 */
export const useDocumentsND = (): UseQueryResult<ReferenceDocumentComboDto[], unknown> => {
  return useQuery<ReferenceDocumentComboDto[], Error, ReferenceDocumentComboDto[], readonly ['lookups', 'documentsND']>({
    queryKey: queryKeys.documentsND,
    queryFn: async () => api.lookup.getReferenceDocuments('ND'),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * SP 6: Poreske stope
 */
export const useTaxRates = (): UseQueryResult<TaxRateComboDto[], unknown> => {
  return useQuery<TaxRateComboDto[], Error, TaxRateComboDto[], readonly ['lookups', 'taxRates']>({
    queryKey: queryKeys.taxRates,
    queryFn: async () => api.lookup.getTaxRates(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * SP 7: Artikli
 */
export const useArticles = (): UseQueryResult<ArticleComboDto[], unknown> => {
  return useQuery<ArticleComboDto[], Error, ArticleComboDto[], readonly ['lookups', 'articles']>({
    queryKey: queryKeys.articles,
    queryFn: async () => api.lookup.getArticles(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * SP 8: Troskovi za dokument
 */
export const useDocumentCosts = (
  documentId: number
): UseQueryResult<DocumentCostDto[], unknown> => {
  return useQuery<DocumentCostDto[], Error, DocumentCostDto[], readonly ['lookups', 'documentCosts', number]>({
    queryKey: queryKeys.documentCosts(documentId),
    queryFn: async () => api.cost.list(documentId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!documentId, // Samo ako je documentId proslezen
  });
};

/**
 * SP 9: Vrste troskova
 */
export const useCostTypes = (): UseQueryResult<CostTypeComboDto[], unknown> => {
  return useQuery<CostTypeComboDto[], Error, CostTypeComboDto[], readonly ['lookups', 'costTypes']>({
    queryKey: queryKeys.costTypes,
    queryFn: async () => api.lookup.getCostTypes(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * SP 10: Nacini deljenja troskova (1, 2, 3)
 */
export const useCostDistributionMethods = (): UseQueryResult<
  CostDistributionMethodComboDto[],
  unknown
> => {
  return useQuery<CostDistributionMethodComboDto[], Error, CostDistributionMethodComboDto[], readonly ['lookups', 'costDistributionMethods']>({
    queryKey: queryKeys.costDistributionMethods,
    queryFn: async () => api.lookup.getCostDistributionMethods(),
    staleTime: Infinity, // Nikad se ne menja
    gcTime: Infinity,
  });
};

/**
 * SP 11: Artikli iz stavki dokumenta za raspodelu troskova
 */
export const useCostArticles = (
  documentId: number
): UseQueryResult<DocumentLineItemDto[], unknown> => {
  return useQuery<DocumentLineItemDto[], Error, DocumentLineItemDto[], readonly ['lookups', 'costArticles', number]>({
    queryKey: queryKeys.costArticles(documentId),
    queryFn: async () => api.lineItem.list(documentId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!documentId,
  });
};

// ==========================================
// COMBO HOOK - SVE ODJEDNOM (za initial load)
// ==========================================

export interface AllCombos {
  partners: PartnerComboDto[];
  orgUnits: OrganizationalUnitComboDto[];
  taxationMethods: TaxationMethodComboDto[];
  referents: ReferentComboDto[];
  documentsND: ReferenceDocumentComboDto[];
  taxRates: TaxRateComboDto[];
  articles: ArticleComboDto[];
  costTypes: CostTypeComboDto[];
  costDistributionMethods: CostDistributionMethodComboDto[];
}

export const useAllCombos = (
  docTypeId: string = 'UR'
): UseQueryResult<AllCombos, unknown> => {
  return useQuery<AllCombos, Error, AllCombos, readonly ['lookups', 'all', string]>({
    queryKey: ['lookups', 'all', docTypeId] as const,
    queryFn: async () => {
      const [
        partners,
        orgUnits,
        taxationMethods,
        referents,
        documentsND,
        taxRates,
        articles,
        costTypes,
        costDistributionMethods,
      ] = await Promise.all([
        api.lookup.getPartners(),
        api.lookup.getOrganizationalUnits(docTypeId),
        api.lookup.getTaxationMethods(),
        api.lookup.getReferents(),
        api.lookup.getReferenceDocuments('ND'),
        api.lookup.getTaxRates(),
        api.lookup.getArticles(),
        api.lookup.getCostTypes(),
        api.lookup.getCostDistributionMethods(),
      ]);

      return {
        partners,
        orgUnits,
        taxationMethods,
        referents,
        documentsND,
        taxRates,
        articles,
        costTypes,
        costDistributionMethods,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
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
