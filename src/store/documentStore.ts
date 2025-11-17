import { create } from 'zustand';
import type { DependentCost, DocumentDetails, DocumentLineItem } from '../types';

export interface DocumentStoreState {
  currentDocument: DocumentDetails | null;
  items: DocumentLineItem[];
  costs: DependentCost[];
  setCurrentDocument: (document: DocumentDetails | null) => void;
  updateDocument: (updates: Partial<DocumentDetails>) => void;
  clearDocument: () => void;
  setItems: (items: DocumentLineItem[]) => void;
  addItem: (item: DocumentLineItem) => void;
  updateItem: (id: number, updates: Partial<DocumentLineItem>) => void;
  replaceItem: (item: DocumentLineItem) => void;
  deleteItem: (id: number) => void;
  setCosts: (costs: DependentCost[]) => void;
  addCost: (cost: DependentCost) => void;
  updateCost: (id: number, updates: Partial<DependentCost>) => void;
  deleteCost: (id: number) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentStoreState>((set) => ({
  currentDocument: null,
  items: [],
  costs: [],
  setCurrentDocument: (document) => set({ currentDocument: document }),
  updateDocument: (updates) =>
    set((state) => ({
      currentDocument: state.currentDocument
        ? { ...state.currentDocument, ...updates }
        : state.currentDocument,
    })),
  clearDocument: () => set({ currentDocument: null }),
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
  replaceItem: (item) =>
    set((state) => {
      const exists = state.items.some((existing) => existing.id === item.id);
      return {
        items: exists
          ? state.items.map((existing) => (existing.id === item.id ? item : existing))
          : [...state.items, item],
      };
    }),
  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  setCosts: (costs) => set({ costs }),
  addCost: (cost) => set((state) => ({ costs: [...state.costs, cost] })),
  updateCost: (id, updates) =>
    set((state) => ({
      costs: state.costs.map((cost) => (cost.id === id ? { ...cost, ...updates } : cost)),
    })),
  deleteCost: (id) =>
    set((state) => ({
      costs: state.costs.filter((cost) => cost.id !== id),
    })),
  reset: () => set({ currentDocument: null, items: [], costs: [] }),
}));
