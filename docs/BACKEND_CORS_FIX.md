# 🔧 Backend CORS Fix - Тачне Измене за Program.cs

**Датум:** 02.12.2025  
**Фајл:** `src/ERPAccounting.API/Program.cs`  
**Циљ:** Додати CORS подршку за Frontend интеграцију

---

## 📍 ИЗМЕНА #1: Додај CORS Configuration

**Где:** Одмах ПОСЛЕ `builder.Services.AddAuthorization();` (линија ~42)

**Шта додати:**

```csharp
// ============================================================================
// CORS CONFIGURATION - Dozvoli frontend pristup
// ============================================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",      // React default port
                "http://localhost:5173",      // Vite default port
                "http://localhost:5174"       // Vite alternate port
            )
            .AllowAnyMethod()                 // GET, POST, PUT, PATCH, DELETE
            .AllowAnyHeader()                 // Authorization, Content-Type, itd.
            .WithExposedHeaders(              // KRITIČNO: Mora biti exposed!
                "ETag",                       // Za concurrency control
                "X-Total-Count",              // Za pagination
                "Location"                    // Za CreatedAtAction responses
            )
            .AllowCredentials();              // Za cookies/auth
    });
});
```

---

## 📍 ИЗМЕНА #2: Активирај CORS Middleware

**Где:** Одмах ПОСЛЕ `app.UseHttpsRedirection();` (линија ~142)

**Шта додати:**

```csharp
// ============================================================================
// CORS MIDDLEWARE - MORA biti PRE UseAuthentication!
// ============================================================================
app.UseCors("AllowFrontend");
```

---

## 📍 ИЗМЕНА #3: CamelCase JSON (Опционо, али препоручено)

**Где:** У `.AddJsonOptions(options => { ... })` (линија ~50)

**Шта додати:** (на крај postojećih opcija)

```csharp
// CamelCase naming - C# PascalCase -> JSON camelCase
// Id -> id, Naziv -> naziv, DocumentNumber -> documentNumber
options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
```

---

## 📄 КОМПЛЕТАН Program.cs СА ИЗМЕНАМА

```csharp
using ERPAccounting.API.Filters;
using ERPAccounting.Application.Extensions;
using ERPAccounting.Common.Interfaces;
using ERPAccounting.Infrastructure.Middleware;
using ERPAccounting.Infrastructure.Extensions;
using ERPAccounting.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Učitaj JWT konfiguraciju
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtSigningKey = builder.Configuration["Jwt:SigningKey"];

if (string.IsNullOrEmpty(jwtSigningKey))
{
    throw new InvalidOperationException("JWT SigningKey is missing in configuration!");
}

// Dodaj JWT autentifikaciju
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey))
        };
    });

builder.Services.AddAuthorization();

// ============================================================================
// 🔴 ДОДАТО: CORS CONFIGURATION
// ============================================================================
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
// ============================================================================

// Add services to the container with global filters and JSON options
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ETagFilter>();
    options.Filters.Add<ConcurrencyExceptionFilter>();
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.AllowTrailingCommas = true;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
    
    // 🔴 ДОДАТО: CamelCase naming
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddApplicationServices();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ERP Accounting API",
        Version = "v1",
        Description = "Enterprise Resource Planning - Accounting Module API with ETag Concurrency Control"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header koristeći Bearer šemu. Primer: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer",
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ApiAuditMiddleware>();

app.UseHttpsRedirection();

// ============================================================================
// 🔴 ДОДАТО: CORS MIDDLEWARE - МОРА бити ПРЕ UseAuthentication!
// ============================================================================
app.UseCors("AllowFrontend");
// ============================================================================

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

---

## ✅ ПРОВЕРА - Да ли је исправно?

### Редослед Middleware-а (КРИТИЧНО):

```
1. app.UseSwagger()               ✅ OK
2. app.UseSwaggerUI()             ✅ OK
3. app.UseMiddleware<ApiAudit>()  ✅ OK
4. app.UseHttpsRedirection()      ✅ OK
5. app.UseCors("AllowFrontend")   ✅ ДОДАТО - МОРА бити овде!
6. app.UseAuthentication()        ✅ OK
7. app.UseAuthorization()         ✅ OK
8. app.MapControllers()           ✅ OK
9. app.Run()                      ✅ OK
```

**❌ НЕ РАДИ ако је:**
```
app.UseAuthentication();   // PRE CORS-a
app.UseCors();             // Prekasno!
```

**✅ РАДИ ако је:**
```
app.UseCors();             // PRE Authentication-a
app.UseAuthentication();   // Posle CORS-a
```

---

## 🧪 ТЕСТИРАЊЕ

### 1. Restartuj Backend

```bash
# Terminal 1
cd src/ERPAccounting.API
dotnet run

# Очекивано:
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5286
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### 2. Test CORS са curl

```bash
# Test OPTIONS preflight request
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -i \
  http://localhost:5286/api/v1/lookups/partners

# Очекивано:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Expose-Headers: ETag, X-Total-Count, Location  # КРИТИЧНО!
Access-Control-Allow-Credentials: true
```

### 3. Test GET Request са Token

```bash
curl -X GET \
  -H "Origin: http://localhost:5173" \
  -H "Authorization: Bearer {твој_token}" \
  -i \
  http://localhost:5286/api/v1/lookups/partners

# Очекивано:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Expose-Headers: ETag, X-Total-Count, Location
Content-Type: application/json

[
  { "id": 1, "naziv": "Partner 1", ... },
  { "id": 2, "naziv": "Partner 2", ... }
]
```

### 4. Test ETag Exposure

```bash
curl -X GET \
  -H "Authorization: Bearer {token}" \
  -i \
  http://localhost:5286/api/v1/documents/1

# Очекивано:
HTTP/1.1 200 OK
ETag: "AAAAAABrHXs="              # ✅ Мора бити видљив!
Access-Control-Expose-Headers: ETag, X-Total-Count, Location
```

---

## 🐛 TROUBLESHOOTING

### Problem 1: CORS Error у Chrome DevTools

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:5286/api/v1/lookups/partners' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Решење:**
- Провери да ли је `app.UseCors()` **ПРЕ** `app.UseAuthentication()`
- Провери да ли је port тачан у `.WithOrigins()`
- Рестартуј backend

---

### Problem 2: ETag Header није видљив

**Error:** Frontend не може да прочита ETag header

**Решење:**
```csharp
.WithExposedHeaders("ETag", "X-Total-Count", "Location")  // Мора!
```

Без овога, browser блокира ETag header!

---

### Problem 3: 401 Unauthorized упркос токену

**Error:** API враћа 401 иако је token валидан

**Решење:**
- Провери да ли је CORS **ПРЕ** Authentication
- Провери да ли token није expired
- Провери да ли је `Authorization: Bearer {token}` header тачан

---

### Problem 4: JSON Properties су PascalCase уместо camelCase

**Frontend очекује:**
```json
{ "id": 1, "naziv": "...", "pib": "..." }
```

**Backend враћа:**
```json
{ "Id": 1, "Naziv": "...", "Pib": "..." }
```

**Решење:**
```csharp
options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
```

---

## 📋 CHECKLIST

### Pre izmena:
- [ ] Backup тренутног `Program.cs` фајла
- [ ] Backend се компајлира без грешака
- [ ] Swagger ради на http://localhost:5286/swagger

### Tokom izmena:
- [ ] Додао CORS configuration после `AddAuthorization()`
- [ ] Додао `app.UseCors()` ПРЕ `app.UseAuthentication()`
- [ ] Додао `.WithExposedHeaders("ETag", ...)`
- [ ] Додао `PropertyNamingPolicy = CamelCase`
- [ ] Проверио редослед middleware-а

### Posle izmena:
- [ ] Компајлирао без грешака: `dotnet build`
- [ ] Покренуо: `dotnet run`
- [ ] Swagger ради: http://localhost:5286/swagger
- [ ] curl test са OPTIONS прошао
- [ ] curl test са GET прошао
- [ ] ETag header је видљив
- [ ] JSON је camelCase формата

---

## 🚀 СЛЕДЕЋИ КОРАК

Када све ово ради:

1. **Frontend Setup:**
   - Креирај `.env.local` са JWT токеном
   - Покрени `npm run dev`

2. **Integration Test:**
   - Отвори http://localhost:5173
   - Create Document
   - Провери да ли combobox-ови приказују **реалне податке**!

3. **Success!** 🎉
   - Ако видиш реалне партнере из базе (не "Dummy Partner 1") - ради!

---

**📅 Датум:** 02.12.2025  
**✅ Статус:** Тачне инструкције за Program.cs  
**⏱️ Време:** 5 минута за измене + 2 минута за тест  
**🎯 Циљ:** CORS + ETag + CamelCase = Frontend интеграција  
