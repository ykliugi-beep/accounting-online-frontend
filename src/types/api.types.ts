// ============================================================================
// LOOKUP/COMBO TYPES - Backend Stored Procedures Results
// IMPORTANT: Property names match backend C# DTOs (PascalCase)
// Backend uses System.Text.Json with default camelCase serialization
// ============================================================================

export interface PartnerComboDto {
  idPartner: number;
  nazivPartnera: string;
  mesto: string | null;
  opis: string | null;
  idStatus: number;
  idNacinOporezivanjaNabavka: number | null;
  obracunAkciza: number;
  obracunPorez: number;
  idReferent: number | null;
  sifraPartner: string | null;
  id?: number;
  code?: string;
  name?: string;
  city?: string;
  statusName?: string;
}

export interface OrganizationalUnitComboDto {
  idOrganizacionaJedinica: number;
  naziv: string;
  mesto: string | null;
  sifra: string | null;
  id?: number;
  name?: string;
  code?: string;
  city?: string;
}

export interface TaxationMethodComboDto {
  idNacinOporezivanja: number;
  opis: string;
  obracunAkciza: number;
  obracunPorez: number;
  obracunPorezPomocni: number;
  id?: number;
  description?: string;
  calculateExcise?: boolean;
  calculateTax?: boolean;
}

export interface ReferentComboDto {
  idRadnik: number;
  imePrezime: string;
  sifraRadnika: string | null;
  imeRadnika?: string;
  id?: number;
  fullName?: string;
  code?: string;
}

export interface ReferenceDocumentComboDto {
  idDokument: number;
  brojDokumenta: string;
  datum: string;
  nazivPartnera: string;
  id?: number;
  documentNumber?: string;
  date?: string;
  partnerName?: string;
}

export interface TaxRateComboDto {
  idPoreskaStopa: string;
  naziv: string;
  procenat?: number;
  procenatPoreza?: number;
  id?: string;
  name?: string;
  percentage?: number;
}

export interface ArticleComboDto {
  idArtikal: number;
  sifraArtikal: string;
  nazivArtikla: string;
  jedinicaMere: string | null;
  idPoreskaStopa: string | null;
  procenatPoreza: number;
  akciza: number;
  koeficijentKolicine: number;
  imaLot: boolean;
  otkupnaCena: number | null;
  poljoprivredniProizvod: boolean;
  id?: number;
  code?: string;
  name?: string;
  unitOfMeasure?: string;
}

export interface CostTypeComboDto {
  idUlazniRacuniIzvedeni: number;
  naziv: string;
  opis: string | null;
  nazivSpecifikacije: string | null;
  obracunPorez: number;
  idUlazniRacuniOsnovni: number;
}

export interface CostDistributionMethodComboDto {
  idNacinDeljenjaTroskova: number;
  naziv: string;
  opisNacina: string;
}

// ============================================================================
// DOCUMENT DTOs
// ============================================================================

export interface CreateDocumentDto {
  documentTypeCode: string;
  documentNumber: string;
  date: string;
  partnerId: number | null;
  organizationalUnitId: number;
  referentId: number | null;
  dueDate: string | null;
  currencyDate: string | null;
  partnerDocumentNumber: string | null;
  partnerDocumentDate: string | null;
  taxationMethodId: number | null;
  statusId: number | null;
  currencyId: number | null;
  exchangeRate: number | null;
  notes: string | null;
}

export interface UpdateDocumentDto extends CreateDocumentDto {}

export interface DocumentDto {
  id: number;
  documentTypeCode: string;
  documentNumber: string;
  date: string;
  partnerId: number | null;
  partnerName: string | null;
  organizationalUnitId: number;
  organizationalUnitName: string;
  referentId: number | null;
  referentName: string | null;
  dueDate: string | null;
  currencyDate: string | null;
  partnerDocumentNumber: string | null;
  partnerDocumentDate: string | null;
  taxationMethodId: number | null;
  statusId: number | null;
  currencyId: number | null;
  exchangeRate: number | null;
  notes: string | null;
  totalAmountNet: number;
  totalAmountVat: number;
  totalAmountGross: number;
  dependentCostsNet: number;
  dependentCostsVat: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  etag: string;
}

// ============================================================================
// DOCUMENT SEARCH DTOs
// ============================================================================

export interface DocumentSearchDto {
  documentNumber?: string;
  partnerId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  statusId?: number | null;
  documentTypeCode?: string;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Backend returns PaginatedResult<DocumentDto> - with computed pagination helpers
export interface DocumentSearchResultDto {
  documents: DocumentDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

// ============================================================================
// DOCUMENT LINE ITEM DTOs
// ============================================================================

export interface CreateDocumentLineItemDto {
  articleId: number;
  quantity: number;
  invoicePrice: number;
  discount: number;
  taxRateId: string;
  taxRatePercentage: number;
  unitOfMeasure: string;
  statusId: number | null;
  notes: string | null;
}

export interface PatchDocumentLineItemDto {
  quantity?: number;
  invoicePrice?: number;
  discount?: number;
  margin?: number;
  taxRateId?: string;
  taxRatePercentage?: number;
  unitOfMeasure?: string;
  statusId?: number;
  notes?: string;
}

export interface DocumentLineItemDto {
  id: number;
  documentId: number;
  articleId: number;
  articleCode: string;
  articleName: string;
  quantity: number;
  invoicePrice: number;
  discount: number;
  taxRateId: string;
  taxRatePercentage: number;
  vatAmount: number;
  totalAmount: number;
  unitOfMeasure: string;
  statusId: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  etag: string;
}

// ============================================================================
// DOCUMENT COST DTOs
// ============================================================================

export interface CreateDocumentCostDto {
  partnerId: number;
  documentTypeCode: string;
  documentNumber: string;
  dueDate: string;
  currencyDate: string | null;
  description: string | null;
  statusId: number;
  currencyId: number | null;
  exchangeRate: number | null;
}

export interface UpdateDocumentCostDto extends CreateDocumentCostDto {}

export interface CostItemVatDto {
  taxRateId: string;
  vatAmount: number;
}

export interface CreateDocumentCostItemDto {
  costTypeId: number;
  distributionMethodId: number;
  amount: number;
  applyToAllItems: boolean;
  statusId: number;
  calculateTaxOnCost: boolean;
  addVatToCost: boolean;
  currencyAmount: number | null;
  cashAmount: number | null;
  cardAmount: number | null;
  wireTransferAmount: number | null;
  quantity: number | null;
  vatItems: CostItemVatDto[];
}

export interface PatchDocumentCostItemDto {
  costTypeId?: number;
  distributionMethodId?: number;
  amount?: number;
  applyToAllItems?: boolean;
  statusId?: number;
  calculateTaxOnCost?: boolean;
  addVatToCost?: boolean;
  currencyAmount?: number;
  cashAmount?: number;
  cardAmount?: number;
  wireTransferAmount?: number;
  quantity?: number;
}

export interface CostItemVatResponseDto {
  id: number;
  taxRateId: string;
  taxRateName: string;
  taxRatePercent: number;
  vatAmount: number;
}

export interface DocumentCostItemDto {
  id: number;
  documentCostId: number;
  costTypeId: number;
  costTypeName: string;
  distributionMethodId: number;
  distributionMethodName: string;
  amount: number;
  applyToAllItems: boolean;
  statusId: number;
  calculateTaxOnCost: boolean;
  addVatToCost: boolean;
  currencyAmount: number | null;
  cashAmount: number | null;
  cardAmount: number | null;
  wireTransferAmount: number | null;
  quantity: number | null;
  totalVat: number;
  vatItems: CostItemVatResponseDto[];
  etag: string;
}

export interface DocumentCostDto {
  id: number;
  documentId: number;
  partnerId: number;
  partnerName: string;
  documentTypeCode: string;
  documentNumber: string;
  dueDate: string;
  currencyDate: string | null;
  description: string | null;
  statusId: number;
  currencyId: number | null;
  exchangeRate: number | null;
  totalAmountNet: number;
  totalAmountVat: number;
  items: DocumentCostItemDto[];
  etag: string;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ============================================================================
// API ERROR RESPONSE
// ============================================================================

export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  message?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

export interface ItemSaveState {
  id: number;
  status: SaveStatus;
  error: string | null;
  etag: string;
}

export interface CostSaveState {
  id: number;
  status: SaveStatus;
  error: string | null;
  etag: string;
}
