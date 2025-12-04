# Quick Fix: Network Error - Backend Not Responding

**Datum:** 4. decembar 2025, 4:42 CET  
**Greška:** `Network error - no response from server`  
**Status:** ✅ Rešivo za 5 minuta

---

## 🔴 Problem

Frontend prikazuje grešku:
```
{status: 0, message: 'Network error - no response from server'}
```

**Uzrok:** Backend API server nije pokrenut ili nije dostupan.

---

## ✅ Rešenje - 3 Koraka

### Korak 1: Pokreni Backend Server

```bash
# Otvori NOVI terminal
cd accounting-online-backend

# Pokreni backend
dotnet run --project src/ERPAccounting.API

# Ili ako si u root folderu:
dotnet run --project src/ERPAccounting.API/ERPAccounting.API.csproj
```

**Očekivani output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5286
info: Microsoft.Hosting.Lifetime[0]
      Application started.
```

**Backend će biti dostupan na:** `http://localhost:5286`

---

### Korak 2: Testiraj Backend (Optional)

Otvori browser i idi na:
```
http://localhost:5286/swagger
```

**Trebalo bi da vidiš:**
- Swagger UI sa listom svih API endpointa
- Mogućnost da testiraš API pozive

**Ili testiraj u terminalu:**
```bash
# Test partners search endpoint
curl "http://localhost:5286/api/v1/lookups/partners/search?query=test&limit=10"

# Trebalo bi da vidiš JSON odgovor sa listom partnera
```

---

### Korak 3: Proveri Frontend Konfiguraciju

**Proveri `.env` ili `.env.local` fajl:**

```bash
# U frontend folderu
cd accounting-online-frontend
cat .env.local
# ili
cat .env
```

**Trebalo bi da sadrži:**
```env
VITE_API_BASE_URL=http://localhost:5286/api/v1
VITE_JWT_TOKEN=<tvoj-jwt-token>
```

**Ako fajl ne postoji, kreiraj ga:**
```bash
# Kopiraj example fajl
cp .env.example .env.local

# Ili kreiraj ručno
echo "VITE_API_BASE_URL=http://localhost:5286/api/v1" > .env.local
```

---

## 🔧 Ako Backend i Dalje Ne Radi

### Problem 1: Port 5286 je zauzet

**Proveri:**
```bash
# Windows
netstat -ano | findstr :5286

# Linux/Mac
lsof -i :5286
```

**Rešenje:**
- Zatvori proces koji koristi port 5286
- Ili promeni port u `appsettings.json`

---

### Problem 2: Database Connection Failed

**Greška u backend konzoli:**
```
Failed to connect to SQL Server...
```

**Rešenje:**

1. **Proveri `appsettings.json`:**
```bash
cd src/ERPAccounting.API
cat appsettings.json
```

2. **Proveri connection string:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ERPAccounting;..."
  }
}
```

3. **Proveri da li SQL Server radi:**
```bash
# Windows
services.msc
# Traži "SQL Server (MSSQLSERVER)" i proveri da li je pokrenut

# Ili preko PowerShell
Get-Service MSSQLSERVER
```

---

### Problem 3: JWT Token Nedostaje

**Greška:** `401 Unauthorized`

**Rešenje:**

1. **Generiši JWT token preko Swagger:**
   - Otvori: `http://localhost:5286/swagger`
   - Pronađi endpoint za generisanje tokena
   - Generiši token (valjanost: 24h)

2. **Dodaj token u `.env.local`:**
```env
VITE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Restartuj frontend dev server:**
```bash
# Ctrl+C da zaustaviš
npm run dev
```

---

## ✅ Finalna Provera

### 1. Backend radi?
```bash
curl http://localhost:5286/api/v1/lookups/partners/search?query=test&limit=10
```
**Očekivano:** JSON odgovor sa partnerima

### 2. Frontend se povezuje?
Otvori browser DevTools (F12) > Network tab
- Otvori frontend: `http://localhost:3000`
- Proveri da li vidiš API pozive ka `localhost:5286`
- Status kod trebalo bi da bude `200 OK`

### 3. Autocomplete radi?
- Idi na stranicu sa Partner ili Article autocomplete
- Ukucaj 2+ karaktera
- Trebalo bi da vidiš rezultate u < 500ms

---

## 📊 Očekivano Stanje

**Kada sve radi:**

1. **Backend terminal:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5286
```

2. **Frontend terminal:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

3. **Browser konzola:**
- ✅ Nema "Network error" grešaka
- ✅ API pozivi su uspešni (200 OK)
- ✅ Autocomplete prikazuje rezultate

---

## 🚀 Quick Start Script

**Kreiraj `start-dev.sh` fajl:**

```bash
#!/bin/bash

# Start Backend
echo "🚀 Starting backend..."
cd accounting-online-backend
dotnet run --project src/ERPAccounting.API &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Start Frontend
echo "🚀 Starting frontend..."
cd ../accounting-online-frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Both servers started!"
echo "Backend: http://localhost:5286"
echo "Frontend: http://localhost:3000"
echo "Swagger: http://localhost:5286/swagger"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

**Korišćenje:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

## 📝 Checklist

**Pre pokretanja:**
- [ ] SQL Server je pokrenut
- [ ] Database postoji i ima podatke
- [ ] Backend connection string je tačan
- [ ] Frontend `.env.local` postoji
- [ ] JWT token je generisan (ako je potreban)

**Tokom pokretanja:**
- [ ] Backend se pokreće bez grešaka
- [ ] Backend je dostupan na `localhost:5286`
- [ ] Swagger UI se otvara
- [ ] Frontend se pokreće bez grešaka
- [ ] Frontend može da pristupi backend-u

**Nakon pokretanja:**
- [ ] Nema "Network error" u konzoli
- [ ] API pozivi vraćaju 200 OK
- [ ] Autocomplete prikazuje rezultate
- [ ] Nema browser freezing-a
- [ ] Response time < 500ms

---

## 🆘 Još Uvek Ne Radi?

**Pošalji mi:**

1. **Backend konzola output:**
```bash
dotnet run --project src/ERPAccounting.API 2>&1 | tee backend.log
```

2. **Frontend browser konzola:**
- F12 > Console tab
- Screenshot svih grešaka

3. **Network tab:**
- F12 > Network tab
- Screenshot failed request-a

4. **Environment:**
```bash
# Backend
dotnet --version
# SQL Server verzija

# Frontend
node --version
npm --version
```

---

## ✅ Kada Sve Radi

**Sledeći korak:**

Prati [AUTOCOMPLETE_TESTING_GUIDE.md](./AUTOCOMPLETE_TESTING_GUIDE.md) za kompletno testiranje autocomplete funkcionalnosti.

---

**Srećno! 🚀**
