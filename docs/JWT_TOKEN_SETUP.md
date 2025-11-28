# JWT Token Setup for Development

## Quick Start

Frontend zahteva JWT token za autentifikaciju sa backendom. Za testiranje koristimo hardkodovani token u `.env.local` fajlu.

## Kako generisati token

### Opcija 1: Preko Swagger UI (Najlakše)

1. Pokreni backend projekat:
   ```bash
   cd src/ERPAccounting.API
   dotnet run
   ```

2. Otvori Swagger u browseru:
   ```
   http://localhost:5286/swagger
   ```

3. Pronađi Auth endpoint (ako postoji) i generiši token

4. Kopiraj token (bez "Bearer" prefiksa)

### Opcija 2: Ručno kreiranje tokena (Alternativa)

Ako backend ima servis za generisanje tokena, možeš kreirati C# konzolnu aplikaciju ili dodati endpoint koji generiše test token.

## Kako postaviti token u frontend

1. Otvori `.env.local` fajl u root direktorijumu frontend projekta

2. Zameni `your-test-token-here` sa pravim tokenom:
   ```env
   VITE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Sačuvaj fajl

4. Restartuj Vite dev server:
   ```bash
   npm run dev
   ```

## Token format

Token treba da bude u JWT formatu i mora da sadrži:
- `exp` (expiration) - postavi na 24h od sada
- Korisničke claims koje backend očekuje

## Token je istekao?

Kada token istekne (posle 24h), videćeš 401 Unauthorized greške u konzoli. 

**Rešenje:**
1. Generiši novi token (koraci iznad)
2. Zameni staru vrednost u `.env.local`
3. Restartuj dev server

## Napomena za produkciju

Ovo je **SAMO ZA TESTIRANJE**! 

U produkciji:
- Token ne sme biti hardkodovan
- Implementirati pravilan login flow
- Token čuvati u memory/sessionStorage
- Implementirati refresh token mehanizam

## Troubleshooting

### Problem: 401 Unauthorized
- Proveri da li je token ispravan
- Proveri da li je token istekao
- Proveri da li backend radi na portu 5286

### Problem: 403 Forbidden
- Token je validan ali korisnik nema potrebne permisije
- Generiši token sa Admin rolom ako je potrebno

### Problem: Token se ne šalje
- Proveri da li je `VITE_JWT_TOKEN` setovan u `.env.local`
- Proveri da li dev server vidi promene (restart)
- Proveri Network tab u Dev Tools - vidi li se Authorization header?
