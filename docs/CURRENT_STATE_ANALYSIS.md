# 🔍 Analiza Trenutnog Stanja Projekta

**Datum:** 29.11.2025
**Branch:** feature/complete-implementation-with-menu
**Status:** Detaljna analiza pre kompletne implementacije

---

## 📋 IZVRŠNA SUMMARY

### Implementirano: ~60%

- ✅ **API Layer**: 100% - Svi endpointi mapirani 1:1 sa backend-om
- ✅ **TypeScript Types**: 100% - Svi DTO-ovi validni
- ✅ **Store (Zustand)**: 100% - documentStore i uiStore kompletni
- ✅ **Hooks**: 80% - useAutoSaveItems i useCombos implementirani
- 🟡 **Components**: 50% - Osnovne komponente postoje, nedostaju detalji
- ❌ **Pages/Routing**: 20% - Nedostaje navigacija i lista stranica
- ❌ **Utils**: 30% - Nedostaju helper funkcije
- ❌ **Menu System**: 0% - Nema glavnog navigacionog menija

### Kritični nedostaci:

1. **Nema navigacionog menija** prema specifikaciji iz `ERP-SPECIFIKACIJA.docx`
2. **Nema forme za kreiranje novog dokumenta** - samo detail page postoji
3. **Nema pretrage dokumenata** po datumu i broju
4. **DocumentHeader nije kompletan** - nedostaju sva polja i combosi
5. **Nema routing strukture** za navigaciju

---

## 📁 ANALIZA PO KOMPONENTAMA

### 1. API LAYER ✅ (KOMPLETIRANO)

**Lokacija:** `src/api/`

#### ✅ Endpoints.ts - VALIDAN

Svi API endpointi pravilno implementirani:

```typescript
// Lookup/Combo APIs - OK
lookupApi.getPartners() // spPartnerComboStatusNabavka
lookupApi.getOrganizationalUnits() // spOrganizacionaJedinicaCombo
lookupApi.getTaxationMethods() // spNacinOporezivanjaComboNabavka
lookupApi.getReferents() // spReferentCombo
lookupApi.getReferenceDocuments() // spDokumentNDCombo
lookupApi.getTaxRates() // spPoreskaStopaCombo
lookupApi.getArticles() // spArtikalComboUlaz
lookupApi.getCostTypes() // spUlazniRacuniIzvedeniTroskoviCombo
lookupApi.getCostDistributionMethods() // spNacinDeljenjaTroskovaCombo

// Document APIs - OK
documentApi.create() // POST /documents
documentApi.list() // GET /documents?pageNumber=1&pageSize=20
documentApi.get() // GET /documents/{id}
documentApi.update() // PUT /documents/{id} (sa ETag)
documentApi.delete() // DELETE /documents/{id}

// Line Items - OK sa autosave!
documentLineItemApi.create()
documentLineItemApi.list()
documentLineItemApi.get()
documentLineItemApi.patch() // KRITIČNO - autosave sa ETag!
documentLineItemApi.delete()

// Costs - OK
documentCostApi.create()
documentCostApi.list() // spDokumentTroskoviLista
documentCostApi.get()
documentCostApi.update() // sa ETag
documentCostApi.delete()

// Cost Items - OK
documentCostItemApi.create()
documentCostItemApi.list()
documentCostItemApi.get()
documentCostItemApi.patch() // sa ETag
documentCostItemApi.delete()
documentCostItemApi.distribute() // Primena raspodele!
```

**Verifikacija:** ✅ Svi endpointi mapirani prema backend API dokumentaciji

#### ✅ Client.ts - VALIDAN

- JWT token interceptor konfigurisan
- ETag handling implementiran (If-Match header)
- Error handling sa ApiErrorResponse tipizacijom
- Query params builder funkcioniše

**Issues:** Nema kritičnih problema

---

### 2. TYPESCRIPT TYPES ✅ (KOMPLETIRANO)

**Lokacija:** `src/types/api.types.ts`

#### ✅ Lookup/Combo DTOs - VALIDNI

```typescript
✅ PartnerComboDto - 1:1 sa backend
✅ OrganizationalUnitComboDto - 1:1 sa backend
✅ TaxationMethodComboDto - 1:1 sa backend
✅ ReferentComboDto - 1:1 sa backend
✅ ReferenceDocumentComboDto - 1:1 sa backend
✅ TaxRateComboDto - 1:1 sa backend
✅ ArticleComboDto - 1:1 sa backend
✅ CostTypeComboDto - 1:1 sa backend
✅ CostDistributionMethodComboDto - 1:1 sa backend
```

#### ✅ Document DTOs - VALIDNI

```typescript
✅ CreateDocumentDto - sva polja prisutna
✅ UpdateDocumentDto - extends CreateDocumentDto
✅ DocumentDto - sva read polja + etag
```

#### ✅ Line Item DTOs - VALIDNI

```typescript
✅ CreateDocumentLineItemDto
✅ PatchDocumentLineItemDto - autosave podržan!
✅ DocumentLineItemDto - sa etag
```

#### ✅ Cost DTOs - VALIDNI

```typescript
✅ CreateDocumentCostDto
✅ UpdateDocumentCostDto
✅ DocumentCostDto - sa stavkama i PDV
✅ CreateDocumentCostItemDto - sa vatItems array
✅ PatchDocumentCostItemDto
✅ DocumentCostItemDto - sa vatItems response
```

**Verifikacija:** ✅ Svi tipovi 1:1 mapirani sa backend C# DTOs

---

### 3. ZUSTAND STORE ✅ (KOMPLETIRANO)

**Lokacija:** `src/store/`

#### ✅ documentStore.ts - KOMPLETAN

```typescript
state:
  currentDocument: DocumentDto | null
  items: DocumentLineItemDto[]
  costs: DocumentCostDto[]
  itemSaveStates: Map<number, ItemSaveState>
  costSaveStates: Map<number, CostSaveState>
  isLoading: boolean
  error: string | null

actions:
  setCurrentDocument() ✅
  updateDocument() ✅
  setItems() ✅
  addItem() ✅
  updateItem() ✅
  removeItem() ✅
  setItemSaveState() ✅ // KRITIČNO za autosave!
  getItemSaveState() ✅
  setCosts() ✅
  addCost() ✅
  updateCost() ✅
  deleteCost() ✅
  setCostSaveState() ✅
  getCostSaveState() ✅
  setLoading() ✅
  setError() ✅
  reset() ✅
```

#### ✅ uiStore.ts - KOMPLETAN

```typescript
state:
  isLoading: boolean
  currentTab: string
  sidebarOpen: boolean
  snackbar: { open, message, severity }
  theme: 'light' | 'dark'

actions:
  setLoading() ✅
  setCurrentTab() ✅
  toggleSidebar() ✅
  showSnackbar() ✅
  hideSnackbar() ✅
  toggleTheme() ✅
```

**Issues:** Nema kritičnih problema

---

### 4. HOOKS 🟡 (PARCIJALNO)

**Lokacija:** `src/hooks/`

#### ✅ useAutoSaveItems.ts - IMPLEMENTIRAN

- Debounced save sa 800ms
- ETag handling
- Conflict resolution (409)
- Status tracking (saving, saved, error, conflict)

**Issues:** ⚠️ Postoje, ali rešeni u FIXES_SUMMARY.md (import fix)

#### ✅ useCombos.ts - IMPLEMENTIRAN

- React Query queries za sve combose
- Caching
- Stale-while-revalidate

**Issues:** ⚠️ Postoje, ali rešeni u FIXES_SUMMARY.md (import fix)

#### ❌ NEDOSTAJU:

- `useDocumentQueries.ts` - react-query hooks za dokumente
- `useConflictResolver.ts` - UI za 409 konflikt

---

### 5. COMPONENTS 🟡 (PARCIJALNO)

**Lokacija:** `src/components/`

#### ✅ DocumentItemsTable.tsx - IMPLEMENTIRANA

- Excel-like grid
- Tab/Enter navigacija
- Autosave poziva `documentLineItemApi.patch()`
- Status indikatori
- Conflict handling

**Issues:** ⚠️ Import fix primenjen u FIXES_SUMMARY.md

#### ✅ EditableCell.tsx - IMPLEMENTIRANA

- Inline editing
- Blur/focus handling

#### ✅ ConflictDialog.tsx - IMPLEMENTIRANA

- 409 conflict UI

#### 🟡 DocumentForm.tsx - PARCIJALNO

**ŠTA POSTOJI:**

- Tab navigacija (Header, Items, Costs)
- Summary info (broj stavki, ukupan iznos)
- Integration sa DocumentItemsTable

**ŠTA NEDOSTAJE:**

- Kompletna integracija sa svim podacima
- Save/Cancel dugmad na nivou forme
- Validacija

#### 🟡 DocumentHeader.tsx - PARCIJALNO IMPLEMENTIRAN

**ŠTA POSTOJI:**

- Osnovni layout
- Skeleton loaders

**ŠTA NEDOSTAJE (KRITIČNO):**

Prema `ERP-SPECIFIKACIJA.docx`, **TAB ZAGLAVLJE DOKUMENTA** treba da sadrži:

```typescript
❌ Combo: DOBAVLJAC (spPartnerComboStatusNabavka)
❌ Combo: MAGACIN (spOrganizacionaJedinicaCombo)
❌ Combo: OPOREZIVANJE (spNacinOporezivanjaComboNabavka)
❌ Combo: REFERENT (spReferentCombo)
❌ Combo: NARUDZBENICA (spDokumentNDCombo)
❌ Combo: VALUTA (spValutaCombo)
❌ Input: Broj dokumenta
❌ DatePicker: Datum
❌ DatePicker: Datum valute
❌ Input: Napomena
❌ Input: Kurs
❌ Subform: Avans PDV (tblDokumentAvansPDV + spPoreskaStopaCombo)
```

**Current code (DocumentHeader.tsx):**

```tsx
// SAMO PLACEHOLDER!
export const DocumentHeader: React.FC<...> = ({ document, onChange }) => {
  return (
    <Box>
      {document ? (
        <Typography>Document ID: {document.id}</Typography>
      ) : (
        <Skeleton />
      )}
    </Box>
  );
};
```

**=> TREBA KOMPLETNO REIMPLEMENTIRATI!**

#### 🟡 DocumentCostsTable.tsx - PARCIJALNO

**ŠTA POSTOJI:**

- Basic table layout

**ŠTA NEDOSTAJE:**

Prema specifikaciji, **TAB ZAVISNI TROSKOVI** treba da sadrži:

```typescript
❌ tblDokumentTroskovi - lista troškova (zaglavlje)
  ❌ Combo: ANALITIKA (Partner)
  ❌ Combo: VRSTA DOKUMENTA (spVrsteDokumenataTroskoviCOMBO)
  ❌ Datum dospeća, Datum valute
  ❌ Opis
  ❌ Iznos

❌ tblDokumentTroskoviStavka - stavke troška
  ❌ Combo: VRSTA TROSKA (spUlazniRacuniIzvedeniTroskoviCombo)
  ❌ Combo: NACIN DELJENJA (spNacinDeljenjaTroskovaCombo)
  ❌ Iznos
  ❌ Primeni na sve stavke (checkbox)

❌ tblDokumentTroskoviStavkaPDV - PDV stavke troška
  ❌ Combo: PORESKA STOPA (spPoreskaStopaCombo)
  ❌ Iznos PDV-a

❌ tblDokumentTroskoviStavkaAgregacija - agregacija po artiklima
  ❌ Combo: ARTIKAL (spDokumentTroskoviArtikliCOMBO)
  ❌ Iznos troška raspoređen na artikal

❌ Dugme: "Primeni raspodelu" (poziva distribute endpoint)
```

**=> TREBA KOMPLETNO REIMPLEMENTIRATI!**

---

### 6. PAGES ❌ (KRITIČNO NEDOSTAJE)

**Lokacija:** `src/pages/`

#### ✅ DocumentDetailPage.tsx - POSTOJI

- Prikazuje DocumentForm za postojeći dokument
- React Query integracija

#### ❌ NEDOSTAJE (KRITIČNO):

Prema specifikaciji iz `ERP-SPECIFIKACIJA.docx`, potrebne su stranice:

1. **DocumentListPage.tsx** - ❌ NE POSTOJI

   ```typescript
   Funkcionalnost:
   - Lista dokumenata (tabela)
   - Pretraga po:
     * Datumu (od-do)
     * Broju dokumenta
     * Partneru
     * Statusu
   - Sortiranje
   - Paginacija
   - Klik na red → otvara DocumentDetailPage
   - Dugme "Novi dokument" → otvara DocumentCreatePage
   ```

2. **DocumentCreatePage.tsx** - ❌ NE POSTOJI

   ```typescript
   Funkcionalnost:
   - Forma za kreiranje novog dokumenta
   - Prvo popuni zaglavlje (header tab)
   - Save → POST /api/v1/documents → dobija ID
   - Redirect na DocumentDetailPage sa novim ID
   - Omogući dodavanje stavki i troškova
   ```

3. **DashboardPage.tsx** - ❌ NE POSTOJI
   ```typescript
   Funkcionalnost:
   - Pregled osnovnih metrika
   - Brzi linkovi ka modulima
   ```

---

### 7. ROUTING ❌ (KRITIČNO NEDOSTAJE)

**Lokacija:** `src/App.tsx`

**Current code:**

```tsx
export default function App() {
  return <div>Hello World</div>;
}
```

**=> NEMA REACT ROUTER SETUP-a!**

**ŠTA TREBA:**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/new" element={<DocumentCreatePage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          {/* Više ruta za: reports, master data, finance... */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
```

---

### 8. MENU SYSTEM ❌ (KRITIČNO NEDOSTAJE)

Prema `ERP-SPECIFIKACIJA.docx`, **GLAVNA FORMA ERP-A** treba da ima navigacioni meni:

```
GLAVNA FORMA:
├── 1. DOKUMENTI
│   ├── 1.1 VP (Veleprodaja)
│   │   ├── 1.1.1 Ulazna Kalkulacija VP
│   │   ├── 1.1.2 Finansijsko Odobrenje
│   │   ├── 1.1.3 Finansijsko Zaduženje
│   │   ├── 1.1.4 Avansni Račun
│   │   ├── 1.1.5 Predračun
│   │   ├── 1.1.6 Račun Otpremnica
│   │   └── ...
│   └── 1.2 MP (Maloprodaja)
│       ├── 1.2.1 Popis MP
│       └── ...
├── 2. STANJA MAGACINA
│   └── Robna evidencija
├── 3. OSNOVNI PODACI
│   ├── 3.1 Vrste plaćanja
│   ├── 3.2 Banke
│   ├── 3.3 Mesta
│   ├── 3.4 Države
│   ├── 3.5 Kategorije
│   ├── 3.6 Organizacione jedinice
│   ├── 3.7 Teritorije
│   ├── 3.8 Vrste ulaznih računa
│   ├── 3.9 Artikli i usluge
│   ├── 3.10 Jedinice mera
│   ├── 3.11 Poreske stope
│   ├── 3.12 Kategorije
│   ├── 3.13 Valute
│   ├── 3.14 Vozila
│   └── 3.15 Modeli vozila
└── 4. FINANSIJE
    └── Otvara finansijsku glavnu formu
```

**=> NEMA NAVIGACIONOG MENIJA!**

**ŠTA TREBA:**

- `src/components/Navigation/AppMenu.tsx`
- MUI Drawer sa nested menu items
- Routing integracija

---

### 9. UTILS ❌ (NEDOSTAJE)

**Lokacija:** `src/utils/` - ❌ NE POSTOJI!

**ŠTA TREBA:**

```typescript
// etag.ts
export const extractETag = (response: AxiosResponse): string => {
  return response.headers.etag?.replace(/"/g, '') || '';
};

// format.ts
export const formatCurrency = (amount: number, currency = 'RSD') => {
  return amount.toLocaleString('sr-RS', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('sr-RS');
};

// validation.ts
export const validateDocumentNumber = (num: string): boolean => {
  return /^\d{1,10}$/.test(num);
};

// calculation.ts
export const calculateVAT = (
  amount: number,
  taxRate: number
): number => {
  return (amount * taxRate) / 100;
};

export const calculateTotal = (
  quantity: number,
  price: number,
  discount: number,
  taxRate: number
): { net: number; vat: number; gross: number } => {
  const net = quantity * price * (1 - discount / 100);
  const vat = calculateVAT(net, taxRate);
  return { net, vat, gross: net + vat };
};

// constants.ts
export const DOCUMENT_TYPES = {
  UR: 'Ulazna Kalkulacija VP',
  // ...
};
```

---

## 🚨 KRITIČNI NEDOSTACI - PRIORITET

### 🔴 PRIORITY 1 - MUST HAVE (Blokiraju funkcionalnost)

1. **Navigacioni meni** (AppMenu.tsx)

   - Status: ❌ Ne postoji
   - Impact: Korisnik ne može da navigira aplikacijom
   - Effort: 4h

2. **DocumentListPage** (Lista/Pretraga dokumenata)

   - Status: ❌ Ne postoji
   - Impact: Nema načina da se vidi lista dokumenata
   - Effort: 6h

3. **DocumentCreatePage** (Kreiranje novog dokumenta)

   - Status: ❌ Ne postoji
   - Impact: Nema načina da se kreira novi dokument
   - Effort: 4h

4. **Routing setup** (App.tsx)

   - Status: ❌ Ne postoji
   - Impact: Aplikacija ne funkcioniše
   - Effort: 2h

5. **Kompletan DocumentHeader** (Sva polja + combosi)
   - Status: 🟡 Samo placeholder
   - Impact: Ne može se popuniti zaglavlje dokumenta
   - Effort: 8h

### 🟡 PRIORITY 2 - SHOULD HAVE (Poboljšavaju UX)

6. **Kompletan DocumentCostsTable** (Troškovi + raspodela)

   - Status: 🟡 Osnovni layout
   - Impact: Ne mogu se unositi troškovi
   - Effort: 10h

7. **Utils functions** (format, validation, calculation)

   - Status: ❌ Ne postoji
   - Impact: Duplikat koda, loša maintainability
   - Effort: 3h

8. **DashboardPage**
   - Status: ❌ Ne postoji
   - Impact: Nema početne stranice
   - Effort: 4h

### 🟢 PRIORITY 3 - NICE TO HAVE (Polishing)

9. **useDocumentQueries hook**

   - Status: ❌ Ne postoji
   - Impact: Query logika je u komponentama
   - Effort: 2h

10. **E2E testovi**
    - Status: ❌ Ne postoji
    - Impact: Nema automatskog testiranja
    - Effort: 8h

---

## 📦 PROCENA PREOSTALIH ZADATAKA

### Total Effort: ~51 sati (6-7 radnih dana)

**Breakdown po prioritetu:**

- **Priority 1 (Blokirajući):** 24h (~3 dana)
- **Priority 2 (UX):** 17h (~2 dana)
- **Priority 3 (Polishing):** 10h (~1.5 dan)

### Milestones:

#### Milestone 1: "Navigacija i Routing" (Dan 1)

- ✅ App.tsx - React Router setup
- ✅ AppMenu.tsx - Glavni navigacioni meni
- ✅ Layout.tsx - Wrapper sa menuom
- ✅ DashboardPage.tsx - Landing page

#### Milestone 2: "Document CRUD" (Dan 2-3)

- ✅ DocumentListPage.tsx - Lista + pretraga
- ✅ DocumentCreatePage.tsx - Kreiranje
- ✅ Utils functions - format, validation, calculation

#### Milestone 3: "Kompletna Forma" (Dan 4-5)

- ✅ DocumentHeader.tsx - Sva polja + combosi
- ✅ DocumentCostsTable.tsx - Troškovi kompletni
- ✅ useDocumentQueries.ts - React Query hooks

#### Milestone 4: "Testing & Polishing" (Dan 6-7)

- ✅ E2E testovi
- ✅ Bug fixes
- ✅ Dokumentacija
- ✅ README update

---

## ✅ VERIFIKACIONA CHECKLIST

Pre deploy-a, proveriti:

### Funkcionalnost:

- [ ] Korisnik može da se loguje (JWT token)
- [ ] Korisnik vidi glavni meni sa svim opcijama
- [ ] Korisnik može da kreira novi dokument
- [ ] Korisnik može da pretraži dokumente po datumu i broju
- [ ] Korisnik može da otvori postojeći dokument
- [ ] Korisnik može da popuni zaglavlje sa svim combosima
- [ ] Korisnik može da doda stavke dokumenta (Excel-like)
- [ ] Autosave radi (debounce 800ms, ETag handling)
- [ ] Korisnik može da doda zavisne troškove
- [ ] Korisnik može da primeni raspodelu troškova
- [ ] 409 Conflict se pravilno handluje (refresh + snackbar)

### Code Quality:

- [ ] Nema TypeScript grešaka
- [ ] Nema ESLint warnings-a
- [ ] Nema console.log statements-a
- [ ] Svi API pozivi koriste try/catch
- [ ] Svi loading states su prikazani
- [ ] Svi error states su prikazani

### Performance:

- [ ] Virtualizacija radi za 200+ stavki
- [ ] Autosave ne kreira više od 1 request/800ms po stavki
- [ ] Combosi su keširani (react-query)

### UX:

- [ ] Tab/Enter navigacija radi
- [ ] Skeleton loaders prikazani tokom učitavanja
- [ ] Snackbar notifikacije za success/error
- [ ] Confirmacija pre brisanja

---

## 🎯 NEXT STEPS

1. **Kreirati PR sa ovom analizom** → Dokumentacija trenutnog stanja
2. **Implementirati Milestone 1** → Navigacija funkcionalna
3. **Implementirati Milestone 2** → CRUD operacije
4. **Implementirati Milestone 3** → Kompletna forma
5. **Implementirati Milestone 4** → Production ready

---

**Autor:** AI Assistant
**Reviewer:** Development Team
**Status:** Čeka odobrenje za implementaciju
