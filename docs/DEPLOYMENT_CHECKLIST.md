# ✅ DEPLOYMENT CHECKLIST - Шта Недостаје За Покретање

**Датум:** 02.12.2025  
**Статус:** Backend ✅ Povezan sa bazom | API ✅ Testiran | Token ✅ 24h  
**Циљ:** Покренути пројекат над постојећим подацима и тестирати функционалности

---

## ✅ ШТА РАДИ (Потврђено)

### Backend:
- ✅ **Connection String** - Исправан, повезан са базом
- ✅ **API Endpoints** - Сви тестирани преко Swagger-а
- ✅ **JWT Token** - 24h валидност, ручно генерисање ради
- ✅ **Stored Procedures** - Раде (претпостављам, јер су тестирани)
- ✅ **База** - Постојећи подаци из Access апликације

### Frontend:
- ✅ **UI Components** - 100% имплементирано
- ✅ **API Client** - 29 endpoints маппед
- ✅ **State Management** - Zustand + React Query
- ✅ **Forms & Validation** - Комплетно

---

## 🔴 ШТА НЕДОСТАЈЕ - КРИТИЧНО

### 1️⃣ **CORS Конфигурација у Backend**

**Проблем:** Backend `Program.cs` нема CORS!

**Где:** `src/ERPAccounting.API/Program.cs`

**Додај:**
```csharp
// ============= ДОДАЈ PRE builder.Build() =============
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",      // React default
                "http://localhost:5173",      // Vite default
                "http://localhost:5174"       // Vite alternate
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("ETag", "X-Total-Count", "Location")  // КРИТИЧНО!
            .AllowCredentials();
    });
});

// ============= ДОДАЈ POSLE app.UseHttpsRedirection() =============
app.UseCors("AllowFrontend");  // МОРА PRE app.UseAuthentication()!
```

**Зашто је критично:**
- Без овога Browser блокира API позиве (CORS policy error)
- Frontend не може да добије податке
- `WithExposedHeaders("ETag")` је **ОБАВЕЗАН** за concurrency control!

**Тест:**
```bash
# Restartuj backend
dotnet run --project src/ERPAccounting.API

# Testиraj са frontend-a
curl -H "Origin: http://localhost:5173" \
     -H "Authorization: Bearer {token}" \
     http://localhost:5286/api/v1/lookups/partners

# Očekivano: 200 OK + data
```

---

### 2️⃣ **Frontend Environment Конфигурација**

**Проблем:** Нема `.env.local` фајла са правим token-ом!

**Где:** Root frontend projekta

**Креирај:** `.env.local` (НЕ комитуј!)

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:5286/api/v1
VITE_ENABLE_MOCK_DATA=false
VITE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQWRtaW4iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJPcmdhbml6YXRpb25JZCI6IjEiLCJleHAiOjE3MzMyNTk2MDAsImlzcyI6IkVSUEFjY291bnRpbmdBUEkiLCJhdWQiOiJFUlBBY2NvdW50aW5nQ2xpZW50In0.SIGNATURE_HERE
```

**Како генерисати Token:**

**Опција A: Преко Swagger-а**
```bash
1. Покрени backend: dotnet run --project src/ERPAccounting.API
2. Отвори: http://localhost:5286/swagger
3. Нађи /auth/* endpoint
4. Генериши token
5. Копирај у .env.local
```

**Опција B: Додај Test Endpoint (препорука)**
```csharp
// Program.cs - ДОДАЈ PRE app.Run():
app.MapPost("/api/auth/generate-test-token", (IConfiguration config) =>
{
    var handler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(config["Jwt:SigningKey"]!);
    
    var descriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "Admin"),
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim("OrganizationId", "1")
        }),
        Expires = DateTime.UtcNow.AddHours(24),
        Issuer = config["Jwt:Issuer"],
        Audience = config["Jwt:Audience"],
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature)
    };
    
    var token = handler.CreateToken(descriptor);
    return Results.Ok(new 
    { 
        token = handler.WriteToken(token),
        expiresAt = descriptor.Expires
    });
}).AllowAnonymous();  // ВАЖНО: AllowAnonymous!
```

Генерисање:
```bash
curl -X POST http://localhost:5286/api/auth/generate-test-token
```

**Провери `.gitignore`:**
```gitignore
# Environment files
.env.local
.env.*.local
```

---

### 3️⃣ **API Route Префикс - Провера**

**Проблем:** Можда је route prefix другачији!

**Frontend очекује:** `/api/v1/lookups/partners`

**Backend има:** Провери у `Program.cs` или controller attributes

**Провери:**
```csharp
// У Program.cs или controller-ima:
[Route("api/v1/[controller]")]  // ✅ Добро
// vs
[Route("api/[controller]")]      // ❌ Лоше - недостаје v1!
```

**Ако недостаје `v1`:**

**Опција A:** Промени frontend config
```typescript
// src/config/env.ts
API_BASE_URL: 'http://localhost:5286/api'  // bez /v1
```

**Опција B:** Додај v1 у backend routes (препоручено)
```csharp
[Route("api/v1/lookups")]
public class LookupsController : ControllerBase { ... }
```

---

### 4️⃣ **Database Seeding / Initial Data**

**Проблем:** Може бити празна база или недостају референтни подаци!

**Провери:**
```sql
USE Genecom2024Dragicevic;
GO

-- Провери број записа
SELECT 'tblPartner' AS Tabela, COUNT(*) AS BrojZapisa FROM tblPartner
UNION ALL
SELECT 'tblArtikal', COUNT(*) FROM tblArtikal
UNION ALL
SELECT 'tblOrganizacionaJedinica', COUNT(*) FROM tblOrganizacionaJedinica
UNION ALL
SELECT 'tblPoreskaStopaStavka', COUNT(*) FROM tblPoreskaStopaStavka
UNION ALL
SELECT 'tblReferent', COUNT(*) FROM tblReferent;
```

**Ако је празно:**
1. Импортуј податке из Access базе
2. Или креирај seed script

---

### 5️⃣ **DTO Mapping - Провера Поља**

**Проблем:** Backend DTO може имати другачија имена поља од Frontend!

**Frontend очекује:** (из `src/types/api.types.ts`)
```typescript
interface PartnerComboDto {
  id: number;
  naziv: string;
  pib?: string;
  // ...
}
```

**Backend враћа:** (провери LookupsController response)
```csharp
public class PartnerComboDto
{
    public int Id { get; set; }       // ✅ OK -> id
    public string Naziv { get; set; } // ✅ OK -> naziv
    public string Pib { get; set; }   // ✅ OK -> pib
}
```

**Провери:**
```bash
# Testиraj у Swagger-u
GET /api/v1/lookups/partners

# Response:
[
  {
    "id": 1,        // ✅ lowercase
    "naziv": "...",
    "pib": "..."
  }
]
```

**Ако су uppercase (Id, Naziv):**

**Опција A:** Додај у Backend `Program.cs`
```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = 
            JsonNamingPolicy.CamelCase;  // Id -> id
    });
```

**Опција B:** Промени Frontend типове (не препоручено)

---

### 6️⃣ **ETag Header Exposure**

**КРИТИЧНО:** Backend мора експоновати ETag header!

**Провери у CORS:**
```csharp
.WithExposedHeaders("ETag", "X-Total-Count", "Location")
```

**Тест:**
```bash
curl -i -H "Authorization: Bearer {token}" \
     http://localhost:5286/api/v1/documents/1

# Мора да има:
HTTP/1.1 200 OK
ETag: "AAAAAABrHXs="     # ✅ МОРА бити видљив!
Content-Type: application/json
```

**Ако ETag није видљив:**
- Провери CORS `WithExposedHeaders`
- Провери да Backend setује ETag (има ETagFilter)

---

### 7️⃣ **HTTP vs HTTPS**

**Проблем:** Mixed content (Frontend на HTTPS, Backend на HTTP)

**Провери:**
```typescript
// .env.local
VITE_API_BASE_URL=http://localhost:5286/api/v1   // HTTP
// vs
VITE_API_BASE_URL=https://localhost:5286/api/v1  // HTTPS
```

**Препорука за dev:** Користи HTTP на обе стране

**Backend:**
```json
// appsettings.Development.json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:5286"
      }
    }
  }
}
```

**Frontend:**
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:5286/api/v1
```

---

## 🟡 ШТА НЕДОСТАЈЕ - ОПЦИОНАЛНО

### 1. **Logging & Debugging**

**Backend:**
```csharp
// appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",              // Детаљни логови
      "Microsoft.EntityFrameworkCore": "Information"  // SQL queries
    }
  }
}
```

**Frontend:**
```typescript
// src/api/client.ts - Додај interceptor
apiClient.interceptors.request.use((config) => {
  console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);
```

---

### 2. **Error Handling UI**

**Frontend:** Провери да има error toast/snackbar

```typescript
// src/store/uiStore.ts
showSnackbar(message: string, severity: 'error' | 'success' | 'info')
```

Тестирај:
- Network error → Приказује toast?
- 401 Unauthorized → Приказује "Неовлашћен приступ"?
- 409 Conflict → Приказује ConflictDialog?

---

### 3. **Loading States**

**Frontend:** Провери skeleton screens

```typescript
// src/hooks/useCombos.ts
const { isLoading, isError, data } = useCombos();

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage />;
```

---

### 4. **Валидација на Backend-у**

**Провери:** FluentValidation правила

```csharp
public class CreateDocumentDtoValidator : AbstractValidator<CreateDocumentDto>
{
    public CreateDocumentDtoValidator()
    {
        RuleFor(x => x.DocumentNumber).NotEmpty();
        RuleFor(x => x.PartnerId).GreaterThan(0);
        // ...
    }
}
```

Тестирај:
- Submit празна форма → Враћа 400 Bad Request са errors?
- Frontend приказује error messages?

---

## ✅ DEPLOYMENT PROCEDURE

### Step 1: Backend Setup

```bash
# 1. Додај CORS у Program.cs (vidi gore)

# 2. Генериши test token
dotnet run --project src/ERPAccounting.API
curl -X POST http://localhost:5286/api/auth/generate-test-token

# 3. Testiraj endpoint
curl -H "Authorization: Bearer {TOKEN}" \
     http://localhost:5286/api/v1/lookups/partners

# Očekivano: Lista partnera iz baze!
```

---

### Step 2: Frontend Setup

```bash
# 1. Креирај .env.local
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5286/api/v1
VITE_ENABLE_MOCK_DATA=false
VITE_JWT_TOKEN={TOKEN_FROM_STEP_1}
EOF

# 2. Install dependencies (ако није)
npm install

# 3. Покрени dev server
npm run dev
```

---

### Step 3: Integration Test

```bash
# 1. Отвори frontend
http://localhost:5173

# 2. Отвори Chrome DevTools (F12)
# 3. Иди на Network tab
# 4. Кликни "Create Document"

# Провери:
# ✅ Request URL: http://localhost:5286/api/v1/lookups/partners
# ✅ Status: 200 OK
# ✅ Response: Array са партнерима из базе
# ✅ Комбо приказује праве називе (не "Dummy Partner 1")
```

---

### Step 4: Функционални Тест

#### Тест 1: Учитавање Combobox-ова
```
1. Отвори "Create Document"
2. Кликни на "Partner" dropdown
3. ✅ Провери: Виде се прави називи из базе
4. Кликни на "Magacin" dropdown
5. ✅ Провери: Виде се праве организационе јединице
```

#### Тест 2: Креирање Документа
```
1. Попуни све обавезна поља
2. Кликни "Save"
3. ✅ Провери: 201 Created response
4. ✅ Провери: Document ID у response-u
5. Отвори SQL Server
6. ✅ Провери: Нови запис у tblDokument
```

#### Тест 3: Додавање Ставки
```
1. На креираном документу кликни "Add Item"
2. Изабери артикал из combo-а
3. Унеси количину
4. Чекај 800ms (autosave)
5. ✅ Провери: Status indicator "Saved"
6. ✅ Провери: Нови запис у tblStavkaDokumenta
```

#### Тест 4: ETag Conflict
```
1. Отвори исти докумен у 2 tab-а
2. У Tab 1: Промени количину, сачекај save
3. У Tab 2: Промени исту ставку
4. ✅ Провери: 409 Conflict response
5. ✅ Провери: ConflictDialog се приказује
6. Кликни "Refresh"
7. ✅ Провери: Подаци освежени
```

---

## 🎯 SUCCESS CRITERIA

### Систем ради када:

✅ **Combobox-ови приказују реалне податке**
- Не "Dummy Partner 1, 2, 3"
- Праве називе из tblPartner, tblArtikal, итд.

✅ **CRUD операције раде**
- Create → 201 Created + запис у бази
- Read → 200 OK + подаци из базе
- Update → 200 OK + измене у бази
- Delete → 204 No Content + обрисан запис

✅ **Autosave ради**
- Промена у grid → чекај 800ms
- Status "Saving..." → "Saved"
- Провера у бази: измена сачувана

✅ **ETag conflict resolution ради**
- Симултане измене → 409 Conflict
- ConflictDialog се приказује
- Refresh/Overwrite опције раде

✅ **Валидација ради**
- Празна обавезна поља → error messages
- Невалидан формат → error messages

---

## 📋 FINAL CHECKLIST

### Backend:
- [ ] CORS додат у Program.cs
- [ ] `app.UseCors()` PRE `app.UseAuthentication()`
- [ ] WithExposedHeaders садржи "ETag"
- [ ] Test token endpoint додат
- [ ] Connection string валидан
- [ ] Stored procedures постоје и раде
- [ ] База има податке
- [ ] JsonSerializerOptions.PropertyNamingPolicy = CamelCase
- [ ] Backend се покреће без грешака
- [ ] Swagger ради и враћа податке

### Frontend:
- [ ] `.env.local` фајл креиран
- [ ] VITE_JWT_TOKEN setован са валидним 24h token-ом
- [ ] VITE_ENABLE_MOCK_DATA=false
- [ ] VITE_API_BASE_URL показује на backend
- [ ] `.gitignore` садржи `.env.local`
- [ ] `npm install` је извршен
- [ ] Frontend се покреће без грешака
- [ ] Chrome DevTools Network показује API позиве

### Integration:
- [ ] Backend и Frontend раде истовремено
- [ ] Chrome DevTools Console - нема CORS errors
- [ ] Network tab показује 200 OK responses
- [ ] Combobox-ови приказују реалне податке
- [ ] CRUD операције раде
- [ ] Autosave ради
- [ ] ETag conflict resolution ради

---

## 🚀 NEXT STEPS

Када све горе ради:

1. **End-to-end testing** (1-2 дана)
2. **Performance testing** (1 дан)
3. **Security audit** (1 дан)
4. **Staging deployment** (1 дан)
5. **User acceptance testing** (1 недеља)
6. **Production deployment** 🎉

---

**📅 Датум:** 02.12.2025  
**✅ Статус:** Checklist Complete  
**🎯 Циљ:** Систем спреман за тестирање над постојећим подацима
