# 🚀 ФИНАЛНЕ ИНСТРУКЦИЈЕ ЗА ТЕСТИРАЊЕ

**Датум:** 02.12.2025  
**Статус:** ✅ Frontend Fixed | ⏳ Backend CORS Needs Fix  
**Циљ:** Покренути комплетан систем и тестирати функционалности

---

## 📋 ШТА ЈЕ УРАЂЕНО

### ✅ Frontend (Комплетно):
- [x] Routing фиксован - све VP/MP руте воде на `DocumentCreatePage`
- [x] Форма за Улазну Калкулацију са 3 TAB-а имплементирана
- [x] API client са 29 endpoints
- [x] Autosave са 800ms debounce
- [x] ETag concurrency control
- [x] Conflict resolution dialog
- [x] 61 unit тестова

### ⏳ Backend (Потребно CORS):
- [x] 11 Lookup endpoints
- [x] 5 Documents endpoints
- [x] 5 LineItems endpoints + ETag
- [x] Costs endpoints
- [x] Connection string
- [ ] **CORS конфигурација - МОРА ДОДАТИ!**
- [ ] **JWT token generisanje**

---

## 🔧 КОРАК 1: BACKEND SETUP (5 минута)

### 1.1. Додај CORS у Program.cs

**Фајл:** `src/ERPAccounting.API/Program.cs`

**Локација 1:** Одмах **ПОСЛЕ** `builder.Services.AddAuthorization();` (линија ~42)

```csharp
builder.Services.AddAuthorization();

// 🔴 ДОДАЈ ОВДЕ:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5174"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("ETag", "X-Total-Count", "Location")
            .AllowCredentials();
    });
});
```

**Локација 2:** Одмах **ПОСЛЕ** `app.UseHttpsRedirection();` (линија ~142)

```csharp
app.UseHttpsRedirection();

// 🔴 ДОДАЈ ОВДЕ (МОРА БИТИ ПРЕ UseAuthentication!):
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
```

**Локација 3 (Опционо):** Унутар `.AddJsonOptions()` на крају

```csharp
.AddJsonOptions(options =>
{
    // ... existing options ...
    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
    
    // 🔴 ДОДАЈ ОВДЕ:
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
```

### 1.2. Генериши JWT Token

**Опција A: Додај test endpoint у Program.cs (пре `app.Run()`):**

```csharp
// Test token endpoint - само за development!
app.MapPost("/api/auth/generate-test-token", (IConfiguration config) =>
{
    var handler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(config["Jwt:SigningKey"]!);
    
    var descriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "TestUser"),
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
}).AllowAnonymous();
```

### 1.3. Build и Run Backend

```bash
# Terminal 1 - Backend
cd src/ERPAccounting.API

# Build
dotnet build

# Run
dotnet run

# Очекивано:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: http://localhost:5286
# info: Microsoft.Hosting.Lifetime[0]
#       Application started. Press Ctrl+C to shut down.
```

### 1.4. Генериши Token

```bash
# Terminal 2
curl -X POST http://localhost:5286/api/auth/generate-test-token

# Очекивано:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expiresAt": "2025-12-03T15:30:00Z"
# }

# КОПИРАЈ TOKEN!
```

### 1.5. Тестирај Backend

```bash
# Тестирај CORS
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -i \
  http://localhost:5286/api/v1/lookups/partners

# Очекивано:
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Expose-Headers: ETag, X-Total-Count, Location

# Тестирај API са Token-ом
curl -X GET \
  -H "Authorization: Bearer {твој_token}" \
  http://localhost:5286/api/v1/lookups/partners

# Очекивано:
# [
#   { "id": 1, "naziv": "Partner 1", ... },
#   { "id": 2, "naziv": "Partner 2", ... }
# ]
```

---

## 🔧 КОРАК 2: FRONTEND SETUP (2 минута)

### 2.1. Креирај .env.local

**Фајл:** `accounting-online-frontend/.env.local` (у root-у)

```bash
# Креирај фајл
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:5286/api/v1
VITE_ENABLE_MOCK_DATA=false
VITE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF

# ЗАМЕНИ token са оним из корака 1.4!
```

**Или ручно креирај:**

```env
VITE_API_BASE_URL=http://localhost:5286/api/v1
VITE_ENABLE_MOCK_DATA=false
VITE_JWT_TOKEN=<PASTE_TOKEN_HERE>
```

### 2.2. Провери .gitignore

```bash
# Провери да ли је .env.local игнорисан
cat .gitignore | grep ".env.local"

# Очекивано:
# .env.local
```

### 2.3. Install Dependencies (ако није)

```bash
# Terminal 3 - Frontend
cd accounting-online-frontend

# Install
npm install
```

### 2.4. Run Frontend

```bash
# Покрени
npm run dev

# Очекивано:
#   VITE v5.x.x  ready in xxx ms
#
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
```

---

## 🧪 КОРАК 3: ТЕСТИРАЊЕ ИНТЕГРАЦИЈЕ (10 минута)

### 3.1. Отвори Апликацију

```
1. Отвори: http://localhost:5173
2. Chrome DevTools: F12 (Network tab + Console tab)
```

---

### 3.2. Тест #1: Dashboard

**Акција:**
- Отвори: http://localhost:5173/

**✅ Очекивано:**
- Приказује се Dashboard са картицама
- "Dokumenti ovog meseca", "Vrednost prometa", "Stavki na lageru", "Dugovanja"
- **Брзе Акције** дугмад
- **Недавни Документи** листа

**❌ Ако не ради:**
- Провери да ли је frontend покренут (Terminal 3)
- Провери URL (мора бити `http://localhost:5173/`)

---

### 3.3. Тест #2: Навигација до Форме

**Акција:**
1. Лева страна мени → **"Dokumenti"** → **"VP"** → **"Ulazni računi"**
2. Или: URL bar → `http://localhost:5173/documents/vp/ur`

**✅ Очекивано:**
- URL: `http://localhost:5173/documents/vp/ur`
- Приказује се **ФОРМА** (не Dashboard!)
- Наслов: "Ulazna Kalkulacija VP" или "Create Document"
- Има **3 tab-a**: "Zaglavlje", "Stavke", "Troškovi"

**❌ Ако види Dashboard:**
- Провери да ли је `src/App.tsx` измењен (commit: `02287075`)
- Hard refresh: Ctrl+Shift+R
- Proveri Console за errors

---

### 3.4. Тест #3: Учитавање Combobox-ова

**Акција:**
1. TAB "Zaglavlje"
2. Кликни на **"Dobavljač"** dropdown

**✅ Очекивано:**
- Chrome DevTools Network:
  - Request: `GET /api/v1/lookups/partners`
  - Status: **200 OK**
  - Response: `[{ "id": 1, "naziv": "Реални Партнер", ... }]`
- Dropdown приказује **реалне називе** из базе (не "Dummy Partner 1"!)

**✅ Провери све комбобоксове:**
- Магацин → `/api/v1/lookups/organizational-units`
- Oporezivanje → `/api/v1/lookups/taxation-methods`
- Referent → `/api/v1/lookups/referents`

**❌ Ако не учитава:**
- Console Error: "CORS policy" → Backend CORS није додат (иди на Корак 1.1)
- Console Error: "401 Unauthorized" → Token је погрешан или expired (иди на Корак 1.4)
- Console Error: "Network Error" → Backend није покренут (иди на Корак 1.3)
- Приказује "Dummy Partner 1" → `VITE_ENABLE_MOCK_DATA=true` (промени на `false`)

---

### 3.5. Тест #4: Креирање Документа

**Акција:**
1. Попуни сва поља:
   - Број Документа: `UR-2025-001`
   - Датум: `02.12.2025`
   - Dobavljač: Изабери из dropdown-а
   - Магацин: Изабери из dropdown-а
   - Oporezivanje: Изабери из dropdown-а
2. Кликни **"Save"** или **"Sačuvaj"**

**✅ Очекивано:**
- Network: `POST /api/v1/documents`
- Status: **201 Created**
- Response: `{ "id": 123, "documentNumber": "UR-2025-001", ... }`
- Форма остаје отворена са новим ID-јем
- Сада можеш додавати ставке!

**❌ Ако не ради:**
- 400 Bad Request → Провери валидацију (нека поља су обавезна)
- 401 Unauthorized → Token expired (генериши нови)
- 500 Internal Server Error → Backend грешка (провери backend Terminal 1)

---

### 3.6. Тест #5: Додавање Ставки

**Акција:**
1. TAB **"Stavke"**
2. Кликни **"+ Dodaj Stavku"** или једноставно почни куцати у grid
3. Изабери **Artikal** из dropdown-а
4. Унеси **Količinu**: `10`
5. Унеси **Cenu**: `1000`
6. **Сачекај 800ms** (autosave!)

**✅ Очекивано:**
- Grid приказује нову ставку
- Статус: "Saving..." → "Saved ✓"
- Network: `POST /api/v1/documents/{id}/items`
- Status: **201 Created**
- Response: `{ "id": 1, "articleId": 5, "quantity": 10, ... }`
- Израчунат **Iznos**: `10 * 1000 = 10,000`
- **ETag header присутан**!

**❌ Ако не ради:**
- Autosave не ради → Провери да ли је 800ms прошло
- ETag header недостаје → Backend CORS `WithExposedHeaders` (Корак 1.1)
- Grid не дозвољава едитовање → Провери да ли је документ сачуван (мора имати ID)

---

### 3.7. Тест #6: Autosave

**Акција:**
1. У grid-у, **промени количину** постојеће ставке: `10` → `15`
2. **Сачекај 800ms**
3. **НЕ кликај Save!**

**✅ Очекивано:**
- Статус indicator: "Saving..." → "Saved ✓"
- Network: `PATCH /api/v1/documents/{docId}/items/{itemId}`
- Header: `If-Match: "{ETag}"`
- Status: **200 OK**
- Response: нови ETag
- Износ аутоматски прерачунат: `15 * 1000 = 15,000`

**❌ Ако не ради:**
- 409 Conflict → ETag concurrency (види Тест #8)
- Autosave не ради → Провери debounce timing

---

### 3.8. Тест #7: ETag Conflict Resolution

**Акција:**
1. Отвори **исти документ у 2 Chrome tab-а** (Ctrl+Click на линк)
2. **Tab 1:** Промени количину ставке: `15` → `20`, сачекај save
3. **Tab 2:** Промени **исту ставку**: `15` → `25`, сачекај save

**✅ Очекивано:**
- Tab 1: Save успешан (200 OK)
- Tab 2: **409 Conflict** error
- **ConflictDialog** се приказује:
  - "Conflict Detected"
  - "Another user has modified this item"
  - Опције: **"Refresh"** или **"Overwrite"**
- Кликни **"Refresh"** → учита нове податке (количина = 20)

**❌ Ако не ради:**
- Не приказује dialog → Провери error handling
- 200 OK у оба tab-а → Backend не користи ETag!

---

### 3.9. Тест #8: Трошкови

**Акција:**
1. TAB **"Troškovi"**
2. Кликни **"+ Dodaj Trošak"**
3. Изабери **Врста Документа**, **Partner**, унеси **Iznos**
4. Изабери **Начин Дељења**: "Po Količini" или "Po Vrednosti"
5. Save

**✅ Очекивано:**
- Трошак се додаје
- Network: `POST /api/v1/documents/{id}/costs`
- Status: **201 Created**
- **Raspodela** се приказује (колико иде на сваки артикал)
- Укупан трошак се додаје на набавну цену

---

### 3.10. Тест #9: Провера у Бази

**Акција:**
1. Отвори **SQL Server Management Studio**
2. Query:

```sql
USE Genecom2024Dragicevic;
GO

-- Провери креирани документ
SELECT TOP 10 * 
FROM tblDokument 
ORDER BY DatumKreiranja DESC;

-- Провери ставке
SELECT * 
FROM tblStavkaDokumenta 
WHERE DokumentID = 123;  -- Замени са правим ID-јем

-- Провери трошкове
SELECT * 
FROM tblDokumentTroskovi 
WHERE DokumentID = 123;
```

**✅ Очекивано:**
- Нови записи постоје!
- Подаци су тачни (број документа, партнер, артикли, количине, цене)
- `RowVersion` поље је попуњено (за ETag)

---

## ✅ SUCCESS CRITERIA

### Систем ради ако:

- [x] Backend се покреће без грешака
- [x] Frontend се покреће без грешака
- [x] Dashboard се учитава
- [x] Навигација на "Ulazni računi" приказује **форму** (не Dashboard)
- [x] Combobox-ови учитавају **реалне податке** из базе
- [x] Можеш креирати документ (201 Created)
- [x] Можеш додати ставке (201 Created)
- [x] Autosave ради (800ms debounce)
- [x] ETag header је присутан
- [x] Conflict resolution ради (409 → Dialog)
- [x] Можеш додати трошкове
- [x] Подаци се чувају у бази
- [x] **НЕМА "Dummy Partner 1" - само реални подаци!**

---

## ❌ TROUBLESHOOTING

### Problem 1: "CORS policy" Error

**Symptom:**
```
Access to XMLHttpRequest at 'http://localhost:5286/api/v1/lookups/partners' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
1. Провери да ли је CORS додат у `Program.cs` (Корак 1.1)
2. Провери да ли је `app.UseCors()` **ПРЕ** `app.UseAuthentication()`
3. Рестартуј backend

---

### Problem 2: "401 Unauthorized"

**Symptom:**
```json
{ "status": 401, "message": "Unauthorized" }
```

**Solution:**
1. Провери да ли је token у `.env.local`
2. Провери да ли token није expired (24h)
3. Генериши нови token (Корак 1.4)
4. Рестартуј frontend

---

### Problem 3: Приказује се Dashboard уместо форме

**Symptom:**
- URL: `http://localhost:5173/documents/vp/ur`
- Приказ: Dashboard

**Solution:**
1. Провери да ли је `src/App.tsx` измењен (commit `02287075`)
2. Hard refresh: Ctrl+Shift+R
3. Очисти cache: F12 → Application → Clear storage
4. Отвори Incognito prozor

---

### Problem 4: Combobox-ови су празни

**Symptom:**
- Dropdown је празан
- Или приказује "Dummy Partner 1"

**Solution:**
1. `.env.local`: `VITE_ENABLE_MOCK_DATA=false`
2. Провери Network tab - да ли API позив успева?
3. Провери Response - да ли враћа податке?
4. Провери Connection String у backend-у
5. Провери да ли stored procedures постоје и враћају податке

---

### Problem 5: ETag header није видљив

**Symptom:**
- Frontend не може да прочита ETag
- Conflict resolution не ради

**Solution:**
1. Backend CORS: `.WithExposedHeaders("ETag", "X-Total-Count", "Location")`
2. Провери у Network tab → Response Headers → да ли је `Access-Control-Expose-Headers: ETag`
3. Рестартуј backend

---

### Problem 6: Autosave не ради

**Symptom:**
- Промениш поље, али се не чува
- Нема "Saving..." индикатора

**Solution:**
1. Провери да ли је документ сачуван (мора имати ID)
2. Сачекај пуних 800ms (не кликај одмах другде)
3. Провери Console за errors
4. Провери Network tab - да ли шаље PATCH request?

---

## 📄 ДОКУМЕНТАЦИЈА

### Креирани документи у овом процесу:

1. **[CORRECTED_ANALYSIS.md](docs/CORRECTED_ANALYSIS.md)** - Backend ЈЕ имплементиран (испавка)
2. **[INTEGRATION_PROBLEM.md](docs/INTEGRATION_PROBLEM.md)** - Root cause + решење
3. **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Deployment checklist
4. **[BACKEND_CORS_FIX.md](docs/BACKEND_CORS_FIX.md)** - Тачне измене за Program.cs
5. **[ROUTING_FIX.md](docs/ROUTING_FIX.md)** - Routing fix објашњење
6. **[FINAL_TESTING_INSTRUCTIONS.md](docs/FINAL_TESTING_INSTRUCTIONS.md)** - Овај документ

### Измењени фајлови:

- **`src/App.tsx`** (commit: `02287075`) - Routing fix
- **`src/ERPAccounting.API/Program.cs`** - Потребно додати CORS (Корак 1.1)

---

## 🚀 NEXT STEPS

### Након успешног тестирања:

1. **End-to-end testing** - Тестирај све типове докумената (FO, FZ, AR, итд.)
2. **Додај остале документе** - 17 VP типова, 14 MP типова
3. **Performance testing** - Велики број ставки
4. **Security audit** - Провери JWT, CORS, валидацију
5. **Staging deployment** - Deploy на test server
6. **User acceptance testing** - Крајњи корисници
7. **Production deployment** 🎉

---

## 🎯 FINALNI STATUS

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  FRONTEND:  ✅ 100% READY                                   ┃
┃  BACKEND:   ⏳ 99% READY (need CORS + token)                ┃
┃  DATABASE:  ✅ EXISTING DATA                                ┃
┃  ROUTING:   ✅ FIXED                                        ┃
┃                                                            ┃
┃  READY FOR: Integration Testing                            ┃
┃  TIME:      ~17 minutes setup + testing                    ┃
┃  RESULT:    🟢 WORKING SYSTEM with REAL DATA!                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

**📅 Датум:** 02.12.2025  
**✅ Статус:** Комплетне инструкције  
**⏱️ Време:** 17 минута (5 backend + 2 frontend + 10 testing)  
**🎯 Циљ:** Радан систем са реалним подацима из базе!  
**🚀 Резултат:** Кликом на "Улазни рачуни" → Форма са 3 TAB-а → Реални подаци! ✅
