// ============================================================================
// LOOKUP/COMBO TYPES - Backend Stored Procedures Results
// ⚠️ IMPORTANT: Property names match backend C# DTOs (PascalCase)
// Backend uses System.Text.Json with default camelCase serialization
// ============================================================================

export interface PartnerComboDto {
  idPartner: number;                // IdPartner
  nazivPartnera: string;            // NazivPartnera
  mesto: string | null;             // Mesto
  opis: string | null;              // Opis (Status description)
  idStatus: number;                 // IdStatus
  idNacinOporezivanjaNabavka: number | null;  // IdNacinOporezivanjaNabavka
  obracunAkciza: number;            // ObracunAkciza (0 or 1)
  obracunPorez: number;             // ObracunPorez (0 or 1)
  idReferent: number | null;        // IdReferent
  sifraPartner: string | null;      // SifraPartner
  /** @deprecated Legacy fields for backward compatibility */
  id?: number;
  code?: string;
  name?: string;
  city?: string;
  statusName?: string;
}

export interface OrganizationalUnitComboDto {
  idOrganizacionaJedinica: number;  // IdOrganizacionaJedinica
  naziv: string;                    // Naziv
  mesto: string | null;             // Mesto
  sifra: string | null;             // Sifra
  /** @deprecated Legacy fields for backward compatibility */
  id?: number;
  name?: string;
  code?: string;
  city?: string;
}

export interface TaxationMethodComboDto {
  idNacinOporezivanja: number;      // IdNacinOporezivanja
  opis: string;                     // Opis
  obracunAkciza: number;            // ObracunAkciza (0 or 1)
  obracunPorez: number;             // ObracunPorez (0 or 1)
  obracunPorezPomocni: number;      // ObracunPorezPomocni (0 or 1)
  /** @deprecated Legacy fields for backward compatibility */
  id?: number;
  description?: string;
  calculateExcise?: boolean;
  calculateTax?: boolean;
}

export interface ReferentComboDto {
  idRadnik: number;                 // IdRadnik
  imePrezime: string;               // ImePrezime (matches backend DTO and SQL alias "IME I PREZIME")
  sifraRadnika: string | null;      // SifraRadnika
  /** @deprecated Legacy fields for backward compatibility */
  imeRadnika?: string;
  id?: number;
  fullName?: string;
  code?: string;
}

export interface ReferenceDocumentComboDto {
  idDokument: number;               // IdDokument
  brojDokumenta: string;            // BrojDokumenta
  datum: string;                    // Datum (ISO 8601)
  nazivPartnera: string;            // NazivPartnera
  /** @deprecated Legacy fields for backward compatibility */
  id?: number;
  documentNumber?: string;
  date?: string;
  partnerName?: string;
}

// spPoreskaStopaCombo returns ONLY 2 columns: IDPoreskaStopa, Naziv
// ProcenatPoreza is NOT available from this stored procedure
// Note: ProcenatPoreza IS available via spArtikalComboUlaz (articles)
export interface TaxRateComboDto {
  idPoreskaStopa: string;           // IdPoreskaStopa - char(2): "01", "02", "03"
  naziv: string;                    // Naziv
  // procenatPoreza - REMOVED: Not returned by spPoreskaStopaCombo
  /** @deprecated Legacy fields for backward compatibility */
  procenat?: number;
  procenatPoreza?: number;
  id?: string;
  name?: string;
  percentage?: number;
}

export interface ArticleComboDto {
  idArtikal: number;                // IdArtikal
  sifraArtikal: string;             // SifraArtikal
  nazivArtikla: string;             // NazivArtikla
  jedinicaMere: string | null;      // JedinicaMere
  idPoreskaStopa: string | null;    // IdPoreskaStopa
  procenatPoreza: number;           // ProcenatPoreza (Available HERE from spArtikalComboUlaz)
  akciza: number;                   // Akciza
  koeficijentKolicine: number;      // KoeficijentKolicine
  imaLot: boolean;                  // ImaLot
  otkupnaCena: number | null;       // OtkupnaCena
  poljoprivredniProizvod: boolean;  // PoljoprivredniProizvod
  /** @deprecated Legacy fields for backward compatibility */
  id?: number;
  code?: string;
  name?: string;
  unitOfMeasure?: string;
}

export interface CostTypeComboDto {
  idUlazniRacuniIzvedeni: number;   // IdUlazniRacuniIzvedeni
  naziv: string;                    // Naziv
  opis: string | null;              // Opis
  nazivSpecifikacije: string | null; // NazivSpecifikacije
  obracunPorez: number;             // ObracunPorez (0 or 1)
  idUlazniRacuniOsnovni: number;    // IdUlazniRacuniOsnovni
}

export interface CostDistributionMethodComboDto {
  idNacinDeljenjaTroskova: number;  // IdNacinDeljenjaTroskova
  naziv: string;                    // Naziv
  opisNacina: string;               // OpisNacina
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
