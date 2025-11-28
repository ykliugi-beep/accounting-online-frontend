import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  DocumentDto,
  DocumentLineItemDto,
  DocumentCostDto,
  ItemSaveState,
  CostSaveState,
} from '../types/api.types';

// ============================================================================
// DOCUMENT STORE STATE
// ============================================================================

interface DocumentState {
  // Current document
  currentDocument: DocumentDto | null;
  
  // Line items
  items: DocumentLineItemDto[];
  itemSaveStates: Map<number, ItemSaveState>;
  
  // Costs
  costs: DocumentCostDto[];
  costSaveStates: Map<number, CostSaveState>;
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

interface DocumentActions {
  // Document actions
  setCurrentDocument: (document: DocumentDto | null) => void;
  updateDocument: (updates: Partial<DocumentDto>) => void;
  
  // Line items actions
  setItems: (items: DocumentLineItemDto[]) => void;
  addItem: (item: DocumentLineItemDto) => void;
  updateItem: (itemId: number, updates: Partial<DocumentLineItemDto>) => void;
  removeItem: (itemId: number) => void;
  setItemSaveState: (itemId: number, state: ItemSaveState) => void;
  getItemSaveState: (itemId: number) => ItemSaveState | undefined;
  
  // Costs actions
  setCosts: (costs: DocumentCostDto[]) => void;
  addCost: (cost: DocumentCostDto) => void;
  updateCost: (costId: number, updates: Partial<DocumentCostDto>) => void;
  deleteCost: (costId: number) => void;
  setCostSaveState: (costId: number, state: CostSaveState) => void;
  getCostSaveState: (costId: number) => CostSaveState | undefined;
  
  // UI actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type DocumentStore = DocumentState & DocumentActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: DocumentState = {
  currentDocument: null,
  items: [],
  itemSaveStates: new Map(),
  costs: [],
  costSaveStates: new Map(),
  isLoading: false,
  error: null,
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useDocumentStore = create<DocumentStore>()(  devtools(
    (set, get) => ({
      ...initialState,

      // Document actions
      setCurrentDocument: (document) => set({ currentDocument: document }),
      
      updateDocument: (updates) =>
        set((state) => ({
          currentDocument: state.currentDocument
            ? { ...state.currentDocument, ...updates }
            : null,
        })),

      // Line items actions
      setItems: (items) => set({ items }),
      
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
          itemSaveStates: new Map(state.itemSaveStates).set(item.id, {
            id: item.id,
            status: 'idle',
            error: null,
            etag: item.etag,
          }),
        })),
      
      updateItem: (itemId, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        })),
      
      removeItem: (itemId) =>
        set((state) => {
          const newSaveStates = new Map(state.itemSaveStates);
          newSaveStates.delete(itemId);
          return {
            items: state.items.filter((item) => item.id !== itemId),
            itemSaveStates: newSaveStates,
          };
        }),
      
      setItemSaveState: (itemId, saveState) =>
        set((state) => ({
          itemSaveStates: new Map(state.itemSaveStates).set(itemId, saveState),
        })),
      
      getItemSaveState: (itemId) => get().itemSaveStates.get(itemId),

      // Costs actions
      setCosts: (costs) => set({ costs }),
      
      addCost: (cost) =>
        set((state) => ({
          costs: [...state.costs, cost],
          costSaveStates: new Map(state.costSaveStates).set(cost.id, {
            id: cost.id,
            status: 'idle',
            error: null,
            etag: cost.etag,
          }),
        })),
      
      updateCost: (costId, updates) =>
        set((state) => ({
          costs: state.costs.map((cost) =>
            cost.id === costId ? { ...cost, ...updates } : cost
          ),
        })),
      
      deleteCost: (costId) =>
        set((state) => {
          const newSaveStates = new Map(state.costSaveStates);
          newSaveStates.delete(costId);
          return {
            costs: state.costs.filter((cost) => cost.id !== costId),
            costSaveStates: newSaveStates,
          };
        }),
      
      setCostSaveState: (costId, saveState) =>
        set((state) => ({
          costSaveStates: new Map(state.costSaveStates).set(costId, saveState),
        })),
      
      getCostSaveState: (costId) => get().costSaveStates.get(costId),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'document-store' }
  )
);
