# 📚 ERP ACCOUNTING API - KOMPLETNA DOKUMENTACIJA

**Verzija:** 1.0  
**Base URL:** `https://api.example.com/api/v1`  
**Autentifikacija:** Bearer JWT Token  
**Datum:** 27.11.2025

---

## ✅ VERIFIKACIJA ZAKLJUČAK

### Svi atributi iz JSON request fajlova su **tačno i potpuno mapirani** sa atributima u bazi!

**Provereno:**
- ✅ Document DTOs ↔ tblDokument
- ✅ Document Line Item DTOs ↔ tblStavkaDokumenta  
- ✅ Document Cost DTOs ↔ tblDokumentTroskovi
- ✅ Document Cost Item DTOs ↔ tblDokumentTroskoviStavka
- ✅ Lookup/Combo Stored Procedures ↔ API endpoints

**NIKAKVIH NEDOSTAJUĆIH MAPIRANJA!**

Detaljno mapiranje: [`MAPPING-VERIFICATION.md`](./MAPPING-VERIFICATION.md)

---

## 📡 Swagger/OpenAPI - DA LI MOŽE DA SE KORISTI ZA FRONTEND INTEGRACIJU?

### ODGOVOR: **DA!**

Swagger **može i TREBA** da se koristi za generisanje kompletne API dokumentacije prema kojoj frontend developeri mogu da se integrišu preko GUI!

### Dva Načina Korišćenja:

#### 1. Interaktivni Swagger UI (preporučeno za testiranje)

```
URL: https://localhost:5001/swagger/index.html
```

**Šta omogućava:**
- ✅ Pregled svih endpointa sa primerima request/response
- ✅ "Try it out" funkcionalnost - testiranje direktno iz browsera
- ✅ Autentifikacija preko "Authorize" dugmeta (JWT token)
- ✅ Real-time testiranje svih API operacija
- ✅ Prikaz request/response schema
- ✅ Izvoz OpenAPI JSON/YAML specifikacije

**Korišćenje:**
1. Otvori Swagger UI u browseru
2. Klikni "Authorize" i unesi: `Bearer {token}`
3. Odaberi endpoint (npr. `POST /api/v1/documents`)
4. Klikni "Try it out"
5. Unesi request body JSON
6. Klikni "Execute"
7. Pregledaj response (status code, body, headers, ETag)

#### 2. Generisanje TypeScript Klijenta (preporučeno za production)

**OpenAPI JSON specifikacija:**
```
https://localhost:5001/swagger/v1/swagger.json
```

**Alati za generisanje:**

**A) OpenAPI Generator (najpopularniji)**
```bash
npm install -g @openapitools/openapi-generator-cli

openapi-generator-cli generate \
  -i https://localhost:5001/swagger/v1/swagger.json \
  -g typescript-axios \
  -o ./src/api-client \
  --additional-properties=supportsES6=true
```

**B) Orval (modern, TypeScript-first)**
```bash
npm install -D orval
npx orval
```

**C) NSwag (C# based, odličan za .NET → TypeScript)**
```bash
dotnet add package NSwag.MSBuild
```

**Rezultat:** Auto-generisani TypeScript klijent sa:
- ✅ Tipiziranim interfejsima za sve DTOs
- ✅ API klijent funkcijama za sve endpointe
- ✅ Axios/Fetch integracija
- ✅ React Query hooks (opciono)
- ✅ Automatska validacija

### Primer Generisanog Koda

```typescript
// Auto-generated from OpenAPI spec
import { ApiClient, CreateDocumentDto } from './api-client';

const api = new ApiClient({
  baseURL: 'https://localhost:5001/api/v1',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Tipiziran request
const newDoc: CreateDocumentDto = {
  documentTypeCode: 'UR',
  documentNumber: 'UR-2025-0123',
  date: new Date(),
  partnerId: 123,
  organizationalUnitId: 1,
  // ... TypeScript IntelliSense za sva polja!
};

const created = await api.documents.create(newDoc);
// Tipiziran response!
console.log(created.id, created.etag);
```

---

## 📄 Dokumentacija Fajlovi

| Fajl | Opis |
|------|------|
| [`MAPPING-VERIFICATION.md`](./MAPPING-VERIFICATION.md) | ✅ Kompletna verifikacija mapiranja DTO ↔ DB |
| [`SWAGGER-SETUP.md`](./SWAGGER-SETUP.md) | Swagger/OpenAPI konfiguracija i korišćenje |
| [`ENDPOINTS-REFERENCE.md`](./ENDPOINTS-REFERENCE.md) | Svi API endpointi sa primerima |
| [`ETA G-CONCURRENCY.md`](./ETAG-CONCURRENCY.md) | ETag konkurentnost - workflow i primeri |

---

## 🚀 Quick Start za Frontend Developere

### 1. Testiraj API preko Swaggera
```
https://localhost:5001/swagger/index.html
```

### 2. Preuzmi OpenAPI specifikaciju
```bash
curl https://localhost:5001/swagger/v1/swagger.json -o swagger.json
```

### 3. Generiši TypeScript klijent
```bash
openapi-generator-cli generate -i swagger.json -g typescript-axios -o ./src/api-client
```

### 4. Integriši u React/Vue/Angular
```typescript
import { ApiClient } from './api-client';

const api = new ApiClient({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Authorization': `Bearer ${getToken()}` }
});

// Koristi!
const documents = await api.documents.list();
```

---

## 🎯 Ključne Karakteristike API-ja

✅ **RESTful API** sa JSON formatom  
✅ **JWT Autentifikacija** - Bearer token  
✅ **ETag Konkurentnost** - Optimistic concurrency control  
✅ **Soft Delete** - `IsDeleted` flag  
✅ **API Audit Log** - Logovanje svih HTTP zahteva  
✅ **Swagger/OpenAPI** - Interaktivna dokumentacija + generisanje klijenta  
✅ **RowVersion** - SQL Server `TIMESTAMP` za konkurentnost  

---

## 📌 Za Frontend Tim - Šta Treba Znati

### ETag Konkurentnost
```typescript
// 1. GET sa ETag-om
const item = await api.items.get(documentId, itemId);
const etag = item.etag;  // "AAAAAAAAB9C="

// 2. PATCH sa If-Match header-om
const updated = await api.items.patch(
  documentId, 
  itemId, 
  { quantity: 3 },
  { headers: { 'If-Match': etag } }  // OBAVEZNO!
);

// 3. Handle 409 Conflict
try {
  await api.items.patch(...);
} catch (error) {
  if (error.status === 409) {
    // Refresh podataka - neko drugi je promenio
    toast.error('Stavka je promenjena. Osvežavam...');
    await refetchData();
  }
}
```

### Autosave Funkcionalnost
```typescript
// Debounced PATCH poziv na Tab/Enter/Blur
const debouncedSave = useDebouncedCallback(
  async (itemId, field, value, etag) => {
    await api.items.patch(
      documentId,
      itemId,
      { [field]: value },
      { headers: { 'If-Match': etag } }
    );
  },
  500
);

// Excel-like tabela
<input 
  onBlur={(e) => debouncedSave(item.id, 'quantity', e.target.value, item.etag)} 
/>
```

---

## 🔗 Korisni Linkovi

- **Swagger UI:** `https://localhost:5001/swagger/index.html`
- **OpenAPI JSON:** `https://localhost:5001/swagger/v1/swagger.json`
- **GitHub Repo:** https://github.com/sasonaldekant/accounting-online-backend
- **Detaljne Specifikacije:** https://github.com/sasonaldekant/accounting-online-backend/tree/main/docs

---

**Status:** ✅ Verifikovano i Spremno za Integraciju  
**Autor:** Backend Team  
**Kontakt:** support@example.com
