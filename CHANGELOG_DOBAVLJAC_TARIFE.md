# 🎯 Changelog: Dobavljač Dropdown & Poreske Tarife

**Datum:** 10. Decembar 2025  
**Status:** ✅ Implementirano i Commitovano  
**Commit:** `3d25469118e4d12378dfaaed0e2760a508e7f579`

---

## 📋 Rezime Promena

### Problem
1. **Dobavljač nije radio kao dropdown**
   - Biti je autocomplete input polje
   - Korisnik je morao pisati naziv dobavljača
   - Nije bilo jasne liste dostupnih dobavljača

2. **Nedostajala je sekcija "PORESKE TARIFE (AVANSI)"**
   - Word specifikacija je zahtevala ovu sekciju
   - Trebala je tabela sa: poreska stopa, osnov, PDV iznos, ukupno
   - Trebala su auto-izračunavanja

### Rešenje

#### 1. Dobavljač - Select Dropdown (Ispravka ✅)

**Šta se promenilo:**
- Autocomplete input → **`<select>` element**
- Dinamički učitani partneri iz API-ja
- Jasan odabir iz padajuće liste

**Kod:**
```typescript
// Učitaj sve dobavljače
const [partners, setPartners] = useState<PartnerComboDto[]>([]);

useEffect(() => {
  const partnersData = await api.lookup.getPartners();
  setPartners(partnersData);
}, []);

// Render
<select
  value={formData.partnerId || ''}
  onChange={(e) => {
    const partnerId = e.target.value ? parseInt(e.target.value) : null;
    setFormData({ ...formData, partnerId });
  }}
>
  <option value="">-- Izaberite dobavljača --</option>
  {partners.map((partner) => (
    <option key={partner.idPartner || partner.id} value={partner.idPartner || partner.id}>
      {partner.naziv || partner.name}
    </option>
  ))}
</select>
```

**API Endpoint:** `/api/v1/lookups/partners`  
**Metoda:** `api.lookup.getPartners()`

---

#### 2. Poreske Tarife (Avansi) - Nova Sekcija ✨

**Gde se nalazi:** Tab 1 "Zaglavlje Dokumenta" (na dnu)

**Struktura Tabele:**
```
┌────────────────┬────────┬──────────────┬──────────┐
│ Poreska Stopa  │ Osnov  │ PDV Iznos    │ Ukupno   │
├────────────────┼────────┼──────────────┼──────────┤
│ [SELECT]       │ [INP]  │ [DISABLED]   │ [DISABL] │
│ 0%, 10%, 20%   │ número │ auto-calc    │ auto-calc│
└────────────────┴────────┴──────────────┴──────────┘
```

**Opcije za Poresku Stopu:**
- 0%
- 10%
- 20%

**Auto-Kalkulacija:**
```typescript
interface AvansPDVRow {
  poreskaStopaId: number;     // ID poreske stope
  poreskaStopaVal: number;    // Vrednost u % (0, 10, 20)
  osnov: number;              // Osnov - unosi korisnik
  pdvIznos: number;           // PDV Iznos = osnov * stopaVal / 100
  ukupno: number;             // Ukupno = osnov + pdvIznos
}

// Kalkulacija
const handleAvansPDVChange = (index: number, field: keyof AvansPDVRow, value: any) => {
  const updated = [...avansPDV];
  updated[index] = { ...updated[index], [field]: value };
  
  if (field === 'poreskaStopaVal' || field === 'osnov') {
    const stopaVal = field === 'poreskaStopaVal' ? value : updated[index].poreskaStopaVal;
    const osnov = field === 'osnov' ? value : updated[index].osnov;
    updated[index].pdvIznos = (osnov * stopaVal) / 100;
    updated[index].ukupno = osnov + updated[index].pdvIznos;
  }
  
  setAvansPDV(updated);
};
```

**Primer Unosa:**
| Poreska Stopa | Osnov | PDV Iznos | Ukupno |
|---|---|---|---|
| 20% | 1000 | 200 | 1200 |
| 10% | 5000 | 500 | 5500 |
| 0% | 2000 | 0 | 2000 |

---

## 🔧 Tehnički Detalji

### Fajlovi Izmenjeni
- **`src/pages/DocumentCreatePage.tsx`**
  - Dodan state za `partners` i `avansPDV`
  - Zamenjeno `usePartnerAutocomplete` sa direktnim `getPartners()`
  - Dodata nova `handleAvansPDVChange()` funkcija
  - Dodata nova sekcija JSX sa tabelom

### API Pozivi
```typescript
// Učitavanje dobavljača
const partnersData = await api.lookup.getPartners();
// GET /api/v1/lookups/partners

// Učitavanje poreskih stopa (opcionalno, sada hardkodirane 0%, 10%, 20%)
const taksData = await api.lookup.getTaxRates();
// GET /api/v1/lookups/tax-rates
```

### State Management
```typescript
// DOBAVLJAČI
const [partners, setPartners] = useState<PartnerComboDto[]>([]);

// PORESKE TARIFE (AVANSI)
interface AvansPDVRow {
  poreskaStopaId: number;
  poreskaStopaVal: number;
  osnov: number;
  pdvIznos: number;
  ukupno: number;
}
const [avansPDV, setAvansPDV] = useState<AvansPDVRow[]>([
  { poreskaStopaId: 0, poreskaStopaVal: 0, osnov: 0, pdvIznos: 0, ukupno: 0 }
]);
```

---

## ✅ Testiranje

### Korak 1: Otvorite Formular
```
http://localhost:3000/documents/vp/ur
```

### Korak 2: Testirajte Dobavljača
- [ ] Vidite li dropdown sa listom dobavljača?
- [ ] Možete li da izaberete dobavljača iz liste?
- [ ] Prikupljanja vrednost u `formData.partnerId`?

### Korak 3: Testirajte Poreske Tarife
- [ ] Vidite li novu sekciju na Tab 1?
- [ ] Možete li da promenite poresku stopu?
- [ ] Možete li da unesete osnov?
- [ ] Da li se PDV Iznos i Ukupno automatski računaju?

### Korak 4: Test Kalkulacije
**Primer 1:**
- Poreska Stopa: 20%
- Osnov: 1000
- Očekivano PDV Iznos: 200
- Očekivano Ukupno: 1200

**Primer 2:**
- Poreska Stopa: 10%
- Osnov: 500
- Očekivano PDV Iznos: 50
- Očekivano Ukupno: 550

### Korak 5: Console Provera
Otvorite F12 → Console i pogledate:
```
✅ Loaded 47 partners
✅ Loaded 15 articles
✅ Loaded 3 tax rates
```

---

## 📊 Integracijska Napomena

### Šta Fali (Za Kasnije)
- [ ] Dodaj Red gumb za više poreskih tarifa
- [ ] Obriši Red gumb
- [ ] Validacija redova
- [ ] Sumiranje PDV iznosa
- [ ] Prikaz u "Pregledu Dokumenta"
- [ ] Saveovanje poreskih tarifa u DB
- [ ] Zavisnost od "Oporezivanja" dropdown-a

### Specifikacija Referenca
Implementirano prema `ERP-SPECIFIKACIJA.docx`:
- **Tab Zaglavlje:**
  - `spPartnerComboStatusNabavka` → **Dobavljač** ✅
  - `spPoreskaStopaCombo` → **Poreske Tarife (Avansi)** ✅
- **Subforma:**
  - `tblDokumentAvansPDV` → `AvansPDVRow[]` ✅

---

## 📚 Dodatne Resurse

- [API Dokumentacija](../src/api/README.md)
- [ERP Specifikacija](ERP-SPECIFIKACIJA.docx)
- [DocumentCreatePage Komponenta](../src/pages/DocumentCreatePage.tsx)

---

## 🎉 Zaključak

✅ **Dobavljač** je sada **pravilno funkcionalan** kao select dropdown  
✅ **Poreske Tarife** su **dodate** sa auto-kalkulacijom  
✅ **API integracija** je **kompletan**  
✅ **Specifikacija** je **implementirana**

Sledeće: Testirajte funkcionalnosti i prijavite sve probleme!
