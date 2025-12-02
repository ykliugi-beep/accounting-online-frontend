# ✅ VERIFIKACIJA MAPIRANJA DTO ↔ BAZA PODATAKA

**Datum:** 27.11.2025  
**Status:** ✅ Kompletna Verifikacija - Svi Atributi Pravilno Mapirani

---

## 📋 Izvršitelj Pregled

Detaljno je provereno mapiranje **svih atributa** između JSON request/response DTOs i database tabela.

### Proverene Komponente

1. ✅ **Document** - Zaglavlje dokumenata (tblDokument)
2. ✅ **DocumentLineItem** - Stavke dokumenata (tblStavkaDokumenta)
3. ✅ **DocumentCost** - Zavisni troškovi - zaglavlje (tblDokumentTroskovi)
4. ✅ **DocumentCostItem** - Stavke zavisnih troškova (tblDokumentTroskoviStavka)
5. ✅ **DocumentCostVAT** - PDV stavke troškova (tblDokumentTroskoviStavkaPDV)
6. ✅ **Lookup/Combo Endpoints** - Stored Procedures mapiranje

---

## 1. Document DTOs ↔ tblDokument

### CreateDocumentDto → tblDokument

**Sve polje iz DTO-a su tačno mapirane na database kolone:**

| DTO Property | DB Column | Tip | Obavezno | Status |
|--------------|-----------|-----|----------|--------|
| `documentTypeCode` | `IDVrstaDokumenta` | char(2) | ✅ | ✅ Tačno |
| `documentNumber` | `BrojDokumenta` | varchar(30) | ✅ | ✅ Tačno |
| `date` | `Datum` | datetime | ✅ | ✅ Tačno |
| `partnerId` | `IDPartner` | int | ❌ | ✅ Tačno |
| `organizationalUnitId` | `IDOrganizacionaJedinica` | int | ✅ | ✅ Tačno |
| `referentId` | `IDRadnik` | int | ❌ | ✅ Tačno |
| `dueDate` | `DatumDPO` | datetime | ❌ | ✅ Tačno |
| `currencyDate` | `DatumValute` | datetime | ❌ | ✅ Tačno |
| `partnerDocumentNumber` | `PartnerBrojDokumenta` | varchar(200) | ❌ | ✅ Tačno |
| `partnerDocumentDate` | `PartnerDatumDokumenta` | datetime | ❌ | ✅ Tačno |
| `taxationMethodId` | `IDNacinOporezivanja` | int | ❌ | ✅ Tačno |
| `statusId` | `IDStatus` | int | ❌ | ✅ Tačno |
| `currencyId` | `IDValuta` | int | ❌ | ✅ Tačno |
| `exchangeRate` | `KursValute` | money | ❌ | ✅ Tačno |
| `notes` | `Napomena` | varchar(max) | ❌ | ✅ Tačno |

**Auto-generisano (backend):**
- `IDDokument` ← IDENTITY(1,1) ✅
- `DokumentTimeStamp` ← SQL Server TIMESTAMP (RowVersion za ETag) ✅
- `UserName` ← iz JWT tokena ✅
- `UserDatum` ← GETUTCDATE() ✅

**Zaključak:** ✅ **SVA POLJA PRAVILNO MAPIRANA**

---

## 2. DocumentLineItem DTOs ↔ tblStavkaDokumenta

### CreateDocumentLineItemDto → tblStavkaDokumenta

| DTO Property | DB Column | Tip | Obavezno | Status |
|--------------|-----------|-----|----------|--------|
| `articleId` | `IDArtikal` | int | ✅ | ✅ Tačno |
| `quantity` | `Kolicina` | money | ✅ | ✅ Tačno (CHECK <> 0) |
| `invoicePrice` | `FakturnaCena` | money | ✅ | ✅ Tačno |
| `discount` | `Rabat` | money | ❌ | ✅ Tačno (default 0) |
| `taxRateId` | `IDPoreskaStopa` | char(2) | ❌ | ✅ Tačno |
| `taxRatePercentage` | `ProcenatPoreza` | money | ❌ | ✅ Tačno |
| `unitOfMeasure` | `IDJedinicaMere` | varchar(6) | ✅ | ✅ Tačno |
| `statusId` | `IDStatus` | int | ❌ | ✅ Tačno |
| `notes` | `Opis` | varchar(1024) | ❌ | ✅ Tačno |

**Auto-izračunato (backend):**
```csharp
IznosPDV = (Kolicina * FakturnaCena - Rabat) * (ProcenatPoreza / 100)
Iznos = Kolicina * FakturnaCena - Rabat + IznosPDV
```
- `IznosPDV` ✅ Ispravno
- `Iznos` ✅ Ispravno
- `IDStavkaDokumenta` ← IDENTITY(1,1) ✅
- `StavkaDokumentaTimeStamp` ← SQL Server TIMESTAMP (RowVersion za ETag) ✅

**Zaključak:** ✅ **SVA POLJA PRAVILNO MAPIRANA + AUTO-CALCULATE ISPRAVNO**

---

### PatchDocumentLineItemDto → tblStavkaDokumenta

**KRITIČNO:** Ovo je **parcijalno ažuriranje**. Sva polja su opciona (nullable). Ažuriraju se **samo prosleđena polja**.

| DTO Property | DB Column | Tip | Status |
|--------------|-----------|-----|--------|
| `quantity?` | `Kolicina` | money | ✅ Tačno (ako prosleđeno) |
| `invoicePrice?` | `FakturnaCena` | money | ✅ Tačno (ako prosleđeno) |
| `discount?` | `Rabat` | money | ✅ Tačno (ako prosleđeno) |
| `margin?` | `Marza` | money | ✅ Tačno (ako prosleđeno) |
| `taxRateId?` | `IDPoreskaStopa` | char(2) | ✅ Tačno (ako prosleđeno) |
| `taxRatePercentage?` | `ProcenatPoreza` | money | ✅ Tačno (ako prosleđeno) |
| `unitOfMeasure?` | `IDJedinicaMere` | varchar(6) | ✅ Tačno (ako prosleđeno) |
| `statusId?` | `IDStatus` | int | ✅ Tačno (ako prosleđeno) |
| `notes?` | `Opis` | varchar(1024) | ✅ Tačno (ako prosleđeno) |

**Backend automatski:**
- `IznosPDV` - Preračunava se nakon svake promene cene/količine/rabata ✅
- `Iznos` - Preračunava se nakon svake promene ✅
- `StavkaDokumentaTimeStamp` - Novi RowVersion (automatski SQL Server) ✅

**Primer:**
```json
// User menja samo količinu
PATCH /api/v1/documents/5001/items/10001
{
  "quantity": 3
}

// Backend:
// 1. Ažurira Kolicina = 3
// 2. Preračunava IznosPDV = (3 * FakturnaCena - Rabat) * (ProcenatPoreza / 100)
// 3. Preračunava Iznos = 3 * FakturnaCena - Rabat + IznosPDV
// 4. SQL Server automatski ažurira StavkaDokumentaTimeStamp
```

**Zaključak:** ✅ **PATCH OPCIONA POLJA PRAVILNO IMPLEMENTIRANA**

---

## 3. DocumentCost DTOs ↔ tblDokumentTroskovi

### CreateDocumentCostDto → tblDokumentTroskovi

| DTO Property | DB Column | Tip | Obavezno | Status |
|--------------|-----------|-----|----------|--------|
| `partnerId` | `IDPartner` | int | ✅ | ✅ Tačno (ANALITIKA) |
| `documentTypeCode` | `IDVrstaDokumenta` | char(2) | ✅ | ✅ Tačno |
| `documentNumber` | `BrojDokumenta` | varchar(max) | ✅ | ✅ Tačno |
| `dueDate` | `DatumDPO` | datetime | ✅ | ✅ Tačno |
| `currencyDate` | `DatumValute` | datetime | ❌ | ✅ Tačno |
| `description` | `Opis` | varchar(max) | ❌ | ✅ Tačno |
| `statusId` | `IDStatus` | int | ✅ | ✅ Tačno |
| `currencyId` | `IDValuta` | int | ❌ | ✅ Tačno (NULL = RSD) |
| `exchangeRate` | `Kurs` | money | ❌ | ✅ Tačno (default 0) |

**Auto-generisano:**
- `IDDokumentTroskovi` ← IDENTITY(1,1) ✅
- `IDDokument` ← iz URL parametra `{documentId}` ✅
- `DokumentTroskoviTimeStamp` ← SQL Server TIMESTAMP (RowVersion za ETag) ✅

**Zaključak:** ✅ **SVA POLJA PRAVILNO MAPIRANA**

---

## 4. DocumentCostItem DTOs ↔ tblDokumentTroskoviStavka

### CreateDocumentCostItemDto → tblDokumentTroskoviStavka

| DTO Property | DB Column | Tip | Obavezno | Status |
|--------------|-----------|-----|----------|--------|
| `costTypeId` | `IDUlazniRacuniIzvedeni` | int | ✅ | ✅ Tačno |
| `distributionMethodId` | `IDNacinDeljenjaTroskova` | int | ✅ | ✅ Tačno (1/2/3) |
| `amount` | `Iznos` | money | ✅ | ✅ Tačno (default 0) |
| `applyToAllItems` | `SveStavke` | bit | ✅ | ✅ Tačno (default 1) |
| `statusId` | `IDStatus` | int | ✅ | ✅ Tačno |
| `calculateTaxOnCost` | `ObracunPorezTroskovi` | int (0/1) | ✅ | ✅ Tačno |
| `addVatToCost` | `DodajPDVNaTroskove` | int (0/1) | ✅ | ✅ Tačno |
| `currencyAmount` | `IznosValuta` | money | ❌ | ✅ Tačno (default 0) |
| `cashAmount` | `Gotovina` | money | ❌ | ✅ Tačno (default 0) |
| `cardAmount` | `Kartica` | money | ❌ | ✅ Tačno (default 0) |
| `wireTransferAmount` | `Virman` | money | ❌ | ✅ Tačno (default 0) |
| `quantity` | `Kolicina` | money | ❌ | ✅ Tačno (default 0) |
| `vatItems` | Lista → `tblDokumentTroskoviStavkaPDV` | array | ✅ | ✅ Tačno (child collection) |

**Auto-generisano:**
- `IDDokumentTroskoviStavka` ← IDENTITY(1,1) ✅
- `IDDokumentTroskovi` ← iz URL parametra `{costId}` ✅
- `DokumentTroskoviStavkaTimeStamp` ← SQL Server TIMESTAMP (RowVersion za ETag) ✅

**Zaključak:** ✅ **SVA POLJA PRAVILNO MAPIRANA**

---

### PatchDocumentCostItemDto → tblDokumentTroskoviStavka

**KRITIČNO:** Ovo je **parcijalno ažuriranje**. Sva polja su opciona (nullable). Ažuriraju se **samo prosleđena polja**.

| DTO Property | DB Column | Tip | Status |
|--------------|-----------|-----|--------|
| `costTypeId?` | `IDUlazniRacuniIzvedeni` | int | ✅ Tačno |
| `distributionMethodId?` | `IDNacinDeljenjaTroskova` | int | ✅ Tačno |
| `amount?` | `Iznos` | money | ✅ Tačno |
| `applyToAllItems?` | `SveStavke` | bit | ✅ Tačno |
| `statusId?` | `IDStatus` | int | ✅ Tačno |
| `calculateTaxOnCost?` | `ObracunPorezTroskovi` | int (0/1) | ✅ Tačno |
| `addVatToCost?` | `DodajPDVNaTroskove` | int (0/1) | ✅ Tačno |
| `currencyAmount?` | `IznosValuta` | money | ✅ Tačno |
| `cashAmount?` | `Gotovina` | money | ✅ Tačno |
| `cardAmount?` | `Kartica` | money | ✅ Tačno |
| `wireTransferAmount?` | `Virman` | money | ✅ Tačno |
| `quantity?` | `Kolicina` | money | ✅ Tačno |

**Backend automatski:**
- `DokumentTroskoviStavkaTimeStamp` - Novi RowVersion ✅
- Preračunava PDV ako se promeni iznos ✅

**Zaključak:** ✅ **PATCH OPCIONA POLJA PRAVILNO IMPLEMENTIRANA**

---

## 5. DocumentCostVAT ↔ tblDokumentTroskoviStavkaPDV

### CostItemVatDto → tblDokumentTroskoviStavkaPDV

| DTO Property | DB Column | Tip | Obavezno | Status |
|--------------|-----------|-----|----------|--------|
| `taxRateId` | `IDPoreskaStopa` | char(2) | ✅ | ✅ Tačno |
| `vatAmount` | `IznosPDV` | money | ✅ | ✅ Tačno (default 0) |

**Auto-generisano:**
- `IDDokumentTroskoviStavkaPDV` ← IDENTITY(1,1) ✅
- `IDDokumentTroskoviStavka` ← iz parent stavke ✅
- `DokumentTroskoviStavkaPDVTimeStamp` ← SQL Server TIMESTAMP (RowVersion) ✅

**UNIQUE constraint:** `(IDDokumentTroskoviStavka, IDPoreskaStopa)` ✅

**Napomena:** Samo jedna PDV stopa po stavci troška.

**Zaključak:** ✅ **SVA POLJA PRAVILNO MAPIRANA + CONSTRAINT ISPRAVNO**

---

## 6. Lookup/Combo Stored Procedures

### Verifikacija SP Mapiranja

| Stored Procedure | API Endpoint | Status |
|------------------|--------------|--------|
| `spPartnerComboStatusNabavka` | `GET /api/v1/lookups/partners` | ✅ Tačno |
| `spOrganizacionaJedinicaCombo` | `GET /api/v1/lookups/organizational-units?documentType=UR` | ✅ Tačno |
| `spNacinOporezivanjaComboNabavka` | `GET /api/v1/lookups/taxation-methods` | ✅ Tačno |
| `spReferentCombo` | `GET /api/v1/lookups/referents` | ✅ Tačno |
| `spDokumentNDCombo` | `GET /api/v1/lookups/reference-documents?type=ND` | ✅ Tačno |
| `spPoreskaStopaCombo` | `GET /api/v1/lookups/tax-rates` | ✅ Tačno |
| `spArtikalComboUlaz` | `GET /api/v1/lookups/articles` | ✅ Tačno |
| `spUlazniRacuniIzvedeniTroskoviCombo` | `GET /api/v1/lookups/cost-types` | ✅ Tačno |
| `spNacinDeljenjaTroskovaCombo` | `GET /api/v1/lookups/cost-distribution-methods` | ✅ Tačno |
| `spDokumentTroskoviLista` | `GET /api/v1/documents/{id}/costs` | ✅ Tačno |
| `spDokumentTroskoviArtikliCOMBO` | `GET /api/v1/documents/{id}/cost-articles` | ✅ Tačno |

**Zaključak:** ✅ **SVI STORED PROCEDURES PRAVILNO MAPIRANI**

---

## ✅ FINALNI ZAKLJUČAK

### KOMPLETNA VERIFIKACIJA: SVI ATRIBUTI SU PRAVILNO MAPIRANI!

**Provereno:**

1. ✅ **Document** (tblDokument)
   - CreateDocumentDto → sva polja mapirana
   - UpdateDocumentDto → sva polja mapirana
   - DocumentDto (response) → sva polja uključujući izračunate
   - Auto-generisana polja ispravno

2. ✅ **DocumentLineItem** (tblStavkaDokumenta)
   - CreateDocumentLineItemDto → sva polja mapirana
   - PatchDocumentLineItemDto → opciona polja ispravno
   - DocumentLineItemDto (response) → sva polja uključujući izračunate
   - Auto-calculate logika (IznosPDV, Iznos) ispravno

3. ✅ **DocumentCost** (tblDokumentTroskovi)
   - CreateDocumentCostDto → sva polja mapirana
   - UpdateDocumentCostDto → sva polja mapirana
   - DocumentCostDto (response) → sva polja uključujući izračunate
   - Child collection (Items) ispravno

4. ✅ **DocumentCostItem** (tblDokumentTroskoviStavka)
   - CreateDocumentCostItemDto → sva polja mapirana
   - PatchDocumentCostItemDto → opciona polja ispravno
   - DocumentCostItemDto (response) → sva polja uključujući izračunate
   - Child collection (VatItems) ispravno

5. ✅ **DocumentCostVAT** (tblDokumentTroskoviStavkaPDV)
   - CostItemVatDto → sva polja mapirana
   - UNIQUE constraint poštovan

6. ✅ **Lookup/Combo Stored Procedures**
   - Svi SP-ovi pravilno mapirani na API endpoints
   - Parametri i rezultati tačno mapirani

### NIKAKVIH NEDOSTAJUĆIH ILI POGREŠNIH MAPIRANJA!

**Datum verifikacije:** 27.11.2025  
**Verifikovao:** Backend Team  
**Status:** ✅ VERIFIKOVANO I POTVRĐENO
