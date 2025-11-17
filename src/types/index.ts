/**
 * Backend DTO/Entity tipovi - OBAVEZNO bez 'any'
 * Svi tipovi direktno mapirani sa backend DTOs
 */

// ==========================================
// LOOKUPS / COMBO TIPOVI (11 Stored Procedures)
// ==========================================

export interface PartnerCombo {
  idPartner: number;
  nazivPartnera: string;
  mesto?: string;
  sifra?: string;
  status: number;
}

export interface OrgUnitCombo {
  idOrganizacionaJedinica: number;
  naziv: string;
  mesto?: string;
  sifra?: string;
}

export interface TaxationMethodCombo {
  idNacinOporezivanja: number;
  opis: string;
  obracunAkciza: number;
  obracunPorez: number;
}

export interface ReferentCombo {
  idRadnik: number;
  imeRadnika: string;
  sifraRadnika?: string;
}

export interface DocumentNDCombo {
  idDokument: number;
  brojDokumenta: string;
  datum: string; // ISO datetime
  nazivPartnera: string;
}

export interface TaxRateCombo {
  idPoreskaStopa: string;
  naziv: string;
  procenatPDV: number;
}

export interface ArticleCombo {
  idArtikal: number;
  sifraArtikal: string;
  nazivArtikla: string;
  jedinicaMere?: string;
  nabavnaCena?: number;
}

export interface DocumentCostsListDto {
  idDokumentTroskovi: number;
  idDokument: number;
  idPartner?: number;
  idVrstaDokumenta?: string;
  brojDokumenta?: string;
  datumDPO?: string;
  opis?: string;
}

export interface CostTypeCombo {
  idUlazniRacuniIzvedeni: number;
  naziv: string;
  opis?: string;
}

export interface CostDistributionMethodCombo {
  id: number; // 1, 2, 3
  naziv: string;
  opis: string;
}

export interface CostArticleCombo {
  idStavkaDokumenta: number;
  sifraArtikal: string;
  nazivArtikla: string;
  kolicina: number;
}

// ==========================================
// LINE ITEM TIPOVI
// ==========================================

export interface DocumentLineItemCreateDto {
  articleId: number;
  quantity: number;
  invoicePrice: number;
  discountAmount?: number;
  marginAmount?: number;
  taxRateId?: string;
  calculateExcise?: boolean;
  calculateTax?: boolean;
  description?: string;
  organizationalUnitId?: number;
}

export interface DocumentLineItemPatchDto {
  quantity?: number;
  invoicePrice?: number;
  discountAmount?: number;
  marginAmount?: number;
  taxRateId?: string;
  calculateExcise?: boolean;
  calculateTax?: boolean;
  description?: string;
}

export interface DocumentLineItem {
  id: number;
  documentId: number;
  articleId: number;
  quantity: number;
  invoicePrice: number;
  discountAmount?: number;
  marginAmount?: number;
  taxRateId?: string;
  taxPercent?: number;
  taxAmount?: number;
  total?: number;
  calculateExcise: boolean;
  calculateTax: boolean;
  description?: string;
  // ==========================================
  // KONKURENTNOST - OBAVEZNO!
  eTag: string; // Base64(RowVersion)
  // ==========================================
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  createdBy?: number;
  updatedBy?: number;
}

export interface DocumentLineItemList {
  id: number;
  documentId: number;
  articleId: number;
  quantity: number;
  invoicePrice: number;
  total?: number;
  taxAmount?: number;
  calculateTax: boolean;
  eTag: string;
  updatedAt: string;
}

// ==========================================
// DOCUMENT DETAIL TIPOVI
// ==========================================

export interface DocumentDetails {
  id: number;
  documentNumber: string;
  documentDate: string; // ISO date
  partnerName?: string;
  status?: string;
  currency?: string;
  totalAmount?: number;
  notes?: string;
}

export interface DependentCost {
  id: number;
  description: string;
  amount: number;
  method?: string;
  referenceDocument?: string;
}

// ==========================================
// API RESPONSE TIPOVI
// ==========================================

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==========================================
// ERROR TIPOVI
// ==========================================

export interface ConflictErrorResponse {
  message: string;
  detail?: string;
  currentETag?: string;
  timestamp?: string;
}

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

// ==========================================
// AUTOSAVE STATE TIPOVI
// ==========================================

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ItemAutoSaveState {
  id: number;
  status: AutoSaveStatus;
  error?: string;
  lastSavedAt?: string;
  eTag: string; // Uvek čuvaj najnoviji ETag
}

export interface AutoSaveStateMap {
  [itemId: number]: ItemAutoSaveState;
}

// ==========================================
// CONFLICT RESOLUTION TIPOVI
// ==========================================

export type ConflictResolutionAction = 'refresh' | 'overwrite' | 'cancel';

export interface ConflictState {
  isOpen: boolean;
  itemId?: number;
  currentValue?: unknown;
  serverValue?: unknown;
  currentETag?: string;
}

// ==========================================
// TABLE STATE TIPOVI
// ==========================================

export interface TableState {
  documentId: number;
  items: DocumentLineItem[];
  autoSaveMap: AutoSaveStateMap;
  conflictState: ConflictState;
  isLoading: boolean;
  error?: string;
}

// ==========================================
// EDITABLE CELL TIPOVI
// ==========================================

export type EditableCellType = 'number' | 'decimal' | 'text' | 'select';

export interface EditableCellProps {
  value: number | string;
  type: EditableCellType;
  itemId: number;
  field: string;
  onSave: (value: number | string, eTag: string) => Promise<void>;
  status: AutoSaveStatus;
  error?: string;
  disabled?: boolean;
}

// ==========================================
// UTILITY TIPOVI
// ==========================================

export interface ETagHeader {
  key: 'If-Match';
  value: string;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}
