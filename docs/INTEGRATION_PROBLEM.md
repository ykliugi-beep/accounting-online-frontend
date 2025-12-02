# 🔴 INTEGRATION PROBLEM - Frontend i Backend Nisu Povezani

**Datum:** 01.12.2025  
**Problem:** Frontend i Backend rade, ali pokazuju **dummy podatke** umesto realnih iz baze

---

## 🚨 PROBLEM

### Simptomi:
1. **Frontend se pokreće** (http://localhost:3000)
2. **Backend se pokreće** (http://localhost:5286)
3. **Ali:** Frontend pokazuje dummy podatke, ne realne iz baze
4. **Rezultat:** Nema veze sa Access rešenjem i pravim podacima

---

## 🔍 ROOT CAUSE ANALYSIS

### 1️⃣ **CORS Nije Konfigurisan**

**Problem:** Backend `Program.cs` **NEMA CORS** konfiguraciju!

```csharp
// ❌ Program.cs trenutno NEMA:
app.UseCors(...)  // MISSING!
```

**Rezultat:** Browser blokira API pozive sa frontend-a

---

### 2️⃣ **JWT Token Nije Postavljen**

**Frontend config (`src/config/env.ts`):**
```typescript
JWT_TOKEN: import.meta.env.VITE_JWT_TOKEN || '',  // ❌ Prazan string!
```

**`.env.example`:**
```bash
VITE_JWT_TOKEN=your-test-token-here  # ❌ Placeholder, ne pravi token!
```

**Rezultat:** Svi API pozivi vraćaju **401 Unauthorized**

---

### 3️⃣ **Backend Connection String Nije Konfigurisan**

**Problem:** Backend možda koristi in-memory ili test bazu umesto prave Access baze!

**Potrebno proveriti:**
- `appsettings.json` - ConnectionString
- Da li pokazuje na pravu SQL Server bazu konvertovanu iz Access-a

---

### 4️⃣ **Stored Procedures Nisu Testirani**

**Backend poziva 11 stored procedures:**
```sql
spPartnerComboStatusNabavka
spOrganizacionaJedinicaCombo
spNacinOporezivanjaComboNabavka
... (još 8)
```

**Problem:** Ako SP-ovi ne postoje ili vraćaju prazne rezultate, frontend dobija prazne liste!

---

## ✅ REŠENJE - Step by Step

### STEP 1: Dodaj CORS u Backend

**`src/ERPAccounting.API/Program.cs`:**

```csharp
// 📝 DODAJ PRE builder.Build():
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder
            .WithOrigins("http://localhost:3000", "http://localhost:5173") // Vite dev ports
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("ETag", "X-Total-Count")  // KRITIČNO za ETag!
            .AllowCredentials();
    });
});

// 📝 DODAJ POSLE app.UseHttpsRedirection():
app.UseCors("AllowFrontend");  // PRE UseAuthentication!
```

---

### STEP 2: Generiši JWT Token

**Opcija A: Koristi Swagger UI**

1. Pokreni backend: `dotnet run --project src/ERPAccounting.API`
2. Otvori: http://localhost:5286/swagger
3. Ako postoji `/auth/login` endpoint:
   - Klikni "Try it out"
   - Unesi credentials
   - Kopiraj token iz response-a

**Opcija B: Generate Manually (ako nema auth endpoint)**

```csharp
// Dodaj ovaj endpoint u Program.cs ZA TESTIRANJE:
app.MapPost("/api/auth/test-token", () =>
{
    var handler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SigningKey"]!);
    
    var descriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "TestUser"),
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim("OrganizationId", "1")
        }),
        Expires = DateTime.UtcNow.AddHours(24),
        Issuer = builder.Configuration["Jwt:Issuer"],
        Audience = builder.Configuration["Jwt:Audience"],
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature)
    };
    
    var token = handler.CreateToken(descriptor);
    return Results.Ok(new { token = handler.WriteToken(token) });
});
```

Generisanje tokena:
```bash
curl -X POST http://localhost:5286/api/auth/test-token
```

---

### STEP 3: Konfiguriši Frontend Environment

**Kreiraj `.env.local` fajl (ne commit-uj ga!):**

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:5286/api/v1
VITE_ENABLE_MOCK_DATA=false
VITE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Token iz STEP 2
```

---

### STEP 4: Proveri Backend Connection String

**`appsettings.Development.json` ili `appsettings.json`:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Genecom2024Dragicevic;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

**Proveri:**
1. Server name je ispravan
2. Database name: `Genecom2024Dragicevic` (iz specifikacije)
3. User ima pristup

---

### STEP 5: Testiranje Stored Procedures

**Testiraj direktno u SQL Server Management Studio:**

```sql
USE Genecom2024Dragicevic;
GO

-- Test Partner Combo
EXEC spPartnerComboStatusNabavka;

-- Test Organizacione Jedinice
EXEC spOrganizacionaJedinicaCombo @TipDokumentaID = 'UR';

-- Test Artikli
EXEC spArtikalComboUlaz;

-- Test Poreske Stope
EXEC spPoreskaStopaCombo;
```

**Ako SP-ovi ne postoje:**
- Kreiraj ih prema Access VBA kodu
- Ili koristi Entity Framework LINQ umesto SP-ova

---

### STEP 6: Testiranje Integracije

**A) Testiraj Backend Direktno (Swagger):**

1. Otvori: http://localhost:5286/swagger
2. Klikni "Authorize" dugme
3. Unesi: `Bearer {token}` (token iz STEP 2)
4. Testiraj `/lookups/partners` endpoint
5. **Očekivano:** Lista partnera iz baze!

**B) Testiraj Frontend → Backend:**

1. Pokreni backend: `dotnet run --project src/ERPAccounting.API`
2. Pokreni frontend: `npm run dev`
3. Otvori: http://localhost:5173
4. Otvori Chrome DevTools → Network tab
5. Kreiraj novi dokument
6. **Proverite:**
   - API pozivi ka `http://localhost:5286`
   - Status: 200 OK (ne 401, ne CORS error)
   - Response sadrži realne podatke

---

## 🔍 DEBUGGING CHECKLIST

### Frontend Issues:

- [ ] `.env.local` fajl postoji sa pravim token-om
- [ ] `VITE_API_BASE_URL=http://localhost:5286/api/v1`
- [ ] `VITE_ENABLE_MOCK_DATA=false`
- [ ] Frontend build uspešan: `npm run dev`
- [ ] Chrome DevTools → Console - nema CORS errors
- [ ] Chrome DevTools → Network - API pozivi idu ka backend-u
- [ ] Network tab pokazuje 200 OK responses

### Backend Issues:

- [ ] CORS je dodat u `Program.cs`
- [ ] `app.UseCors("AllowFrontend")` JE PRE `UseAuthentication()`
- [ ] JWT token je validan (ne expired)
- [ ] Connection string pokazuje na pravu bazu
- [ ] Stored procedures postoje u bazi
- [ ] Backend log pokazuje uspešne pozive
- [ ] Swagger radi: http://localhost:5286/swagger
- [ ] `/lookups/partners` vraća podatke u Swagger-u

### Database Issues:

- [ ] SQL Server je pokrenut
- [ ] Database `Genecom2024Dragicevic` postoji
- [ ] Tabele postoje: `tblPartner`, `tblDokument`, itd.
- [ ] Stored procedures postoje (11 komada)
- [ ] SP-ovi vraćaju podatke (ne prazni rezultat)
- [ ] User ima pristup bazi

---

## 📊 EXPECTED vs ACTUAL

### ✅ Expected Behavior:

```
Frontend (localhost:3000)
    ↓
    HTTP GET /api/v1/lookups/partners
    Bearer token: eyJhbGciOi...
    ↓
Backend (localhost:5286)
    ↓
    EXEC spPartnerComboStatusNabavka
    ↓
SQL Server Database (Genecom2024Dragicevic)
    ↓
    [Realni podaci iz tblPartner]
    ↓
Backend Response:
{
  "data": [
    { "id": 1, "naziv": "Dobavljač 1", ... },
    { "id": 2, "naziv": "Dobavljač 2", ... }
  ]
}
    ↓
Frontend prikazuje realne partnere!
```

### ❌ Actual Behavior (Current):

```
Frontend (localhost:3000)
    ↓
    HTTP GET /api/v1/lookups/partners
    Bearer token: ""  ❌ Prazan!
    ↓
    CORS Error ili 401 Unauthorized
    ↓
Frontend fallback na dummy podatke:
[
  { id: 1, naziv: "Dummy Partner 1" },
  { id: 2, naziv: "Dummy Partner 2" }
]
```

---

## 🎯 QUICK FIX PROCEDURE

### 5-Minute Fix:

```bash
# 1. Backend - Dodaj CORS (copy-paste u Program.cs)
# Vidi STEP 1 gore

# 2. Generiši token
curl -X POST http://localhost:5286/api/auth/test-token

# 3. Frontend - Kreiraj .env.local
echo "VITE_API_BASE_URL=http://localhost:5286/api/v1" > .env.local
echo "VITE_ENABLE_MOCK_DATA=false" >> .env.local
echo "VITE_JWT_TOKEN=<TOKEN_IZ_STEP_2>" >> .env.local

# 4. Restartuj
dotnet run --project src/ERPAccounting.API  # Terminal 1
npm run dev                                  # Terminal 2

# 5. Testiraj
# Otvori http://localhost:5173
# Kreiraj dokument
# Proveri da li se učitavaju realni podaci!
```

---

## 📄 FILES TO UPDATE

### Backend:
1. **`src/ERPAccounting.API/Program.cs`**
   - Dodaj CORS konfiguraciju
   - Dodaj test token endpoint (optional)

2. **`appsettings.Development.json`** (ako ne postoji)
   - Dodaj connection string

### Frontend:
1. **`.env.local`** (kreiraj fajl)
   - `VITE_API_BASE_URL`
   - `VITE_JWT_TOKEN`
   - `VITE_ENABLE_MOCK_DATA=false`

2. **`.gitignore`** (proveri da sadrži)
   ```
   .env.local
   .env.*.local
   ```

---

## ✅ SUCCESS CRITERIA

### Kada je problem rešen:

1. **Frontend prikazuje realne podatke iz baze**
   - Partneri nisu "Dummy Partner 1, 2, 3"
   - Artikli nisu "Dummy Artikal 1, 2, 3"
   - Vidite prave nazive iz Access aplikacije

2. **Chrome DevTools → Network pokazuje:**
   ```
   Status: 200 OK
   Request URL: http://localhost:5286/api/v1/lookups/partners
   Response: [{ id: 1, naziv: "Pravi Dobavljač", ... }]
   ```

3. **Backend log pokazuje:**
   ```
   info: API called: GET /api/v1/lookups/partners
   info: Partners loaded: 15
   ```

4. **SQL Server Profiler pokazuje:**
   ```
   EXEC spPartnerComboStatusNabavka
   ```

---

## 🚀 NEXT STEPS AFTER FIX

1. **Testiraj sve combos:**
   - Partners ✓
   - Organizational Units ✓
   - Tax Rates ✓
   - Articles ✓
   - ... (svih 11)

2. **Testiraj CRUD operacije:**
   - Kreiraj dokument
   - Dodaj stavke
   - Save & refresh
   - Proveri da li se čuva u bazi

3. **Testiraj ETag concurrency:**
   - Otvori isti dokument u 2 tab-a
   - Edituj u oba
   - Proveri 409 Conflict

4. **Testiraj autosave:**
   - Edituj stavku
   - Čekaj 800ms
   - Proveri status indicator (Saved)

---

## 📞 SUPPORT

Ako i dalje ne radi posle ovih koraka:

1. **Proveri backend log** - šta piše?
2. **Proveri SQL Server log** - da li se SP-ovi izvršavaju?
3. **Proveri Chrome DevTools → Console** - koji error?
4. **Proveri Chrome DevTools → Network** - koji status code?

---

**🎯 Status:** Problem identifikovan - CORS + JWT + Connection String  
**✅ Rešenje:** Gornjih 6 koraka  
**⏱️ Trajanje fixa:** ~10-15 minuta
