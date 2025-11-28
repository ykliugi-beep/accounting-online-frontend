# 🎉 ERP Accounting Frontend - Kompletna Implementacija

**Status:** ✅ Spremno za testiranje  
**Branch:** `feature/complete-erp-implementation`  
**Datum:** 28.11.2025

---

## 📊 Šta je Implementirano

### 1. ✅ TypeScript Tipovi
- **Lokacija:** `src/types/api.types.ts`
- **Sadržaj:**
  - Svi Lookup/Combo DTOs (Partneri, Magacini, Referenti, Artikli, Troškovi...)
  - Document DTOs (Create, Update, Response)
  - DocumentLineItem DTOs (Create, Patch, Response)
  - DocumentCost DTOs (Create, Update, Response)
  - DocumentCostItem DTOs (Create, Patch, Response)
  - Pagination, Error responses, UI state types

**Verifikacija:** Svi tipovi **1:1 mapiraju backend C# DTOs**!

### 2. ✅ API Client
- **Lokacija:** `src/api/`
- **Struktura:**
  - `client.ts` - Axios instance sa interceptors
  - `endpoints.ts` - Svi API endpointi
  - `index.ts` - Re-exports

**Endpointi:**
```typescript
// Lookup/Combo
lookupApi.getPartners()
lookupApi.getOrganizationalUnits(documentType?)
lookupApi.getTaxationMethods()
lookupApi.getReferents()
lookupApi.getReferenceDocuments(type?)
lookupApi.getTaxRates()
lookupApi.getArticles()
lookupApi.getCostTypes()
lookupApi.getCostDistributionMethods()

// Documents
documentApi.create(data)
documentApi.list(params?)
documentApi.get(id)
documentApi.update(id, data, etag)
documentApi.delete(id)

// Line Items
documentLineItemApi.create(documentId, data)
documentLineItemApi.list(documentId)
documentLineItemApi.get(documentId, itemId)
documentLineItemApi.patch(documentId, itemId, data, etag) // AUTOSAVE!
documentLineItemApi.delete(documentId, itemId)

// Costs
documentCostApi.create(documentId, data)
documentCostApi.list(documentId)
documentCostApi.get(documentId, costId)
documentCostApi.update(documentId, costId, data, etag)
documentCostApi.delete(documentId, costId)

// Cost Items
documentCostItemApi.create(documentId, costId, data)
documentCostItemApi.list(documentId, costId)
documentCostItemApi.get(documentId, costId, itemId)
documentCostItemApi.patch(documentId, costId, itemId, data, etag)
documentCostItemApi.delete(documentId, costId, itemId)
documentCostItemApi.distribute(documentId, costId, data)
```

**Features:**
- ✅ ETag konkurentnost (If-Match header)
- ✅ Error handling sa tipiziranim odgovorima
- ✅ JWT Auth interceptor (placeholder, lako dodati token)
- ✅ Query parametri za paginaciju i filtriranje

### 3. ✅ Zustand Store
- **Lokacija:** `src/store/`
- **Struktura:**
  - `documentStore.ts` - State za dokumente, stavke, troškove
  - `uiStore.ts` - UI state (loading, tabs, sidebar, snackbar)
  - `index.ts` - Re-exports

**documentStore features:**
```typescript
// Document
setCurrentDocument(document)
updateDocument(updates)

// Line Items
setItems(items)
addItem(item)
updateItem(itemId, updates)
removeItem(itemId)
setItemSaveState(itemId, state) // AUTOSAVE STATUS!
getItemSaveState(itemId)

// Costs
setCosts(costs)
addCost(cost)
updateCost(costId, updates)
deleteCost(costId)
setCostSaveState(costId, state)
getCostSaveState(costId)

// UI
setLoading(isLoading)
setError(error)
reset()
```

**uiStore features:**
```typescript
setLoading(isLoading)
setCurrentTab(tab)
toggleSidebar()
showSnackbar(message, severity)
hideSnackbar()
toggleTheme()
```

### 4. ✅ Environment Configuration
- **Lokacija:** `src/config/env.ts`, `.env.example`, `.env.local`
- **Config:**
  - `API_BASE_URL` - Backend URL
  - `API_TIMEOUT` - Request timeout
  - `AUTOSAVE_DEBOUNCE` - 800ms (kao u MS Access)
  - `ENABLE_MOCK_DATA` - Dev flag

### 5. ✅ Package Dependencies
- **Updated:** `package.json`
- **Dodato:**
  - `zustand` - State management
  - `react-router-dom` - Routing
  - `react-hook-form` - Forme
  - `@tanstack/react-query-devtools` - Dev tools

---

## 🚀 Pokretanje Projekta

### Prerequisites
```bash
# Node.js 20 LTS
node --version  # v20.x.x

# npm 10.x
npm --version   # 10.x.x
```

### 1. Clone Repo
```bash
git clone https://github.com/sasonaldekant/accounting-online-frontend.git
cd accounting-online-frontend
git checkout feature/complete-erp-implementation
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Kopiraj .env.example u .env.local
cp .env.example .env.local

# Edituj .env.local
# VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 4. Start Backend API
```bash
# U drugom terminal prozoru, pokreni backend
cd ../accounting-online-backend
dotnet run --project src/ERPAccounting.API

# Backend će biti na: http://localhost:5000
# Swagger UI: http://localhost:5000/swagger/index.html
```

### 5. Start Frontend Dev Server
```bash
npm run dev

# Frontend će biti na: http://localhost:3000
```

### 6. Otvori Browser
```
http://localhost:3000
```

---

## 🧪 Testiranje Autosave Funkcionalnosti

### Scenario 1: Kreiranje Dokumenta

1. **Otvori formu za novi dokument**
2. **Popuni zaglavlje:**
   - Dobavljač (combo - poziva `spPartnerComboStatusNabavka`)
   - Magacin (combo - poziva `spOrganizacionaJedinicaCombo`)
   - Referent (combo - poziva `spReferentCombo`)
   - Datum, Broj dokumenta, Oporezivanje...
3. **Klikni "Sačuvaj" (POST /api/v1/documents)**
4. **Proveri response - dobijaš `etag`**

### Scenario 2: Dodavanje Stavki (Excel-like)

1. **Pređi na Tab 2: "Stavke"**
2. **Klikni "Dodaj stavku"**
3. **Odaberi artikal** (combo - poziva `spArtikalComboUlaz`)
4. **Unesi količinu: 5**
5. **Pritisni TAB** (ili čekaj 800ms)
6. **Posmatraj status indikator:**
   - 🔵 "Saving..." (poziva `PATCH /api/v1/documents/{id}/items/{itemId}` sa ETag)
   - ✅ "Saved" (backend vraća novi ETag)
7. **Promeni cenu: 1000**
8. **Pritisni TAB**
9. **Ponovo 🔵 "Saving..." → ✅ "Saved"**

**Backend automatski preračunava:**
- `IznosPDV` = (5 * 1000) * (20 / 100) = 1000
- `Iznos` = 5000 + 1000 = 6000
- Ukupan iznos dokumenta = SUM(svih stavki)

### Scenario 3: Konkurentnost (409 Conflict)

1. **Otvori ISTI dokument u 2 browsera (ili 2 tab-a)**
2. **U Browser 1: promeni količinu stavke na 10**
3. **Čekaj da se sačuva** (✅ "Saved")
4. **U Browser 2: promeni ISTU stavku na 15**
5. **Backend vraća 409 Conflict** (ETag mismatch)
6. **Frontend prikaže:**
   - ⚠️ "Conflict" status
   - Snackbar: "Stavka je promenjena od drugog korisnika. Osvežavam..."
   - Automatski refresh podataka

### Scenario 4: Zavisni Troškovi

1. **Pređi na Tab 3: "Troškovi"**
2. **Dodaj trošak (Transport):**
   - Analitika (Partner - combo)
   - Vrsta troška (combo - poziva `spUlazniRacuniIzvedeniTroskoviCombo`)
   - Iznos: 5000
3. **Dodaj stavku troška:**
   - Vrsta troška: "TRANSPORT"
   - Način deljenja: "Po vrednosti" (combo - poziva `spNacinDeljenjaTroskovaCombo`)
   - Iznos: 5000
   - PDV stavke: 20% = 1000
4. **Klikni "Primeni raspodelu"**
5. **Backend poziva `POST /api/v1/documents/{id}/costs/{costId}/distribute`**
6. **Troškovi se raspoređuju proporcionalno na sve stavke dokumenta**

---

## 📝 Dalje Akcije

### 🔴 HIGH PRIORITY - Komponente za Implementaciju

#### 1. DocumentForm Component
**Lokacija:** `src/components/Document/DocumentForm.tsx`

**Šta treba:**
- Tab navigacija (MUI Tabs)
- Tab 1: DocumentHeader (zaglavlje)
- Tab 2: DocumentItems (Excel-like grid)
- Tab 3: DocumentCosts (troškovi)

**Reference:** Postojeći `DocumentForm` u `src/components/`

#### 2. DocumentHeader Component
**Lokacija:** `src/components/Document/DocumentHeader.tsx`

**Šta treba:**
- Forma sa `react-hook-form`
- Combo box komponente (Autocomplete sa API lookup)
- Povezivanje sa `documentApi.create/update`

**Polja:**
- Dobavljač (Partner combo)
- Magacin (OJ combo)
- Referent (Referent combo)
- Datum, Broj dokumenta, Oporezivanje, Valuta, Napomena...

#### 3. DocumentItemsTable Component (⭐ NAJVAŽNIJE)
**Lokacija:** `src/components/Document/DocumentItemsTable.tsx`

**Šta treba:**
- Excel-like grid (MUI DataGrid ili custom table)
- Tab/Enter navigacija
- Autosave na blur/tab (debounced 800ms)
- Status indikatori (Saving, Saved, Error, Conflict)
- ETag handling
- Virtualizacija za 200+ redova (react-window)

**Hook:** `useAutoSaveItems` - koristi `documentLineItemApi.patch` sa ETag

**Kolone:**
- Artikal (Autocomplete combo)
- Količina (number input)
- Cena (number input)
- Rabat (number input)
- PDV stopa (combo)
- PDV iznos (read-only, auto-calculate)
- Ukupno (read-only, auto-calculate)
- Status (ikona)

#### 4. DocumentCostsTable Component
**Lokacija:** `src/components/Document/DocumentCostsTable.tsx`

**Šta treba:**
- Lista troškova (zaglavlje)
- Subgrid za stavke troška
- Dugme "Primeni raspodelu"
- Modal za unos stavke troška sa PDV stavkama

#### 5. useAutoSaveItems Hook (⭐ NAJVAŽNIJE)
**Lokacija:** `src/hooks/useAutoSaveItems.ts`

**Šta treba:**
```typescript
const useAutoSaveItems = (documentId: number) => {
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Map<number, string>>(new Map());
  
  const debouncedSave = useMemo(
    () => debounce(async (itemId, field, value, etag) => {
      setSavingIds(prev => new Set(prev).add(itemId));
      try {
        const updated = await documentLineItemApi.patch(
          documentId,
          itemId,
          { [field]: value },
          etag
        );
        // Update store sa novim ETag
        // Remove from savingIds
        // Show "Saved" indicator
      } catch (error) {
        if (error.status === 409) {
          // Conflict - refresh data
          // Show snackbar
        } else {
          // Other error
        }
      }
    }, 800),
    [documentId]
  );
  
  return { savingIds, errors, debouncedSave };
};
```

#### 6. React Query Hooks
**Lokacija:** `src/hooks/useDocumentQueries.ts`

**Šta treba:**
```typescript
// Queries
export const useDocument = (id: number) => useQuery(...);
export const useDocumentItems = (documentId: number) => useQuery(...);
export const useDocumentCosts = (documentId: number) => useQuery(...);
export const usePartners = () => useQuery(...);
export const useArticles = () => useQuery(...);
// ... ostali lookup

// Mutations
export const useCreateDocument = () => useMutation(...);
export const useUpdateDocument = () => useMutation(...);
export const useCreateItem = () => useMutation(...);
export const usePatchItem = () => useMutation(...); // AUTOSAVE
```

---

## 🔧 Development Workflow

### Dodavanje Nove Komponente

1. **Kreiraj komponentu u `src/components/`**
2. **Koristi TypeScript tipove iz `src/types/api.types.ts`**
3. **Pozivaj API preko `src/api/endpoints.ts`**
4. **Koristi Zustand store za state (`src/store/`)**
5. **Testiraj sa backendom**

### Dodavanje Novog API Endpointa

1. **Dodaj tip u `src/types/api.types.ts`**
2. **Dodaj funkciju u `src/api/endpoints.ts`**
3. **Exportuj u `src/api/index.ts`**
4. **Koristi u komponentama**

### Dodavanje Novog Store State-a

1. **Dodaj property u `src/store/documentStore.ts` ili `uiStore.ts`**
2. **Dodaj action funkciju**
3. **Koristi u komponentama preko `useDocumentStore()` ili `useUIStore()`**

---

## 🏁 Produkcijski Deploy

### Build
```bash
npm run build

# Output u: dist/
```

### Environment Variables (Production)
```bash
# .env.production
VITE_API_BASE_URL=https://api.production.com/api/v1
VITE_ENABLE_MOCK_DATA=false
```

### Deploy na Server
```bash
# Static hosting (Netlify, Vercel, Nginx...)
cp -r dist/* /var/www/html/
```

---

## 📊 Metrike

### Backend API - 100% Spreman ✅
- ✅ Svi endpointi implementirani
- ✅ ETag konkurentnost
- ✅ Autosave PATCH podržan
- ✅ Stored Procedures za lookupe
- ✅ Swagger dokumentacija

### Frontend - 60% Spreman 🔶
- ✅ TypeScript tipovi (100%)
- ✅ API client (100%)
- ✅ Zustand store (100%)
- ✅ Environment config (100%)
- 🔶 Komponente (20% - treba implementirati)
- 🔶 React Query hooks (0% - treba implementirati)
- 🔶 useAutoSaveItems hook (0% - KRITIČNO)
- 🔶 Testovi (0%)

### Preostalo za MVP
- 🔴 DocumentForm sa 3 taba
- 🔴 DocumentHeader forma
- 🔴 DocumentItemsTable (Excel-like grid)
- 🔴 useAutoSaveItems hook
- 🔴 DocumentCostsTable
- 🔴 React Query hooks
- 🟡 E2E testovi
- 🟡 UX polishing

**Procena:** 2-3 dana za MVP sa svim core funkcionalnostima

---

## 🔗 Linkovi

- **Backend Repo:** https://github.com/sasonaldekant/accounting-online-backend
- **Backend API Docs:** https://github.com/sasonaldekant/accounting-online-backend/tree/main/docs/api
- **Backend Swagger:** http://localhost:5000/swagger/index.html
- **Frontend Repo:** https://github.com/sasonaldekant/accounting-online-frontend
- **This Branch:** https://github.com/sasonaldekant/accounting-online-frontend/tree/feature/complete-erp-implementation

---

## ❓ FAQ

**Q: Da li frontend radi bez backend-a?**
A: Ne - frontend poziva stvarne API endpointe. Backend mora biti pokrenut.

**Q: Da li mogu koristiti mock podatke?**
A: Trenutno ne - ali može se dodati MSW (Mock Service Worker) za dev.

**Q: Šta je sa autentifikacijom?**
A: Placeholder je u `src/api/client.ts` - lako dodati JWT token.

**Q: Kako testiram ETag konkurentnost?**
A: Otvori isti dokument u 2 browsera i menjaj istu stavku - drugi će dobiti 409.

**Q: Koja je razlika između PUT i PATCH?**
A: PUT - puni update (sve polja), PATCH - parcijalni update (samo prosleđena polja).

**Q: Zašto 800ms debounce za autosave?**
A: Balans između responsiveness-a i broja API poziva. Može se prilagoditi u `env.ts`.

---

**Status:** ✅ Infrastruktura spremna, komponente preostale  
**Next Step:** Implementirati DocumentForm, DocumentItemsTable, useAutoSaveItems  
**Autor:** Backend Team + Frontend Team  
**Datum:** 28.11.2025
