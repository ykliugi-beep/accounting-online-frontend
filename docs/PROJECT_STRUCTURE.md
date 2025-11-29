# 📊 Project Structure Documentation

**Updated:** 29.11.2025  
**Status:** ✅ Refactored & Organized

---

## 📁 Complete Directory Tree

```
accounting-online-frontend/
├── .env.example                 # Environment template
├── .env.local                   # Local environment (gitignored)
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite build config
├── vitest.config.ts             # Vitest test config
├── README.md                    # Main README
├── docs/                        # 📚 Documentation
│   ├── IMPLEMENTATION_STATUS.md   # Implementation checklist
│   ├── PRODUCTION_READINESS.md    # Production assessment
│   ├── TESTING.md                  # Testing guide
│   ├── COMPLETE_WITH_TESTS.md      # Final achievements
│   ├── PROJECT_STRUCTURE.md        # This file
│   └── ...                          # Other docs
└── src/                         # 💻 Source code
    ├── main.tsx                  # App entry point
    ├── App.tsx                   # Root component + routing
    ├── api/                      # 🌐 API Layer
    │   ├── index.ts              # API client exports
    │   ├── client.ts             # Axios instance
    │   └── endpoints.ts          # All API endpoints
    ├── types/                    # 📝 TypeScript Types
    │   ├── index.ts              # Type exports
    │   ├── api.types.ts          # API DTOs
    │   └── store.types.ts        # Store types
    ├── store/                    # 📦 State Management (Zustand)
    │   ├── index.ts              # Store exports
    │   ├── documentStore.ts      # Document state
    │   └── uiStore.ts            # UI state
    ├── hooks/                    # 🪢 Custom Hooks
    │   ├── useCombos.ts          # Combo fetching
    │   └── useAutoSaveItems.ts   # Autosave logic
    ├── utils/                    # 🔧 Helper Functions
    │   ├── format.ts             # Formatters
    │   ├── validation.ts         # Validators
    │   ├── calculation.ts        # Calculations
    │   ├── etag.ts               # ETag handling
    │   ├── constants.ts          # App constants
    │   └── __tests__/            # 🧪 Unit tests
    │       ├── format.test.ts
    │       ├── validation.test.ts
    │       ├── calculation.test.ts
    │       └── etag.test.ts
    ├── components/               # 🪡 React Components
    │   ├── Layout/               # Layout module
    │   │   ├── Layout.tsx        # Main layout
    │   │   ├── AppMenu.tsx       # Navigation menu
    │   │   └── index.ts          # Exports
    │   ├── Document/             # ✅ Document module (REFACTORED)
    │   │   ├── DocumentHeader.tsx      # Header form
    │   │   ├── DocumentForm.tsx        # Main form wrapper
    │   │   ├── DocumentItemsTable.tsx  # Items grid
    │   │   ├── DocumentCostsTable.tsx  # Costs table
    │   │   ├── EditableCell.tsx        # Cell component
    │   │   ├── ConflictDialog.tsx      # Conflict UI
    │   │   └── index.ts                # Exports
    │   └── __tests__/            # Component tests (TBD)
    ├── pages/                    # 📝 Page Components
    │   ├── DashboardPage.tsx     # Dashboard
    │   ├── DocumentListPage.tsx  # Document list
    │   ├── DocumentCreatePage.tsx# Create document
    │   └── DocumentDetailPage.tsx# Document detail
    └── test/                     # Test setup
        └── setup.ts              # Vitest setup
```

---

## 📌 Key Directories Explained

### 1. `/src/api` - API Layer

**Purpose:** Centralized API communication

**Files:**
- `client.ts` - Axios instance sa JWT interceptor
- `endpoints.ts` - Svi API endpointi grupisani po resource-u
- `index.ts` - Exports za `api.document.list()` pattern

**Usage:**
```typescript
import { api } from '@/api';

const documents = await api.document.list({ pageNumber: 1 });
const item = await api.lineItem.patch(docId, itemId, changes, etag);
```

---

### 2. `/src/types` - TypeScript Types

**Purpose:** Type safety across app

**Files:**
- `api.types.ts` - Backend DTOs (DocumentDto, LineItemDto, etc.)
- `store.types.ts` - Store interfaces
- `index.ts` - Re-exports

**Usage:**
```typescript
import type { DocumentDto, DocumentLineItemDto } from '@/types';
```

---

### 3. `/src/store` - State Management

**Purpose:** Zustand global state

**Stores:**
- `documentStore` - Document & items state
- `uiStore` - UI state (theme, modals, snackbars)

**Usage:**
```typescript
import { useDocumentStore, useUIStore } from '@/store';

const { items, setItems } = useDocumentStore();
const { showSnackbar } = useUIStore();
```

---

### 4. `/src/hooks` - Custom Hooks

**Purpose:** Reusable business logic

**Hooks:**
- `useCombos()` - Fetch all combos (partners, articles, etc.)
- `useAutoSaveItems()` - Autosave with debounce + ETag

**Usage:**
```typescript
import { useCombos } from '@/hooks/useCombos';

const { partners, articles, isLoading } = useCombos();
```

---

### 5. `/src/utils` - Helper Functions

**Purpose:** Pure utility functions

**Modules:**
- `format.ts` - formatCurrency, formatDate, formatNumber
- `validation.ts` - validateDocumentNumber, validatePIB, etc.
- `calculation.ts` - calculateVAT, calculateGrossAmount, etc.
- `etag.ts` - extractETag, formatETagForHeader
- `constants.ts` - DOCUMENT_TYPES, AUTOSAVE_DEBOUNCE_MS

**Test Coverage:** ✅ 100% (61 unit tests)

**Usage:**
```typescript
import { formatCurrency, calculateVAT } from '@/utils';

const formatted = formatCurrency(1234.56, 'RSD');
const vat = calculateVAT(100, 20); // 20
```

---

### 6. `/src/components` - React Components

**Purpose:** Reusable UI components

**Modules:**

#### ✅ **Layout/** - Navigation & Shell
- `Layout.tsx` - AppBar + Drawer + Content
- `AppMenu.tsx` - Full navigation menu

#### ✅ **Document/** - Document Module (REFACTORED)

**⚠️ IMPORTANT:** All Document components are now in this folder!

| Component | Purpose | Lines |
|-----------|---------|-------|
| `DocumentHeader.tsx` | Zaglavlje dokumenta (14 polja + Avans PDV) | 400 |
| `DocumentForm.tsx` | Wrapper sa 3 taba | 130 |
| `DocumentItemsTable.tsx` | Excel-like grid sa autosave | 700 |
| `DocumentCostsTable.tsx` | Troškovi sa raspodelom | 650 |
| `EditableCell.tsx` | Ćelija sa autosave | 200 |
| `ConflictDialog.tsx` | 409 Conflict UI | 150 |
| `index.ts` | Module exports | - |

**Imports:**
```typescript
// ✅ CORRECT - From Document module
import { DocumentHeader, DocumentItemsTable, EditableCell } from '@/components/Document';

// ❌ WRONG - Old path
import { EditableCell } from '@/components/EditableCell';
```

---

### 7. `/src/pages` - Page Components

**Purpose:** Route-level components

**Pages:**
- `DashboardPage.tsx` - `/` route
- `DocumentListPage.tsx` - `/documents` route
- `DocumentCreatePage.tsx` - `/documents/new` route
- `DocumentDetailPage.tsx` - `/documents/:id` route

---

## 🔄 Import Paths

### TypeScript Path Alias:

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Correct Import Patterns:

```typescript
// API
import { api } from '@/api';

// Types
import type { DocumentDto } from '@/types';

// Store
import { useDocumentStore } from '@/store';

// Hooks
import { useCombos } from '@/hooks/useCombos';

// Utils
import { formatCurrency } from '@/utils/format';
import { validatePIB } from '@/utils/validation';

// Components - Layout
import { Layout } from '@/components/Layout';

// Components - Document (REFACTORED)
import { 
  DocumentHeader, 
  DocumentForm,
  DocumentItemsTable,
  DocumentCostsTable,
  EditableCell,
  ConflictDialog 
} from '@/components/Document';

// Pages
import { DashboardPage } from '@/pages/DashboardPage';
```

---

## ✅ Refactoring Checklist

### Completed:
- [x] Moved `DocumentItemsTable.tsx` to `Document/`
- [x] Moved `EditableCell.tsx` to `Document/`
- [x] Moved `ConflictDialog.tsx` to `Document/`
- [x] Fixed imports in moved components (../ to ../../)
- [x] Created `Document/index.ts` with exports
- [x] Updated documentation

### Next Steps:
- [ ] Delete old files:
  - `src/components/DocumentItemsTable.tsx` (old)
  - `src/components/EditableCell.tsx` (old)
  - `src/components/ConflictDialog.tsx` (old)
- [ ] Update all import references in consuming components
- [ ] Verify no broken imports
- [ ] Test application

---

## 📊 File Organization Principles

### Module Co-location:

**✅ Good:**
```
Document/
├── DocumentHeader.tsx
├── DocumentItemsTable.tsx
├── EditableCell.tsx        # Used only by DocumentItemsTable
├── ConflictDialog.tsx      # Used only by DocumentItemsTable
└── index.ts
```

**❌ Bad:**
```
components/
├── EditableCell.tsx        # Generic name, unclear purpose
├── ConflictDialog.tsx      # Not grouped with related components
└── Document/
    └── DocumentItemsTable.tsx # Separated from its dependencies
```

### Naming Conventions:

| Type | Convention | Example |
|------|------------|----------|
| **Components** | PascalCase.tsx | `DocumentHeader.tsx` |
| **Hooks** | camelCase.ts | `useCombos.ts` |
| **Utils** | camelCase.ts | `format.ts` |
| **Types** | camelCase.types.ts | `api.types.ts` |
| **Tests** | name.test.ts | `format.test.ts` |
| **Store** | camelCase Store.ts | `documentStore.ts` |

---

## 📖 Recommended Reading Order

For new developers joining the project:

1. **README.md** - Quick start
2. **docs/IMPLEMENTATION_STATUS.md** - What's implemented
3. **docs/PROJECT_STRUCTURE.md** - This file
4. **docs/TESTING.md** - How to test
5. **src/types/api.types.ts** - Backend contracts
6. **src/api/endpoints.ts** - API usage
7. **src/components/Document/** - Main features

---

**✅ Status:** Structure Refactored & Documented  
**📅 Updated:** 29.11.2025  
**👨‍💻 Maintainer:** Development Team
