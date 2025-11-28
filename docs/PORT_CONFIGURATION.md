# Port Configuration - Frontend & Backend

## Pregled Portova

| Servis | Port | Protocol | URL | Namena |
|--------|------|----------|-----|--------|
| **Frontend Dev** | `3000` | HTTP | http://localhost:3000 | Vite development server |
| **Backend API** | `5286` | HTTP | http://localhost:5286 | ASP.NET Core API (HTTP) |
| **Backend API** | `7280` | HTTPS | https://localhost:7280 | ASP.NET Core API (HTTPS) |
| **Swagger UI** | `5286` | HTTP | http://localhost:5286/swagger | API dokumentacija |

## Frontend Konfiguracija

### 1. Environment Variables (`.env.local`)

```env
VITE_API_BASE_URL=http://localhost:5286/api/v1
VITE_ENABLE_MOCK_DATA=false
VITE_JWT_TOKEN=your-token-here
```

**Šta ovo znači:**
- Frontend će slati sve API pozive na `http://localhost:5286/api/v1`
- Mock data je isključen (koristi pravi backend)
- JWT token se automatski dodaje u Authorization header

### 2. Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  server: {
    port: 3000,        // Frontend radi na portu 3000
    proxy: {
      '/api': {
        target: 'http://localhost:5286',  // Proksira API pozive na backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

**Kako proxy radi:**
```
Request:  http://localhost:3000/api/v1/documents
           ↓
Proxy:    http://localhost:5286/api/v1/documents
           ↓
Backend:  Obrađuje zahtev i vraća odgovor
```

### 3. API Client (`src/config/env.ts`)

```typescript
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5286/api/v1',
  JWT_TOKEN: import.meta.env.VITE_JWT_TOKEN || '',
  // ...
}
```

**Fallback vrednosti:**
- Ako `VITE_API_BASE_URL` nije setovan, koristi default `http://localhost:5286/api/v1`
- Ako `VITE_JWT_TOKEN` nije setovan, koristi prazan string (API pozivi će failovati)

## Backend Konfiguracija

### 1. Launch Settings (`src/ERPAccounting.API/Properties/launchSettings.json`)

```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5286"
    },
    "https": {
      "applicationUrl": "https://localhost:7280;http://localhost:5286"
    }
  }
}
```

**Pokretanje:**
```bash
# Samo HTTP (preporučeno za development)
dotnet run --launch-profile http

# HTTP + HTTPS
dotnet run --launch-profile https
```

### 2. Program.cs

Backend automatski sluša na portovima definisanim u `launchSettings.json`. Nema potrebe za eksplicitnom konfiguracijom u kodu.

## Kako Testirati Konekciju

### 1. Proveri Backend

```bash
# Otvori Swagger UI
http://localhost:5286/swagger

# Ili pozovi health endpoint (ako postoji)
curl http://localhost:5286/api/v1/health
```

**Očekivano:** Swagger UI se otvara, vidiš sve API endpoints

### 2. Proveri Frontend

```bash
# Otvori frontend
http://localhost:3000

# Otvori Developer Tools (F12) -> Network tab
# Vidiš API pozive ka http://localhost:5286/api/v1/...
```

**Očekivano:** 
- Frontend se učitava
- API pozivi u Network tabu pokazuju status 200 (ili 401 ako token nije setovan)
- `Authorization: Bearer ...` header je prisutan

### 3. Testiranje Putem cURL

```bash
# Generiši token i testiranje direktnog poziva
curl -X GET "http://localhost:5286/api/v1/documents" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Očekivano:** JSON response sa dokumentima (ili prazna lista)

## Troubleshooting

### Problem: "Connection refused" ili "ERR_CONNECTION_REFUSED"

**Uzroci:**
1. Backend nije pokrenut
2. Backend radi na drugom portu
3. Firewall blokira konekciju

**Rešenje:**
```bash
# 1. Proveri da li backend radi
netstat -ano | findstr :5286     # Windows
lsof -i :5286                     # Mac/Linux

# 2. Pokreni backend ako nije pokrenut
cd src/ERPAccounting.API
dotnet run

# 3. Proveri da li se Swagger otvara
# Otvori: http://localhost:5286/swagger
```

### Problem: "Port 3000 is already in use"

**Uzrok:** Neki drugi proces koristi port 3000

**Rešenje:**
```bash
# Windows: Nađi i zaustavi proces
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux: Nađi i zaustavi proces
lsof -i :3000
kill -9 <PID_NUMBER>

# Ili promeni port u vite.config.ts:
server: {
  port: 3001,  // Koristi drugi port
}
```

### Problem: "Port 5286 is already in use"

**Uzrok:** Neki drugi proces koristi port 5286

**Rešenje:**
```bash
# Nađi proces
netstat -ano | findstr :5286     # Windows
lsof -i :5286                     # Mac/Linux

# Zaustavi proces ili promeni port u launchSettings.json
```

### Problem: CORS greške

**Uzrok:** Backend ne dozvoljava zahteve sa `http://localhost:3000`

**Rešenje:** Proveri `Program.cs` u backendu:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

### Problem: 401 Unauthorized

**Uzrok:** JWT token nije setovan ili je istekao

**Rešenje:**
1. Generiši novi token iz backenda (Swagger)
2. Dodaj u `.env.local`
3. Restartuj frontend dev server

Vidi: [JWT_TOKEN_SETUP.md](JWT_TOKEN_SETUP.md)

## Best Practices

### Development
- ✅ Koristi HTTP za backend (port 5286) - brže i bez SSL problema
- ✅ Koristi Vite proxy za API pozive - izbegava CORS probleme
- ✅ JWT token čuvaj u `.env.local` (ova datoteka je u `.gitignore`)
- ✅ Generiši novi token svaki dan (ističe nakon 24h)

### Production
- ⚠️ Ne hardkoduj JWT token
- ⚠️ Koristi HTTPS za backend
- ⚠️ Implementiraj pravilan login flow
- ⚠️ Koristi environment-specific konfiguraciju

## Summary

```
┌──────────────────────────┐
│   Browser                  │
│   http://localhost:3000    │
└───────────┬─────────────┘
            │
            │ React App
            │ (Vite Dev Server)
            │
            v
┌──────────────────────────┐
│   Vite Proxy              │
│   /api/* -> :5286         │
└───────────┬─────────────┘
            │
            │ HTTP Request
            │ + Authorization: Bearer <token>
            │
            v
┌──────────────────────────┐
│   Backend API             │
│   http://localhost:5286   │
│   /api/v1/*               │
└──────────────────────────┘
```

**Ključne tačke:**
1. Frontend: `3000`
2. Backend: `5286` (HTTP) ili `7280` (HTTPS)
3. Proxy radi automatski
4. JWT token obavezan za API pozive
