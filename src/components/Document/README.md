# 📦 Document Components Folder

## Struktura Foldera

```
src/components/Document/
├── TabsComponent.tsx                 ✅ Tab navigacija (NOVO - prebačeno)
├── TabsComponent.module.css          ✅ CSS za tabse (NOVO - prebačeno)
├── StavkeDokumentaTable.tsx          ✅ Stavke tabela (NOVO - prebačeno)
├── StavkeDokumentaTable.module.css   ✅ CSS za stavke (NOVO - prebačeno)
├── TroskoviTable.tsx                 ✅ Troškovi tabela (NOVO - prebačeno)
├── TroskoviTable.module.css          ✅ CSS za troškove (NOVO - prebačeno)
├── EditableCell.tsx                  ✅ Editable cell komponenta
├── ConflictDialog.tsx                ✅ Conflict dialog
├── DocumentHeader.tsx                ❌ ZASTARELO (stara verzija)
├── DocumentForm.tsx                  ❌ ZASTARELO (stara verzija)
├── DocumentItemsTable.tsx            ❌ ZASTARELO (zamenjeno sa StavkeDokumentaTable)
├── DocumentCostsTable.tsx            ❌ ZASTARELO (zamenjeno sa TroskoviTable)
├── index.ts                          ✅ Exports
└── README.md                         ✅ Ova datoteka
```

## 🆕 Nove Komponente (prebačene iz root)

### 1. TabsComponent.tsx
- **Uloga**: Tab navigacija sa tri taba
- **Koristi se u**: DocumentCreatePage
- **Props**: `tabs: TabConfig[]`, `defaultTab?: string`

### 2. StavkeDokumentaTable.tsx
- **Uloga**: Tabela sa stavkama dokumenta
- **Koristi se u**: DocumentCreatePage (Tab 2: Stavke)
- **Karakteristike**: 
  - Inline edit
  - Add/Delete redova
  - Auto-kalkulacija iznosa
  - UKUPNO red

### 3. TroskoviTable.tsx
- **Uloga**: Tabela sa zavisnim troškovima
- **Koristi se u**: DocumentCreatePage (Tab 3: Zavisni Troškovi)
- **Karakteristike**:
  - Inline edit
  - 3 metode raspodele (Po količini, Po vrednosti, Ručna)
  - Expandable redovi
  - UKUPNO red

## ❌ Zastarele Komponente

### Trebalo bi da se obrišu ili prebace u TMP folder:

- `DocumentHeader.tsx` - Zamenjeno sa DocumentCreatePage sa pravilnom strukturom
- `DocumentForm.tsx` - Zamenjeno sa DocumentCreatePage
- `DocumentItemsTable.tsx` - Zamenjeno sa StavkeDokumentaTable.tsx
- `DocumentCostsTable.tsx` - Zamenjeno sa TroskoviTable.tsx

## 📋 Import Pattern

```typescript
// ✅ NOVO - Direktno iz Document foldera
import TabsComponent from '../components/Document/TabsComponent';
import StavkeDokumentaTable from '../components/Document/StavkeDokumentaTable';
import TroskoviTable from '../components/Document/TroskoviTable';

// ❌ STARO - Iz root components
import TabsComponent from '../components/TabsComponent';
import StavkeDokumentaTable from '../components/StavkeDokumentaTable';
```

## 🎯 Status

- [x] Prebačene sve nove komponente u Document folder
- [x] Prebačeni svi CSS fajlovi
- [x] Ažuriran DocumentCreatePage da koristi nove putanje
- [x] Ažuriran index.ts sa novim exportima
- [ ] Obrisati stare redundantne komponente (TODO)
- [ ] Obrisati CSS fajlove iz root komponenti (TODO)

## 🔗 Veze

- **GitHub Issue**: #52 - DocumentCreatePage Integration
- **Branch**: feature/search-page-gui-refactoring
