import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  PartnerCombo,
  OrgUnitCombo,
  TaxationMethodCombo,
  ReferentCombo,
  DocumentNDCombo,
  TaxRateCombo,
  ArticleCombo,
  DocumentCostsListDto,
  CostTypeCombo,
  CostDistributionMethodCombo,
  CostArticleCombo,
} from '../types';
import { api } from '../api';  // FIXED: Import from index.ts instead of endpoints.ts

/**
 * Custom hook za sve 11 Stored Procedures
 * Koristi React Query za kesiranje i automatsku invalidaciju
 */

// ==========================================
// QUERY KEYS
// ==========================================

const queryKeys = {
  partners: ['lookups', 'partners'],
  orgUnits: (docTypeId: string) => ['lookups', 'orgUnits', docTypeId],
  taxationMethods: ['lookups', 'taxationMethods'],
  referents: ['lookups', 'referents'],
  documentsND: ['lookups', 'documentsND'],
  taxRates: ['lookups', 'taxRates'],
  articles: ['lookups', 'articles'],
  documentCosts: (documentId: number) => ['lookups', 'documentCosts', documentId],
  costTypes: ['lookups', 'costTypes'],
  costDistributionMethods: ['lookups', 'costDistributionMethods'],
  costArticles: (documentId: number) => ['lookups', 'costArticles', documentId],
};

// ==========================================
// INDIVIDUAL HOOKS
// ==========================================

/**
 * SP 1: Svi partneri
 */
export const usePartners = (): UseQueryResult<PartnerCombo[], unknown> => {
  return useQuery({
    queryKey: queryKeys.partners,
    queryFn: async () => api.lookup.getPartners(),
    staleTime: 5 * 60 * 1000, // 5 minuta
    gcTime: 30 * 60 * 1000, // 30 minuta (staro cacheTime)
  });
};

/**
 * SP 2: Org. jedinice za vrstu dokumenta
 */
export const useOrgUnits = (
  docTypeId: string = 'UR'
): UseQueryResult<OrgUnitCombo[], unknown> => {
  return useQuery({
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
  TaxationMethodCombo[],
  unknown
> => {
  return useQuery({
    queryKey: queryKeys.taxationMethods,
    queryFn: async () => api.lookup.getTaxationMethods(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * SP 4: Referenti (zaposleni)
 */
export const useReferents = (): UseQueryResult<ReferentCombo[], unknown> => {
  return useQuery({
    queryKey: queryKeys.referents,
    queryFn: async () => api.lookup.getReferents(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * SP 5: ND dokumenti
 */
export const useDocumentsND = (): UseQueryResult<DocumentNDCombo[], unknown> => {
  return useQuery({
    queryKey: queryKeys.documentsND,
    queryFn: async () => api.lookup.getReferenceDocuments('ND'),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * SP 6: Poreske stope
 */
export const useTaxRates = (): UseQueryResult<TaxRateCombo[], unknown> => {
  return useQuery({
    queryKey: queryKeys.taxRates,
    queryFn: async () => api.lookup.getTaxRates(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * SP 7: Artikli
 */
export const useArticles = (): UseQueryResult<ArticleCombo[], unknown> => {
  return useQuery({
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
): UseQueryResult<DocumentCostsListDto[], unknown> => {
  return useQuery({
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
export const useCostTypes = (): UseQueryResult<CostTypeCombo[], unknown> => {
  return useQuery({
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
  CostDistributionMethodCombo[],
  unknown
> => {
  return useQuery({
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
): UseQueryResult<CostArticleCombo[], unknown> => {
  return useQuery({
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
  partners: PartnerCombo[];
  orgUnits: OrgUnitCombo[];
  taxationMethods: TaxationMethodCombo[];
  referents: ReferentCombo[];
  documentsND: DocumentNDCombo[];
  taxRates: TaxRateCombo[];
  articles: ArticleCombo[];
  costTypes: CostTypeCombo[];
  costDistributionMethods: CostDistributionMethodCombo[];
}

export const useAllCombos = (
  docTypeId: string = 'UR'
): UseQueryResult<AllCombos, unknown> => {
  return useQuery({
    queryKey: ['lookups', 'all', docTypeId],
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
