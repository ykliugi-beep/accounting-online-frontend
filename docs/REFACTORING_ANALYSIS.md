# 🔧 REFACTORING ANALYSIS - Code Redundancy & Cleanup Plan

**Date**: December 12, 2025  
**Status**: Analysis Complete - Ready for Implementation  
**Size Reduction Target**: 36KB → ~12KB (67% reduction)  

---

## 📊 REDUNDANCY AUDIT

### 1. **STAVKE SEKCIJA - DUPLICATE CODE** ❌❌❌ CRITICAL

**Problem**: Stavke (items) logic exists in TWO places:

#### Location A: DocumentCreatePage.tsx (Lines ~800-900)
```typescript
{activeTab === 'stavke' && (
  <div className={styles.tabContent + ' ' + styles.active}>
    <div className={styles.btnGroup}>
      <button 
        className={styles.btnSuccess} 
        onClick={() => {
          const newStavka = { idArtikal: 0, ... };
          setStavke([...stavke, newStavka]);
          setEditingArticleIndex(stavke.length);
        }}
      >
        ➕ Dodaj Stavku
      </button>
    </div>

    {stavke.length > 0 && (
      <div className={styles.formSection}>
        <table>
          <thead>...</thead>
          <tbody>
            {stavke.map((stavka, idx) => (
              <tr key={idx}>
                {/* ALL RENDERING LOGIC HERE */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
```
**Lines**: ~100 lines of inline code
**State**: Uses stavke, editingArticleIndex, artikliSearchTerm, showArtikliDropdown, etc.

#### Location B: StavkeDokumentaTable.tsx Component
```typescript
// This component ALSO renders stavke table
// But it's placed AFTER the inline version in the same tab!
export const StavkeDokumentaTable = ({ stavke, artikli, ... }) => {
  return (
    <div>
      <table>
        {/* SAME RENDERING LOGIC */}
      </table>
    </div>
  );
};
```

**Problem**: User sees TWO tables or confused about which one is active
**Solution**: DELETE inline version, KEEP ONLY component

---

### 2. **PARTNER & ARTICLE SEARCH - DUPLICATE LOGIC** ❌❌ HIGH PRIORITY

**Problem**: Two identical search patterns:

#### Pattern 1: Partner Search
```typescript
const [partners, setPartners] = useState<PartnerComboDto[]>([]);
const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
const [partnerSearchLoading, setPartnerSearchLoading] = useState(false);
const partnerDebounceTimer = useRef<NodeJS.Timeout | null>(null);

const handlePartnerSearchChange = useCallback((searchTerm: string) => {
  setPartnerSearchTerm(searchTerm);
  if (partnerDebounceTimer.current) clearTimeout(partnerDebounceTimer.current);
  if (searchTerm.trim().length === 0) {
    setPartners([]);
    setShowPartnerDropdown(false);
    return;
  }
  if (searchTerm.trim().length === 1) {
    setPartners([]);
    setShowPartnerDropdown(true);
    return;
  }
  setPartnerSearchLoading(true);
  setShowPartnerDropdown(true);
  partnerDebounceTimer.current = setTimeout(async () => {
    try {
      const searchResults = await api.lookup.searchPartners(searchTerm, 50);
      setPartners(searchResults);
    } catch (err) {
      console.error('❌ Partner search error:', err);
      setPartners([]);
    } finally {
      setPartnerSearchLoading(false);
    }
  }, 500);
}, []);
```
**Lines**: ~30 lines

#### Pattern 2: Article Search (IDENTICAL!)
```typescript
const [allArtikli, setAllArtikli] = useState<ArticleComboDto[]>([]);
const [artikli, setArtikli] = useState<ArticleComboDto[]>([]);
const [artikliSearchTerm, setArtikliSearchTerm] = useState('');
const [showArtikliDropdown, setShowArtikliDropdown] = useState(false);
const [artikliSearchLoading, setArtikliSearchLoading] = useState(false);
const artikliDebounceTimer = useRef<NodeJS.Timeout | null>(null);
const [editingArticleIndex, setEditingArticleIndex] = useState<number | null>(null);

const handleArtikliSearchChange = useCallback((searchTerm: string, rowIndex: number) => {
  setArtikliSearchTerm(searchTerm);
  setEditingArticleIndex(rowIndex);
  if (artikliDebounceTimer.current) clearTimeout(artikliDebounceTimer.current);
  if (searchTerm.trim().length === 0) {
    setArtikli([]);
    setShowArtikliDropdown(false);
    return;
  }
  if (searchTerm.trim().length === 1) {
    setArtikli([]);
    setShowArtikliDropdown(true);
    return;
  }
  setArtikliSearchLoading(true);
  setShowArtikliDropdown(true);
  artikliDebounceTimer.current = setTimeout(async () => {
    try {
      const searchResults = await api.lookup.searchArticles(searchTerm, 50);
      setArtikli(searchResults);
    } catch (err) {
      console.error('❌ Article search error:', err);
      setArtikli([]);
    } finally {
      setArtikliSearchLoading(false);
    }
  }, 500);
}, []);
```
**Lines**: ~30 lines

**Problem**: 60 lines of duplicated logic
**Solution**: Create generic `useDebounceSearch` hook

---

### 3. **AUTOCOMPLETE DROPDOWN RENDERING - DUPLICATE UI** ❌ MEDIUM PRIORITY

**Location 1**: Partner autocomplete dropdown rendering (~50 lines)
```typescript
{showPartnerDropdown && partners.length > 0 && (
  <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
    {/* Render partners */}
  </div>
)}
{showPartnerDropdown && partnerSearchTerm.trim().length >= 2 && !partnerSearchLoading && partners.length === 0 && (
  <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
    Nema rezultata...
  </div>
)}
{showPartnerDropdown && partnerSearchLoading && (
  <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
    Pretražujem...
  </div>
)}
{showPartnerDropdown && partnerSearchTerm.trim().length === 1 && (
  <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
    Unesite još 1 karakter...
  </div>
)}
```

**Location 2**: Article autocomplete dropdown rendering (~50 lines)
```typescript
{showArtikliDropdown && editingArticleIndex === idx && (
  <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
    {/* Render articles */}
  </div>
)}
// ... More conditions for different states
```

**Problem**: 100 lines of near-identical UI code
**Solution**: Extract into `<AutocompleteDropdown />` component

---

### 4. **TAB NAVIGATION - MIXED APPROACH** ⚠️ MEDIUM PRIORITY

**Problem**: Manual tab handling instead of using TabsComponent:

```typescript
// Manual state
const [activeTab, setActiveTab] = useState('zaglavlje');

// Manual buttons
<button
  className={`${activeTab === 'zaglavlje' ? styles.active : ''}`}
  onClick={() => setActiveTab('zaglavlje')}
>
  📋 Zaglavlje Dokumenta
</button>
// ... 2 more tabs

// Manual content rendering
{activeTab === 'zaglavlje' && (<div>...</div>)}
{activeTab === 'stavke' && (<div>...</div>)}
{activeTab === 'troskovi' && (<div>...</div>)}
```

**Problem**: Duplicates TabsComponent.tsx which is not being used
**Solution**: Use consistent pattern (or use TabsComponent)

---

## 🗺️ REFACTORING ROADMAP

### PHASE 1: Extract Custom Hooks (2 hours)

#### 1.1 Create `useDebounceSearch.ts`
```typescript
// src/hooks/useDebounceSearch.ts

export const useDebounceSearch = <T,>(
  searchFn: (term: string, limit: number) => Promise<T[]>,
  debounceMs: number = 500,
  minChars: number = 2
) => {
  const [results, setResults] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (term.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    if (term.trim().length < minChars) {
      setResults([]);
      setShowDropdown(true);
      return;
    }
    
    setIsLoading(true);
    setShowDropdown(true);
    
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchFn(term, 50);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [searchFn, debounceMs, minChars]);

  return { results, searchTerm, isLoading, showDropdown, search, setShowDropdown };
};
```

#### 1.2 Create `useAutocompleteSectionState.ts`
```typescript
// Custom hook for managing all form data + dropdown states
export const useAutocompleteSectionState = () => {
  const partner = useDebounceSearch(api.lookup.searchPartners);
  const articles = useDebounceSearch(api.lookup.searchArticles);
  
  return { partner, articles };
};
```

### PHASE 2: Extract Components (2 hours)

#### 2.1 Create `AutocompleteDropdown.tsx`
```typescript
// src/components/Common/AutocompleteDropdown.tsx

interface AutocompleteDropdownProps<T> {
  isOpen: boolean;
  isLoading: boolean;
  searchTerm: string;
  results: T[];
  minChars: number;
  emptyMessage: string;
  renderItem: (item: T) => React.ReactNode;
  onItemSelect: (item: T) => void;
}

export const AutocompleteDropdown = <T,>({
  isOpen,
  isLoading,
  searchTerm,
  results,
  minChars,
  emptyMessage,
  renderItem,
  onItemSelect,
}: AutocompleteDropdownProps<T>) => {
  if (!isOpen) return null;

  return (
    <div className={styles.autocompleteDropdown}>
      {isLoading && (
        <div className={styles.autocompleteItem}>⏳ Pretražujem...</div>
      )}
      {!isLoading && searchTerm.trim().length < minChars && (
        <div className={styles.autocompleteItem}>
          Unesite još {minChars - searchTerm.trim().length} karaktera...
        </div>
      )}
      {!isLoading && results.length > 0 && (
        results.map((item, idx) => (
          <div
            key={idx}
            className={styles.autocompleteItem}
            onClick={() => onItemSelect(item)}
          >
            {renderItem(item)}
          </div>
        ))
      )}
      {!isLoading && searchTerm.trim().length >= minChars && results.length === 0 && (
        <div className={styles.autocompleteItem} style={{ color: '#999' }}>
          {emptyMessage}
        </div>
      )}
    </div>
  );
};
```

#### 2.2 Create `DocumentStavkeSection.tsx`
```typescript
// src/components/Document/DocumentStavkeSection.tsx

interface DocumentStavkeSectionProps {
  stavke: Stavka[];
  onAddRow: () => void;
  onDeleteRow: (idx: number) => void;
  onUpdateRow: (idx: number, stavka: Stavka) => void;
  artikli: ArticleComboDto[];
  allArtikli: ArticleComboDto[];
}

export const DocumentStavkeSection: React.FC<DocumentStavkeSectionProps> = ({
  stavke,
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  artikli,
  allArtikli,
}) => {
  // All stavke logic moved here
  return (
    <div>
      {/* Render stavke table */}
    </div>
  );
};
```

### PHASE 3: Simplify DocumentCreatePage (2 hours)

#### 3.1 New DocumentCreatePage Structure
```typescript
export const DocumentCreatePage: React.FC<DocumentCreatePageProps> = ({ docType }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('zaglavlje');
  const [error, setError] = useState<string | string[] | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Simplified state - only what's needed at page level
  const { data: combosData } = useAllCombos(docType || 'UR');
  const { partner, articles } = useAutocompleteSectionState();
  
  const {
    formData, 
    stavke, 
    troskovi, 
    avansPDV,
    handlers // All handlers bundled
  } = useDocumentForm(docType || 'UR');
  
  const createMutation = useMutation({...});
  
  return (
    <div className={styles.container}>
      {/* Simplified UI - only structure */}
      <div className={styles.header}>...</div>
      
      <div className={styles.navTabs}>...</div>
      
      {activeTab === 'zaglavlje' && (
        <DocumentHeaderSection 
          formData={formData}
          combosData={combosData}
          partner={partner}
          onFormChange={handlers.updateFormData}
          onPartnerSelect={handlers.selectPartner}
        />
      )}
      
      {activeTab === 'stavke' && (
        <DocumentStavkeSection
          stavke={stavke}
          artikli={articles.results}
          allArtikli={allArtikli}
          onAddRow={() => handlers.addStavka()}
          onDeleteRow={(idx) => handlers.deleteStavka(idx)}
          onUpdateRow={(idx, s) => handlers.updateStavka(idx, s)}
        />
      )}
      
      {activeTab === 'troskovi' && (
        <DocumentCostsSection
          troskovi={troskovi}
          stavke={stavke}
          onAddRow={() => handlers.addTrosak()}
          onDeleteRow={(idx) => handlers.deleteTrosak(idx)}
          onUpdateRow={(idx, t) => handlers.updateTrosak(idx, t)}
          costTypes={combosData?.costTypes || []}
        />
      )}
    </div>
  );
};
```

---

## 📈 SIZE COMPARISON

### BEFORE (Current State)
```
DocumentCreatePage.tsx:        36 KB (900+ lines)
StavkeDokumentaTable.tsx:      8 KB  (200 lines) - UNUSED/DUPLICATED
TroskoviTable.tsx:            12 KB  (300 lines) - USED
TABLES & COMPONENTS:          60 KB total

Redundant/Duplicate Code:      ~20 KB
State Management Chaos:         8 KB
Duplicate Search Logic:         6 KB
```

### AFTER (Refactored)
```
DocumentCreatePage.tsx:        12 KB  (250 lines) - CLEAN
DocumentHeaderSection.tsx:      6 KB  (150 lines) - NEW
DocumentStavkeSection.tsx:      8 KB  (200 lines) - MOVED
DocumentCostsSection.tsx:       6 KB  (150 lines) - MOVED

Hooks/useDebounceSearch.ts:     3 KB  (80 lines) - NEW
Hooks/useDocumentForm.ts:       4 KB  (100 lines) - NEW
Hooks/useAutocompleteSectionState.ts: 2 KB (50 lines) - NEW

Components/AutocompleteDropdown.tsx: 3 KB (80 lines) - NEW
COMPONENTS TOTAL:              44 KB (67% reduction!)

Eliminated:                    ~16 KB of duplicate code
```

---

## ✂️ CONCRETE DELETION TARGETS

### DELETE FROM DocumentCreatePage.tsx:

1. **Lines ~800-900**: Entire inline stavke table rendering
   ```typescript
   {activeTab === 'stavke' && (
     <div className={styles.tabContent + ' ' + styles.active}>
       <div className={styles.btnGroup}>
         <button ...>➕ Dodaj Stavku</button>
       </div>
       {stavke.length > 0 && (
         <div className={styles.formSection}>
           <table>
             {/* DELETE THIS ENTIRE BLOCK */}
           </table>
         </div>
       )}
     </div>
   )}
   ```
   **Lines to delete**: 100
   **Reason**: Duplicate of StavkeDokumentaTable component

2. **Lines ~950**: Call to `<StavkeDokumentaTable />` (since we're replacing with DocumentStavkeSection)
   **Lines to delete**: 10

3. **Lines ~200-250**: Partner search state and handlers
   ```typescript
   const [partners, setPartners] = useState<...>();
   const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
   const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
   const [partnerSearchLoading, setPartnerSearchLoading] = useState(false);
   const partnerDebounceTimer = useRef<...>();
   const handlePartnerSearchChange = useCallback(...) // 30 lines
   ```
   **Lines to delete**: 40
   **Reason**: Move to useDebounceSearch hook

4. **Lines ~250-300**: Article search state and handlers (SAME AS ABOVE)
   ```typescript
   const [allArtikli, setAllArtikli] = useState<...>();
   const [artikli, setArtikli] = useState<...>();
   const [artikliSearchTerm, setArtikliSearchTerm] = useState('');
   const [showArtikliDropdown, setShowArtikliDropdown] = useState(false);
   const [artikliSearchLoading, setArtikliSearchLoading] = useState(false);
   const artikliDebounceTimer = useRef<...>();
   const [editingArticleIndex, setEditingArticleIndex] = useState<...>();
   const handleArtikliSearchChange = useCallback(...) // 30 lines
   ```
   **Lines to delete**: 50
   **Reason**: Move to useDebounceSearch hook

5. **Lines ~600-700**: Partner dropdown rendering (all conditions)
   ```typescript
   {showPartnerDropdown && partners.length > 0 && (...)} 
   {showPartnerDropdown && partnerSearchTerm.trim().length >= 2 && !partnerSearchLoading && (...)} 
   // ... 4 more conditions
   ```
   **Lines to delete**: 60
   **Reason**: Move to AutocompleteDropdown component

6. **Lines ~800**: Article dropdown rendering (all conditions inside table)
   ```typescript
   {showArtikliDropdown && editingArticleIndex === idx && (...)} 
   // ... more conditions
   ```
   **Lines to delete**: 40
   **Reason**: Move to AutocompleteDropdown component

---

## 🎯 IMPLEMENTATION ORDER

1. **STEP 1**: Create `useDebounceSearch.ts` hook (15 min)
2. **STEP 2**: Create `AutocompleteDropdown.tsx` component (20 min)
3. **STEP 3**: Create `DocumentHeaderSection.tsx` component (30 min)
4. **STEP 4**: Create `DocumentStavkeSection.tsx` component (30 min)
5. **STEP 5**: Create `useDocumentForm.ts` hook (20 min)
6. **STEP 6**: Refactor `DocumentCreatePage.tsx` to use new components (30 min)
7. **STEP 7**: Test and fix any issues (30 min)
8. **STEP 8**: Delete old code and unused components (10 min)
9. **STEP 9**: Git commit with message: "Refactor: Clean up DocumentCreatePage redundancy - 67% size reduction"

---

## 🚀 EXPECTED BENEFITS

✅ **Readability**: Page component reduced from 900 → 250 lines  
✅ **Maintainability**: Each concern in its own component/hook  
✅ **Reusability**: AutocompleteDropdown and hooks can be used elsewhere  
✅ **Performance**: Fewer renders, better memoization possible  
✅ **Testing**: Easier to unit test individual components  
✅ **Type Safety**: Clearer prop types and interfaces  
✅ **Code Size**: 67% reduction in file size  

---

## ⚠️ MIGRATION CHECKLIST

- [ ] All new hooks created and working
- [ ] All new components created and working
- [ ] DocumentCreatePage refactored to use new components
- [ ] All functionality preserved (no breaking changes)
- [ ] All form submissions work correctly
- [ ] All search functionalities work
- [ ] All validations work
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Tests pass (if any exist)
- [ ] Code review done
- [ ] Merged to main branch

---

**Status**: Ready for Phase 1 implementation ✅
