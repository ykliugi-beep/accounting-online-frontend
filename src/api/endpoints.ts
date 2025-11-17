/**
 * API Endpoint funkcije - sve CRUD operacije
 * Koriste apiClient sa ETag i JWT podrškom
 */

import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from './client';
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
  DocumentLineItem,
  DocumentLineItemCreateDto,
  DocumentLineItemPatchDto,
  DocumentLineItemList,
} from '../types';

// ==========================================
// LOOKUPS - 11 Stored Procedures
// ==========================================

export const lookupsApi = {
  /**
   * SP 1: spPartnerComboStatusNabavka
   * GET /api/v1/lookups/partners
   */
  getPartners: () =>
    apiGet<PartnerCombo[]>('/lookups/partners'),

  /**
   * SP 2: spOrganizacionaJedinicaCombo
   * GET /api/v1/lookups/organizational-units?docTypeId=UR
   */
  getOrgUnits: (docTypeId: string = 'UR') =>
    apiGet<OrgUnitCombo[]>('/lookups/organizational-units', { docTypeId }),

  /**
   * SP 3: spNacinOporezivanjaComboNabavka
   * GET /api/v1/lookups/taxation-methods
   */
  getTaxationMethods: () =>
    apiGet<TaxationMethodCombo[]>('/lookups/taxation-methods'),

  /**
   * SP 4: spReferentCombo
   * GET /api/v1/lookups/referents
   */
  getReferents: () =>
    apiGet<ReferentCombo[]>('/lookups/referents'),

  /**
   * SP 5: spDokumentNDCombo
   * GET /api/v1/lookups/documents-nd
   */
  getDocumentsND: () =>
    apiGet<DocumentNDCombo[]>('/lookups/documents-nd'),

  /**
   * SP 6: spPoreskaStopaCombo
   * GET /api/v1/lookups/tax-rates
   */
  getTaxRates: () =>
    apiGet<TaxRateCombo[]>('/lookups/tax-rates'),

  /**
   * SP 7: spArtikalComboUlaz
   * GET /api/v1/lookups/articles
   */
  getArticles: () =>
    apiGet<ArticleCombo[]>('/lookups/articles'),

  /**
   * SP 8: spDokumentTroskoviLista
   * GET /api/v1/lookups/document-costs/{documentId}
   */
  getDocumentCosts: (documentId: number) =>
    apiGet<DocumentCostsListDto[]>(`/lookups/document-costs/${documentId}`),

  /**
   * SP 9: spUlazniRacuniIzvedeniTroskoviCombo
   * GET /api/v1/lookups/cost-types
   */
  getCostTypes: () =>
    apiGet<CostTypeCombo[]>('/lookups/cost-types'),

  /**
   * SP 10: spNacinDeljenjaTroskovaCombo
   * GET /api/v1/lookups/cost-distribution-methods
   */
  getCostDistributionMethods: () =>
    apiGet<CostDistributionMethodCombo[]>('/lookups/cost-distribution-methods'),

  /**
   * SP 11: spDokumentTroskoviArtikliCOMBO
   * GET /api/v1/lookups/cost-articles/{documentId}
   */
  getCostArticles: (documentId: number) =>
    apiGet<CostArticleCombo[]>(`/lookups/cost-articles/${documentId}`),
};

// ==========================================
// DOCUMENT LINE ITEMS - CRUD sa ETag
// ==========================================

export const itemsApi = {
  /**
   * GET /api/v1/documents/{documentId}/items
   * Vrati sve stavke dokumenta
   */
  getItems: (documentId: number) =>
    apiGet<DocumentLineItemList[]>(`/documents/${documentId}/items`),

  /**
   * GET /api/v1/documents/{documentId}/items/{itemId}
   * Vrati jednu stavku sa ETag header-om
   * Response header: ETag: "{BASE64_ROWVERSION}"
   */
  getItem: (documentId: number, itemId: number) =>
    apiGet<DocumentLineItem>(`/documents/${documentId}/items/${itemId}`),

  /**
   * POST /api/v1/documents/{documentId}/items
   * Kreiraj novu stavku
   * Response: 201 Created sa ETag u header-u
   */
  createItem: (documentId: number, data: DocumentLineItemCreateDto) =>
    apiPost<DocumentLineItem>(`/documents/${documentId}/items`, data),

  /**
   * PATCH /api/v1/documents/{documentId}/items/{itemId}
   * Ažuriranja stavke sa ETag konkurentnosti
   *
   * OBAVEZNO: eTag mora biti prosleđen!
   * If-Match header: "{eTag}"  (OBAVEZNO navodnici!)
   *
   * Odgovori:
   * 200 OK - Uspešno ažuriranje, novi ETag u response
   * 409 Conflict - RowVersion mismatch, stavka promenjena od drugog korisnika
   * 400 Bad Request - Missing If-Match header
   * 404 Not Found - Stavka ne postoji
   */
  updateItem: (
    documentId: number,
    itemId: number,
    data: DocumentLineItemPatchDto,
    eTag: string
  ) =>
    apiPatch<DocumentLineItem>(
      `/documents/${documentId}/items/${itemId}`,
      data,
      eTag
    ),

  /**
   * DELETE /api/v1/documents/{documentId}/items/{itemId}
   * Obriši stavku (soft delete)
   * Response: 204 No Content
   */
  deleteItem: (documentId: number, itemId: number) =>
    apiDelete(`/documents/${documentId}/items/${itemId}`),
};

/**
 * Kombo API objekta sa svim endpointima
 */
export const api = {
  lookups: lookupsApi,
  items: itemsApi,
};

export default api;
