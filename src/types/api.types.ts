// ============================================================================
// LOOKUP/COMBO TYPES - Backend Stored Procedures Results
// ============================================================================

export interface PartnerComboDto {
  id: number;
  code: string;
  name: string;
  city: string;
  statusId: number;
  statusName: string;
  taxationMethodId: number;
  calculateExcise: boolean;
  calculateTax: boolean;
  referentId: number | null;
}

export interface OrganizationalUnitComboDto {
  id: number;
  code: string;
  name: string;
  city: string;
}

export interface TaxationMethodComboDto {
  id: number;
  description: string;
  calculateExcise: boolean;
  calculateTax: boolean;
  calculateAuxiliaryTax: boolean;
}

export interface ReferentComboDto {
  id: number;
  code: string;
  fullName: string;
}

export interface ReferenceDocumentComboDto {
  id: number;
  documentNumber: string;
  date: string;
  partnerName: string;
}

export interface TaxRateComboDto {
  id: string; // char(2) - "01", "02", "03"
  name: string;
  percentage: number;
}

export interface ArticleComboDto {
  id: number;
  code: string;
  name: string;
  unitOfMeasure: string;
  taxRateId: string;
  taxRatePercentage: number;
  excisePerUnit: number;
  quantityCoefficient: number;
  hasLot: boolean;
  purchasePrice: number;
  isAgriculturalProduct: boolean;
}

export interface CostTypeComboDto {
  id: number;
  name: string;
  description: string;
  specificationName: string;
  calculateTax: boolean;
  basicCostTypeId: number;
}

export interface CostDistributionMethodComboDto {
  id: number;
  name: string;
  description: string;
}

// ============================================================================
// DOCUMENT DTOs
// ============================================================================

export interface CreateDocumentDto {
  documentTypeCode: string; // "UR", "ND", "OT"...
  documentNumber: string;
  date: string; // ISO 8601
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
  etag: string; // Base64 RowVersion
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
  etag: string; // Base64 RowVersion
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
