import apiClient, { buildUrl, withETag } from './client';
import type {
  // Lookup/Combo
  PartnerComboDto,
  OrganizationalUnitComboDto,
  TaxationMethodComboDto,
  ReferentComboDto,
  ReferenceDocumentComboDto,
  TaxRateComboDto,
  ArticleComboDto,
  CostTypeComboDto,
  CostDistributionMethodComboDto,
  // Documents
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentDto,
  PagedResponse,
  // Line Items
  CreateDocumentLineItemDto,
  PatchDocumentLineItemDto,
  DocumentLineItemDto,
  // Costs
  CreateDocumentCostDto,
  UpdateDocumentCostDto,
  DocumentCostDto,
  CreateDocumentCostItemDto,
  PatchDocumentCostItemDto,
  DocumentCostItemDto,
} from '../types/api.types';

// ============================================================================
// LOOKUP/COMBO ENDPOINTS
// ============================================================================

export const lookupApi = {
  /**
   * GET /api/v1/lookups/partners
   * Stored Procedure: spPartnerComboStatusNabavka
   */
  getPartners: async (): Promise<PartnerComboDto[]> => {
    const response = await apiClient.get<PartnerComboDto[]>('/lookups/partners');
    return response.data;
  },

  /**
   * GET /api/v1/lookups/organizational-units?documentType=UR
   * Stored Procedure: spOrganizacionaJedinicaCombo
   */
  getOrganizationalUnits: async (documentType?: string): Promise<OrganizationalUnitComboDto[]> => {
    const url = buildUrl('/lookups/organizational-units', { documentType });
    const response = await apiClient.get<OrganizationalUnitComboDto[]>(url);
    return response.data;
  },

  /**
   * GET /api/v1/lookups/taxation-methods
   * Stored Procedure: spNacinOporezivanjaComboNabavka
   */
  getTaxationMethods: async (): Promise<TaxationMethodComboDto[]> => {
    const response = await apiClient.get<TaxationMethodComboDto[]>('/lookups/taxation-methods');
    return response.data;
  },

  /**
   * GET /api/v1/lookups/referents
   * Stored Procedure: spReferentCombo
   */
  getReferents: async (): Promise<ReferentComboDto[]> => {
    const response = await apiClient.get<ReferentComboDto[]>('/lookups/referents');
    return response.data;
  },

  /**
   * GET /api/v1/lookups/reference-documents?type=ND
   * Stored Procedure: spDokumentNDCombo
   */
  getReferenceDocuments: async (type: string = 'ND'): Promise<ReferenceDocumentComboDto[]> => {
    const url = buildUrl('/lookups/reference-documents', { type });
    const response = await apiClient.get<ReferenceDocumentComboDto[]>(url);
    return response.data;
  },

  /**
   * GET /api/v1/lookups/tax-rates
   * Stored Procedure: spPoreskaStopaCombo
   */
  getTaxRates: async (): Promise<TaxRateComboDto[]> => {
    const response = await apiClient.get<TaxRateComboDto[]>('/lookups/tax-rates');
    return response.data;
  },

  /**
   * GET /api/v1/lookups/articles
   * Stored Procedure: spArtikalComboUlaz
   */
  getArticles: async (): Promise<ArticleComboDto[]> => {
    const response = await apiClient.get<ArticleComboDto[]>('/lookups/articles');
    return response.data;
  },

  /**
   * GET /api/v1/lookups/cost-types
   * Stored Procedure: spUlazniRacuniIzvedeniTroskoviCombo
   */
  getCostTypes: async (): Promise<CostTypeComboDto[]> => {
    const response = await apiClient.get<CostTypeComboDto[]>('/lookups/cost-types');
    return response.data;
  },

  /**
   * GET /api/v1/lookups/cost-distribution-methods
   * Stored Procedure: spNacinDeljenjaTroskovaCombo
   */
  getCostDistributionMethods: async (): Promise<CostDistributionMethodComboDto[]> => {
    const response = await apiClient.get<CostDistributionMethodComboDto[]>(
      '/lookups/cost-distribution-methods'
    );
    return response.data;
  },
};

// ============================================================================
// DOCUMENT ENDPOINTS
// ============================================================================

export const documentApi = {
  /**
   * POST /api/v1/documents
   */
  create: async (data: CreateDocumentDto): Promise<DocumentDto> => {
    const response = await apiClient.post<DocumentDto>('/documents', data);
    return response.data;
  },

  /**
   * GET /api/v1/documents?pageNumber=1&pageSize=20
   */
  list: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    documentType?: string;
    partnerId?: number;
    dateFrom?: string;
    dateTo?: string;
    statusId?: number;
  }): Promise<PagedResponse<DocumentDto>> => {
    const url = buildUrl('/documents', params);
    const response = await apiClient.get<PagedResponse<DocumentDto>>(url);
    return response.data;
  },

  /**
   * GET /api/v1/documents/{id}
   */
  get: async (id: number): Promise<DocumentDto> => {
    const response = await apiClient.get<DocumentDto>(`/documents/${id}`);
    return response.data;
  },

  /**
   * PUT /api/v1/documents/{id}
   * Requires If-Match header with ETag
   */
  update: async (id: number, data: UpdateDocumentDto, etag: string): Promise<DocumentDto> => {
    const response = await apiClient.put<DocumentDto>(
      `/documents/${id}`,
      data,
      withETag(etag)
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/documents/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};

// ============================================================================
// DOCUMENT LINE ITEMS ENDPOINTS
// ============================================================================

export const documentLineItemApi = {
  /**
   * POST /api/v1/documents/{documentId}/items
   */
  create: async (
    documentId: number,
    data: CreateDocumentLineItemDto
  ): Promise<DocumentLineItemDto> => {
    const response = await apiClient.post<DocumentLineItemDto>(
      `/documents/${documentId}/items`,
      data
    );
    return response.data;
  },

  /**
   * GET /api/v1/documents/{documentId}/items
   */
  list: async (documentId: number): Promise<DocumentLineItemDto[]> => {
    const response = await apiClient.get<DocumentLineItemDto[]>(
      `/documents/${documentId}/items`
    );
    return response.data;
  },

  /**
   * GET /api/v1/documents/{documentId}/items/{itemId}
   */
  get: async (documentId: number, itemId: number): Promise<DocumentLineItemDto> => {
    const response = await apiClient.get<DocumentLineItemDto>(
      `/documents/${documentId}/items/${itemId}`
    );
    return response.data;
  },

  /**
   * PATCH /api/v1/documents/{documentId}/items/{itemId}
   * Requires If-Match header with ETag
   * KRITIČNO: Ovo je autosave funkcionalnost!
   */
  patch: async (
    documentId: number,
    itemId: number,
    data: PatchDocumentLineItemDto,
    etag: string
  ): Promise<DocumentLineItemDto> => {
    const response = await apiClient.patch<DocumentLineItemDto>(
      `/documents/${documentId}/items/${itemId}`,
      data,
      withETag(etag)
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/documents/{documentId}/items/{itemId}
   */
  delete: async (documentId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}/items/${itemId}`);
  },
};

// ============================================================================
// DOCUMENT COSTS ENDPOINTS
// ============================================================================

export const documentCostApi = {
  /**
   * POST /api/v1/documents/{documentId}/costs
   */
  create: async (documentId: number, data: CreateDocumentCostDto): Promise<DocumentCostDto> => {
    const response = await apiClient.post<DocumentCostDto>(
      `/documents/${documentId}/costs`,
      data
    );
    return response.data;
  },

  /**
   * GET /api/v1/documents/{documentId}/costs
   * Stored Procedure: spDokumentTroskoviLista
   */
  list: async (documentId: number): Promise<DocumentCostDto[]> => {
    const response = await apiClient.get<DocumentCostDto[]>(`/documents/${documentId}/costs`);
    return response.data;
  },

  /**
   * GET /api/v1/documents/{documentId}/costs/{costId}
   */
  get: async (documentId: number, costId: number): Promise<DocumentCostDto> => {
    const response = await apiClient.get<DocumentCostDto>(
      `/documents/${documentId}/costs/${costId}`
    );
    return response.data;
  },

  /**
   * PUT /api/v1/documents/{documentId}/costs/{costId}
   * Requires If-Match header with ETag
   */
  update: async (
    documentId: number,
    costId: number,
    data: UpdateDocumentCostDto,
    etag: string
  ): Promise<DocumentCostDto> => {
    const response = await apiClient.put<DocumentCostDto>(
      `/documents/${documentId}/costs/${costId}`,
      data,
      withETag(etag)
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/documents/{documentId}/costs/{costId}
   */
  delete: async (documentId: number, costId: number): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}/costs/${costId}`);
  },
};

// ============================================================================
// DOCUMENT COST ITEMS ENDPOINTS
// ============================================================================

export const documentCostItemApi = {
  /**
   * POST /api/v1/documents/{documentId}/costs/{costId}/items
   */
  create: async (
    documentId: number,
    costId: number,
    data: CreateDocumentCostItemDto
  ): Promise<DocumentCostItemDto> => {
    const response = await apiClient.post<DocumentCostItemDto>(
      `/documents/${documentId}/costs/${costId}/items`,
      data
    );
    return response.data;
  },

  /**
   * GET /api/v1/documents/{documentId}/costs/{costId}/items
   */
  list: async (documentId: number, costId: number): Promise<DocumentCostItemDto[]> => {
    const response = await apiClient.get<DocumentCostItemDto[]>(
      `/documents/${documentId}/costs/${costId}/items`
    );
    return response.data;
  },

  /**
   * GET /api/v1/documents/{documentId}/costs/{costId}/items/{itemId}
   */
  get: async (
    documentId: number,
    costId: number,
    itemId: number
  ): Promise<DocumentCostItemDto> => {
    const response = await apiClient.get<DocumentCostItemDto>(
      `/documents/${documentId}/costs/${costId}/items/${itemId}`
    );
    return response.data;
  },

  /**
   * PATCH /api/v1/documents/{documentId}/costs/{costId}/items/{itemId}
   * Requires If-Match header with ETag
   */
  patch: async (
    documentId: number,
    costId: number,
    itemId: number,
    data: PatchDocumentCostItemDto,
    etag: string
  ): Promise<DocumentCostItemDto> => {
    const response = await apiClient.patch<DocumentCostItemDto>(
      `/documents/${documentId}/costs/${costId}/items/${itemId}`,
      data,
      withETag(etag)
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/documents/{documentId}/costs/{costId}/items/{itemId}
   */
  delete: async (documentId: number, costId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}/costs/${costId}/items/${itemId}`);
  },

  /**
   * POST /api/v1/documents/{documentId}/costs/{costId}/distribute
   * Primeni raspodelu troškova na stavke dokumenta
   */
  distribute: async (
    documentId: number,
    costId: number,
    data: { itemId: number; recalculate: boolean }
  ): Promise<{
    success: boolean;
    message: string;
    distributedAmount: number;
    affectedLineItems: number;
  }> => {
    const response = await apiClient.post(
      `/documents/${documentId}/costs/${costId}/distribute`,
      data
    );
    return response.data;
  },
};

// ============================================================================
// EXPORT ALL APIs
// ============================================================================

export default {
  lookup: lookupApi,
  document: documentApi,
  lineItem: documentLineItemApi,
  cost: documentCostApi,
  costItem: documentCostItemApi,
};
