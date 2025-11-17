import { create } from 'zustand';

export interface ConflictData {
  itemId?: number;
  message?: string;
  detail?: string;
}

export interface UIStoreState {
  isLoading: boolean;
  showConflictDialog: boolean;
  conflictData: ConflictData | null;
  setLoading: (loading: boolean) => void;
  openConflictDialog: (data: ConflictData) => void;
  closeConflictDialog: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  isLoading: false,
  showConflictDialog: false,
  conflictData: null,
  setLoading: (loading) => set({ isLoading: loading }),
  openConflictDialog: (data) =>
    set({
      showConflictDialog: true,
      conflictData: data,
    }),
  closeConflictDialog: () =>
    set({
      showConflictDialog: false,
      conflictData: null,
    }),
}));
