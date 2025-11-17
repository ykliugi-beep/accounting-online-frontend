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

export interface DocumentLineItemCore {
  documentId: number;
  articleId: number;
  organizationalUnitId?: number;

  // Količine i cene
  quantity: number; // CHECK: quantity !== 0 (server rejects zero)
  invoicePrice: number;
  purchasePrice: number;
  warehousePrice: number;
  documentDiscount: number;
  activeMatterPercent: number;
  volume: number;
  excise: number;
  quantityCoefficient: number;
  discountAmount: number;
  marginAmount: number;
  marginValue: number;

  // Porezi
  taxPercent: number;
  taxPercentMP: number;
  taxAmount: number;
  taxAmountWithExcise: number;
  exciseAmount: number;
  taxRateId?: string;

  // Zavisni troškovi
  dependentCostsWithTax: number;
  dependentCostsWithoutTax: number;

  // Ukupni iznosi
  total: number;
  currencyPrice: number;
  currencyTotal: number;

  // Pakovanje i obračuni
  unitOfMeasureId: string;
  packaging: number;
  calculateExcise: boolean;
  calculateTax: boolean;
  calculateAuxiliaryTax: boolean;
  taxationMethodId?: number;
  statusId?: number;

  description?: string;
}

type DocumentLineItemMutableFields =
  Omit<DocumentLineItemCore, 'documentId'> & { documentId?: number };

export interface DocumentLineItemCreateDto
  extends Partial<DocumentLineItemMutableFields> {
  articleId: number;
  quantity: number;
  invoicePrice: number;
}

export type DocumentLineItemPatchDto = Partial<DocumentLineItemMutableFields>;

export interface DocumentLineItem extends DocumentLineItemCore {
  id: number;
  eTag: string; // Base64(RowVersion) - OBAVEZNO za If-Match
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  createdBy?: number;
  updatedBy?: number;
}

/**
 * Lista stavki vraća isti payload kao i detalj - uključuje pune cene,
 * zavisne troškove, kalkulacione flagove, audit metadata i ETag.
 */
export type DocumentLineItemList = DocumentLineItem;

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
