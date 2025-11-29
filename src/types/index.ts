/**
 * Central type exports - sve koristi api.types.ts kao source of truth
 */

// Re-export sve iz api.types.ts
export * from './api.types';

// ==========================================
// UI STATE TYPES (samo UI-specifični tipovi)
// ==========================================

export type CellNavigationDirection = 'nextRow' | 'prevRow' | 'nextColumn' | 'prevColumn';

export interface EditableCellProps {
  value: number | string;
  type: 'number' | 'decimal' | 'text' | 'select';
  itemId: number;
  field: string;
  selectOptions?: { value: number | string; label: string }[];
  onValueChange: (itemId: number, field: string, value: string | number) => void;
  status: SaveStatus;
  error?: string | null;
  disabled?: boolean;
  inputRef?: (element: HTMLElement | null) => void;
  onMove?: (direction: CellNavigationDirection) => void;
}

// ==========================================
// STORE TYPES
// ==========================================

export interface DocumentStore {
  items: DocumentLineItemDto[];
  setItems: (items: DocumentLineItemDto[]) => void;
  addItem: (item: DocumentLineItemDto) => void;
  updateItem: (id: number, updates: Partial<DocumentLineItemDto>) => void;
  removeItem: (id: number) => void;
}

export interface UIStore {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// ==========================================
// AUTOSAVE MAP TYPE
// ==========================================

export interface AutoSaveStateMap {
  [itemId: number]: ItemSaveState;
}

// ==========================================
// CONFLICT RESOLUTION
// ==========================================

export interface ConflictData {
  itemId?: number;
  message?: string;
  currentValue?: unknown;
  serverValue?: unknown;
}
