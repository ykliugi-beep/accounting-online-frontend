# 🚀 Production Setup Guide

**Status:** Frontend cleanup完成 ✅  
**Date:** 02.12.2025

---

## 📋 Overview

**Шта је урађено:**
- ✅ Обрисани сви dummy подаци из Frontend-а
- ✅ Dashboard користи реалне API позиве
- ✅ DocumentListPage користи реалне API позиве
- ✅ Форме конектоване са Backend API-јем

**Шта МОРА да се уради на Backend-у:**
- ❌ CORS конфигурација (3 линије кода)
- ❌ JWT Token endpoint за тестирање

---

## 🔧 Backend Setup (КРИТИЧНО!)

### 1. Додај CORS у `Program.cs`

**Локација:** `src/ERPAccounting.API/Program.cs`

**Додај ПРЕД `var app = builder.Build();`:**

```csharp
// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",      // Vite dev server
                "http://localhost:5173",      // Alternative Vite port
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("ETag", "Location"); // Expose ETag for autosave
    });
});
```

**Додај ПОСЛЕ `var app = builder.Build();`:**

```csharp
app.UseCors("AllowFrontend"); // MORA biti PRE app.UseAuthorization()!
```

**Финални редослед middleware-а:**
```csharp
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");  // ← ОВДЕ!
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

### 2. Креирај Test JWT Token Endpoint

**Опционо** - само за Development!

**Локација:** `src/ERPAccounting.API/Controllers/AuthController.cs` (нови фајл)

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ERPAccounting.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Generate test JWT token for development
    /// </summary>
    /// <remarks>
    /// ⚠️ SAMO ZA DEVELOPMENT! Obrisati pre produkcije!
    /// </remarks>
    [HttpGet("test-token")]
    public IActionResult GenerateTestToken()
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];

        if (string.IsNullOrEmpty(secretKey))
        {
            return BadRequest("JWT SecretKey not configured");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "test_user"),
            new Claim(ClaimTypes.Email, "test@example.com"),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new
        {
            token = tokenString,
            expiresAt = token.ValidTo,
            instructions = "Copy this token to Frontend .env.local as VITE_JWT_TOKEN"
        });
    }
}
```

---

## 🎨 Frontend Setup

### 1. Креирај `.env.local` фајл

**Локација:** `accounting-online-frontend/.env.local`

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5286/api/v1

# JWT Token (dobij iz Backend Swagger-a ili /api/v1/auth/test-token)
VITE_JWT_TOKEN=your-jwt-token-here

# Dev flags
VITE_ENABLE_MOCK_DATA=false
```

### 2. Генериши JWT Token

**Opcija A - Преко Swagger-а:**
1. Pokreni backend: `dotnet run`
2. Otvori: `http://localhost:5286/swagger`
3. Pronađi endpoint: `GET /api/v1/auth/test-token`
4. Klikni "Try it out" → "Execute"
5. Kopiraj `token` vrednost

**Opcija B - Преко curl-a:**
```bash
curl http://localhost:5286/api/v1/auth/test-token
```

**Dodaj token u `.env.local`:**
```env
VITE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Инсталирај dependencies

```bash
npm install
```

### 4. Покрени апликацију

```bash
npm run dev
```

---

## ✅ Тестирање

### 1. Провери Backend

```bash
# Terminal 1 - Backend
cd accounting-online-backend
dotnet run --project src/ERPAccounting.API

# Провери Swagger
open http://localhost:5286/swagger

# Провери test token endpoint
curl http://localhost:5286/api/v1/auth/test-token
```

### 2. Провери Frontend

```bash
# Terminal 2 - Frontend
cd accounting-online-frontend
npm run dev

# Otvori browser
open http://localhost:3000
```

### 3. Провери React Query Devtools

**Црвени цветић** 🌺 доле лево је React Query Devtools!

Кликни на њега да видиш:
- ✅ API позиви који успеју
- ❌ API позиви који не успеју
- ⏳ Loading state
- 📦 Кеширани подаци

### 4. Провери Console

Отвори Browser DevTools (F12) → Console:
- ✅ Ако нема грешака → Све ради!
- ❌ Ако видиш CORS грешку → Backend CORS није подешен
- ❌ Ако видиш 401 Unauthorized → JWT token није валидан

---

## 🐛 Troubleshooting

### Problem: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Решење:**
1. Провери да ли је `app.UseCors("AllowFrontend");` додат у `Program.cs`
2. Провери да ли је CORS **ПРЕ** `app.UseAuthorization()`
3. Рестартуј Backend

### Problem: "401 Unauthorized"

**Решење:**
1. Генериши нови JWT token (`/api/v1/auth/test-token`)
2. Копирај у `.env.local` као `VITE_JWT_TOKEN`
3. Рестартуј Frontend (`npm run dev`)

### Problem: Dropdown-ови празни

**Решење:**
1. Провери да ли Backend има податке у табелама (Partners, OrganizationalUnits, итд.)
2. Провери React Query Devtools (црвени цветић)
3. Провери Console (F12) за грешке

### Problem: "Cannot find module '@/api'"

**Решење:**
```bash
npm install
```

---

## 📦 Deployment Checklist

**Пре push-а на Production:**

- [ ] Обриши `AuthController.cs` (test token endpoint)
- [ ] Провери `.gitignore` (`.env.local` не сме у git!)
- [ ] Промени CORS origin на production URL
- [ ] Промени `JwtSettings:SecretKey` на production secret
- [ ] Убаци правi Login flow (уместо test token-а)

---

## 🎯 Next Steps

**Након што CORS и JWT раде:**

1. ✅ Тестирај Dashboard (требало би да види реалне документе)
2. ✅ Тестирај Document List (требало би да види реалне документе)
3. ✅ Тестирај креирање документа (требало би да види попуњене dropdown-ове)
4. ✅ Тестирај autosave на ставкама (800ms debounce)
5. ✅ Тестирај TAB navigaciju на grid-у

**Шта недостаје:**
- ❌ TAB-ови на форми (Zaglavlje, Stavke, Troškovi) - требају да се додају
- ❌ Master Data CRUD странице
- ❌ Izveštaji

---

## 📞 Support

**Ако нешто не ради:**

1. Провери React Query Devtools (црвени цветић 🌺)
2. Провери Browser Console (F12)
3. Провери Backend logs
4. Провери да ли је `.env.local` ис

правно подешен

---

**✨ Срећно!** ✨
