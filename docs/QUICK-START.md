# 🚀 Quick Start - Pokretanje ERP Sistema

**Status:** ✅ Backend 100% + Frontend Infrastruktura 100%  
**Datum:** 28.11.2025

---

## 📄 Arhitektura Sistema

```
[👨‍💻 Frontend - React/TypeScript]  ↔  [🔧 Backend - ASP.NET Core Web API]  ↔  [📊 SQL Server]
   http://localhost:3000         http://localhost:5000            tblDokument,
                                                                   tblStavkaDokumenta,
                                                                   tblDokumentTroskovi...
```

---

## 1️⃣ Backend Setup (1 minut)

### Preuzmi i Pokreni

```bash
# 1. Clone repo
git clone https://github.com/sasonaldekant/accounting-online-backend.git
cd accounting-online-backend

# 2. Proveri connection string u appsettings.json
# "DefaultConnection": "Server=localhost;Database=ERP;..."

# 3. Pokreni migracije (ako treba)
dotnet ef database update --project src/ERPAccounting.Infrastructure

# 4. Pokreni API
dotnet run --project src/ERPAccounting.API

# ✅ Backend pokrenut na: http://localhost:5000
# ✅ Swagger UI: http://localhost:5000/swagger/index.html
```

### Testiraj Backend

```bash
# Proveri zdravlje
curl http://localhost:5000/health

# Ili otvori Swagger
open http://localhost:5000/swagger/index.html
```

---

## 2️⃣ Frontend Setup (2 minuta)

### Preuzmi i Pokreni

```bash
# 1. Clone repo
git clone https://github.com/sasonaldekant/accounting-online-frontend.git
cd accounting-online-frontend

# 2. Checkout implementation branch
git checkout feature/complete-erp-implementation

# 3. Instaliraj dependencies
npm install

# 4. Proveri/kreiraj .env.local
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_ENABLE_MOCK_DATA=false
EOF

# 5. Pokreni dev server
npm run dev

# ✅ Frontend pokrenut na: http://localhost:3000
```

---

## 3️⃣ Testiraj Integraciju (3 minuta)

### Test 1: API Connectivity (Browser Console)

```javascript
// Otvori http://localhost:3000
// Pritisni F12 za console

// Test API connection
fetch('http://localhost:5000/api/v1/lookups/partners')
  .then(r => r.json())
  .then(data => console.log('Partneri:', data));

// Trebao bi dobiti listu partnera ✅
```

### Test 2: Kreiraj Dokument (Swagger)

```bash
# Otvori Swagger UI
open http://localhost:5000/swagger/index.html

# 1. Odaberi: POST /api/v1/documents
# 2. Klikni "Try it out"
# 3. Unesi JSON:
{
  "documentTypeCode": "UR",
  "documentNumber": "TEST-001",
  "date": "2025-11-28T00:00:00Z",
  "organizationalUnitId": 1,
  "partnerId": 1
}

# 4. Klikni "Execute"
# 5. Proveri response - trebao bi dobiti 201 Created sa `id` i `etag` ✅
```

### Test 3: Dodaj Stavku (Swagger)

```bash
# U Swagger:
# POST /api/v1/documents/{documentId}/items

# Body:
{
  "articleId": 1,
  "quantity": 5,
  "invoicePrice": 1000,
  "discount": 0,
  "taxRateId": "01",
  "taxRatePercentage": 20,
  "unitOfMeasure": "KOM"
}

# Response: 201 Created
# Backend AUTOMATSKI izračunava:
# - IznosPDV = (5 * 1000) * 0.20 = 1000
# - Iznos = 5000 + 1000 = 6000 ✅
```

### Test 4: Autosave PATCH (Swagger)

```bash
# 1. GET /api/v1/documents/{documentId}/items/{itemId}
# Zapamti `etag` iz response-a

# 2. PATCH /api/v1/documents/{documentId}/items/{itemId}
# Header: If-Match: {etag}
# Body:
{
  "quantity": 10
}

# Response: 200 OK sa novim `etag` ✅
# Backend preračunava IznosPDV i Iznos automatski!
```

### Test 5: ETag Conflict (Swagger)

```bash
# 1. Uradi PATCH sa valjanim ETag-om
# 2. Uradi još jedan PATCH sa ISTIM (starim) ETag-om

# Response: 409 Conflict ✅
# Message: "Data has been modified by another user"
```

---

## 4️⃣ Šta Radi, Šta Ne Radi

### ✅ Backend - 100% Funkcionalno

- ✅ Svi API endpointi (CRUD za dokumente, stavke, troškove)
- ✅ ETag konkurentnost (409 Conflict handling)
- ✅ Autosave PATCH (parcijalno ažuriranje)
- ✅ Auto-calculate (IznosPDV, Iznos, ukupni iznosi)
- ✅ Lookup/Combo endpointi (Stored Procedures)
- ✅ Soft Delete (IsDeleted flag)
- ✅ API Audit Log
- ✅ Swagger/OpenAPI dokumentacija

### ✅ Frontend - Infrastruktura 100%

- ✅ TypeScript tipovi (1:1 mapiranje backend DTOs)
- ✅ API client sa svim endpointima
- ✅ Zustand store za state management
- ✅ Environment konfiguracija
- ✅ Dependencies (React Query, MUI, axios...)
- ✅ Dokumentacija

### 🔴 Frontend - Komponente 20%

- 🔶 DocumentForm (partial)
- 🔴 DocumentHeader (treba implementirati)
- 🔴 DocumentItemsTable (treba implementirati)
- 🔴 DocumentCostsTable (treba implementirati)
- 🔴 useAutoSaveItems hook (treba implementirati)

---

## 5️⃣ Dalje Koraci

### Za Developere

**Prioritet 1 - Excel-like Grid:**
1. Implementirati `DocumentItemsTable` komponentu
2. Implementirati `useAutoSaveItems` hook sa debounced autosave
3. Dodati status indikatore (🔵 Saving, ✅ Saved, ⚠️ Conflict)
4. Testirati sa backendom

**Prioritet 2 - Header Forma:**
1. Implementirati `DocumentHeader` komponentu
2. Povezati lookup combo boxeve (Partneri, Magacini, Referenti...)
3. Validacija

**Prioritet 3 - Troškovi:**
1. Implementirati `DocumentCostsTable`
2. Subgrid za stavke troška
3. Raspodela troškova

**Procena:** 2-3 dana za MVP sa svim core funkcionalnostima

### Za Testiranje

1. **Swagger UI testiranje:**
   - http://localhost:5000/swagger/index.html
   - Testiraj sve endpointe
   - Proveri ETag konkurentnost

2. **Postman Collection:**
   - Izvezi OpenAPI JSON iz Swaggera
   - Importuj u Postman
   - Kreiraj test scenarije

3. **Frontend komponente:**
   - Kako se implementiraju, testiraj sa realnim backend API-jem
   - Proveri autosave (800ms debounce)
   - Proveri conflict handling (409)

---

## 📚 Dodatna Dokumentacija

### Backend
- **API Docs:** https://github.com/sasonaldekant/accounting-online-backend/tree/main/docs/api
- **README:** https://github.com/sasonaldekant/accounting-online-backend/blob/main/docs/api/README.md
- **Mapping Verification:** https://github.com/sasonaldekant/accounting-online-backend/blob/main/docs/api/MAPPING-VERIFICATION.md

### Frontend
- **Implementation Guide:** [docs/IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)
- **PR #9:** https://github.com/sasonaldekant/accounting-online-frontend/pull/9

---

## ❓ Troubleshooting

### Backend neće da se pokrene
```bash
# Proveri da li SQL Server radi
# Proveri connection string u appsettings.json
# Proveri da li je baza kreirana

dotnet ef database update --project src/ERPAccounting.Infrastructure
```

### Frontend API pozivi ne rade
```bash
# Proveri da li je backend pokrenut
curl http://localhost:5000/health

# Proveri .env.local
cat .env.local
# VITE_API_BASE_URL=http://localhost:5000/api/v1

# Proveri browser console za CORS greške
# Backend ima CORS omogućen za localhost:3000
```

### npm install greške
```bash
# Očisti cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

**Status:** ✅ Sistem spreman za development i testiranje  
**Backend:** 100% funkcionalan  
**Frontend:** Infrastruktura spremna, komponente preostale  
**Procena:** 2-3 dana za MVP  

**Happy Coding! 🚀**
