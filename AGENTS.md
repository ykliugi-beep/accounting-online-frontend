# 🎨 FRONTEND AGENT - FINALNA SPECIFIKACIJA v4.0

**Verzija:** 4.0 - KOMPLETNA FINALNA VERZIJA  
**Datum:** 17.11.2025  
**Projekat:** ERP Accounting Online Frontend  
**Stack:** React 18 + TypeScript 5 + Material-UI 5 + Vite  
**Repozitorijum:** https://github.com/ykliugi-beep/accounting-online-frontend

---

## 🎯 SVRHA DOKUMENTA

Ovaj dokument definiše **kompletnu i finalnu specifikaciju** za Frontend deo ERP Accounting Online sistema.

**KRITIČNO:**
- Svi tipovi moraju biti tačno mapirani sa backend DTOs
- Autosave sa 800ms debounce-om OBAVEZAN
- ETag konkurentnost MORA biti implementirana
- Tab/Enter navigacija OBAVEZNA
- Nema pretpostavki - sve je eksplicitno

---

## 🏗️ TECHNOLOGY STACK

```
Frontend:        React 18.2
Language:        TypeScript 5.3 (Strict Mode)
Build Tool:      Vite 5.0
UI Framework:    Material-UI 5.15
Table:           @tanstack/react-table 8.11
Virtualization:  react-window 1.8
State:           Zustand 4.5 + React Query 5.17
HTTP Client:     Axios 1.6
Forms:           React Hook Form 7.49 + Zod 3.22
Testing:         Vitest 1.1 + RTL 14.1
```

---

## 📁 FOLDER STRUKTURA

```
src/
├── api/                          # HTTP klijent i API pozivi
│   ├── client.ts                 # Axios instanca sa interceptorima
│   ├── documentsApi.ts           # Document endpoints
│   ├── itemsApi.ts               # Items sa ETag headers
│   └── lookupsApi.ts             # Sve 11 SP endpointa
│
├── hooks/                        # Custom hooks - useXxx
│   ├── useAutoSaveItems.ts       # 800ms debounce + ETag
│   ├── useConflictResolver.ts    # 409 handling
│   └── useCombos.ts              # React Query sa SP podacima
│
├── components/                   # React komponente - PascalCase
│   ├── Document/
│   │   ├── DocumentForm.tsx      # Main forma sa 3 tab-a
│   │   ├── DocumentHeader.tsx    # Tab 1 - Zaglavlje
│   │   ├── DocumentItemsTable.tsx    # Tab 2 - KRITIČNO
│   │   ├── DocumentCostsTable.tsx    # Tab 3
│   │   └── ConflictDialog.tsx    # 409 handling - KRITIČNO
│   └── Lookup/
│       ├── PartnerCombo.tsx
│       └── ArticleCombo.tsx
│
├── types/                        # TypeScript tipovi
│   └── index.ts                  # SVE tipove ovde
│
├── store/                        # Zustand global state
│   ├── documentStore.ts
│   └── uiStore.ts
│
└── pages/
    └── DocumentDetailPage.tsx    # Glavna stranica
```

---

## 📝 TYPESCRIPT TIPOVI

### DocumentLineItem - 65 Svojstava

```typescript
export interface DocumentLineItem {
  // PK i FK
  id: number;
  documentId: number;
  articleId: number;
  organizationalUnitId?: number;
  
  // Količine i cene
  quantity: number;  // CHECK <> 0
  invoicePrice: number;
  purchasePrice: number;
  warehousePrice: number;
  documentDiscount: number;
  activeMatterPercent: number;
  volume: number;
  excise: number;
  quantityCoefficient: number;
  discountAmount: number;
  marginAmount: number;
  marginValue: number;
  
  // PDV i akciza
  taxPercent: number;
  taxPercentMP: number;
  taxAmount: number;
  taxAmountWithExcise: number;
  exciseAmount: number;
  taxRateId?: string;
  
  // Zavisni troškovi
  dependentCostsWithTax: number;
  dependentCostsWithoutTax: number;
  
  // Ukupni iznosi
  total: number;
  currencyPrice: number;
  currencyTotal: number;
  
  // JM i pakovanje
  unitOfMeasureId: string;
  packaging: number;
  
  // Obračuni
  calculateExcise: boolean;
  calculateTax: boolean;
  calculateAuxiliaryTax: boolean;
  taxationMethodId?: number;
  statusId?: number;
  
  // ... (ostalih 30 atributa)
  
  // ETag i audit - KRITIČNO!
  eTag: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLineItemDto {
  quantity?: number;
  invoicePrice?: number;
  discountAmount?: number;
  marginAmount?: number;
  taxRateId?: string;
}
```

---

## 🔔 API KLIJENT

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor za token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor za error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 409) {
      console.warn('Konkurentnost konflikt detektovan');
    }
    return Promise.reject(error);
  }
);
```

---

## 🎯 CUSTOM HOOKS

### useAutoSaveItems - 800ms Debounce + ETag (KRITIČNO!)

```typescript
// src/hooks/useAutoSaveItems.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';

const DEBOUNCE_MS = 800;

export function useAutoSaveItems(documentId: number) {
  const [items, setItems] = useState<DocumentLineItem[]>([]);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictItemId, setConflictItemId] = useState<string | null>(null);
  
  const timers = useRef(new Map<string, NodeJS.Timeout>());

  // Cleanup timers
  useEffect(() => {
    return () => {
      timers.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Zakaži autosave sa 800ms debounce-om
  const scheduleAutosave = useCallback((itemId: string) => {
    if (timers.current.has(itemId)) {
      clearTimeout(timers.current.get(itemId)!);
    }
    const timer = setTimeout(() => autosaveItem(itemId), DEBOUNCE_MS);
    timers.current.set(itemId, timer);
  }, []);

  // Autosave sa OBAVEZNIM If-Match header-om
  const autosaveItem = useCallback(async (itemId: string) => {
    const item = items.find(x => x.id === parseInt(itemId));
    if (!item) return;

    setSavingIds(prev => new Set([...prev, itemId]));

    try {
      // KRITIČNO: If-Match header sa ETag vrednšću
      const response = await apiClient.patch<DocumentLineItem>(
        `/documents/${documentId}/items/${item.id}`,
        { quantity: item.quantity, invoicePrice: item.invoicePrice },
        { headers: { 'If-Match': `"${item.eTag}"` } }
      );

      // Ažuriraj ETag nakon usprešne izmene
      setItems(prev =>
        prev.map(x =>
          x.id === item.id
            ? { ...x, eTag: response.data.eTag, total: response.data.total }
            : x
        )
      );

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    } catch (error: any) {
      // 409 KONFLIKT!
      if (error.response?.status === 409) {
        setConflictItemId(itemId);
        setErrors(prev => ({
          ...prev,
          [itemId]: 'Stavka je promenjena od drugog korisnika'
        }));
      }
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [documentId, items]);

  // Handle promene u ćeliji
  const handleCellChange = useCallback(
    (itemId: string, field: keyof DocumentLineItem, value: any) => {
      setItems(prev =>
        prev.map(x => (x.id === parseInt(itemId) ? { ...x, [field]: value } : x))
      );
      scheduleAutosave(itemId);  // 800ms debounce!
    },
    [scheduleAutosave]
  );

  return {
    items,
    setItems,
    savingIds,
    errors,
    conflictItemId,
    handleCellChange
  };
}
```

---

## 🎨 REACT KOMPONENTE

### DocumentLineItemsTable - Excel-like Unos

```typescript
// src/components/Document/DocumentItemsTable.tsx
import React, { useRef, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { TextField, Box, CircularProgress } from '@mui/material';
import { useAutoSaveItems } from '../../hooks/useAutoSaveItems';

export const DocumentLineItemsTable: React.FC<{ documentId: number }> = (
  { documentId }
) => {
  const { items, handleCellChange, savingIds, errors } = useAutoSaveItems(documentId);
  const focusRefs = useRef(new Map<string, HTMLInputElement>());

  // Tab/Enter navigacija - KRITIČNO!
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const nextRef = focusRefs.current.get(`${rowIdx}-${colIdx + 1}`);
        if (nextRef) nextRef.focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const nextRef = focusRefs.current.get(`${rowIdx + 1}-${colIdx}`);
        if (nextRef) nextRef.focus();
      }
    },
    []
  );

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <FixedSizeList height={500} itemCount={items.length} itemSize={50} width="100%">
        {({ index, style }) => {
          const item = items[index];
          const isEditing = savingIds.has(item.id.toString());

          return (
            <Box style={style} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
              {/* Količina */}
              <TextField
                size="small"
                type="number"
                value={item.quantity}
                onChange={e =>
                  handleCellChange(item.id.toString(), 'quantity', parseFloat(e.target.value))
                }
                onKeyDown={e => handleKeyDown(e, index, 0)}
                inputRef={ref => { if (ref) focusRefs.current.set(`${index}-0`, ref); }}
                disabled={isEditing}
                error={!!errors[item.id]}
              />

              {/* Cena */}
              <TextField
                size="small"
                type="number"
                value={item.invoicePrice}
                onChange={e =>
                  handleCellChange(item.id.toString(), 'invoicePrice', parseFloat(e.target.value))
                }
                onKeyDown={e => handleKeyDown(e, index, 1)}
                inputRef={ref => { if (ref) focusRefs.current.set(`${index}-1`, ref); }}
                disabled={isEditing}
              />

              {/* Ukupno */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{item.total.toFixed(2)}</span>
                {isEditing && <CircularProgress size={20} />}
              </Box>
            </Box>
          );
        }}
      </FixedSizeList>
    </Box>
  );
};
```

---

## 🔒 KONKURENTNOST HANDLING

### ConflictDialog - Za 409 Greške

```typescript
// src/components/Document/ConflictDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { apiClient } from '../../api/client';

export const ConflictDialog: React.FC<{
  itemId: string;
  documentId: number;
  onRefresh: (item: DocumentLineItem) => void;
  onCancel: () => void;
}> = ({ itemId, documentId, onRefresh, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Opcija 1: Osvežite
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<DocumentLineItem>(
        `/documents/${documentId}/items/${itemId}`
      );
      onRefresh(response.data);
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onCancel}>
      <DialogTitle>⚠️ Stavka je Promenjena</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Stavka je promenjena od strane drugog korisnika.
        </Alert>
        <p><strong>Opcija 1: Osvežite</strong> - Učitajte novo stanje stavke</p>
        <p><strong>Opcija 2: Prepiši</strong> - Izbegnite konkurentnost proveru</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isLoading}>Otkaži</Button>
        <Button onClick={handleRefresh} disabled={isLoading} variant="outlined">
          Osvežite
        </Button>
        <Button disabled={isLoading} variant="contained" color="error">
          Prepiši
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## ✅ DEFINITION OF DONE

### Za Autosave Features
- [ ] 800ms debounce implementiran
- [ ] ETag vraćan iz backend-a
- [ ] If-Match header šalje se u PATCH-u
- [ ] 409 Conflict dialog prikazan
- [ ] Status indicator (Saving/Saved/Error)
- [ ] E2E test sa 2 korisnika prolazi

### Za Deployment
- [ ] Build bez warnings
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score > 90
- [ ] TypeScript errors = 0

---

**Za kompletnu dokumentaciju pogledaj:**
- Backend-Agent-FINAL.md
- Repository-Status-Analiza.md

**FRONTEND AGENT v4.0 - FINALNA VERZIJA** ✅