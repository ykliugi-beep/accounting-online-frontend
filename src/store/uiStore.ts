import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ConflictData } from '../types';

// ============================================================================
// UI STORE STATE
// ============================================================================

interface UIState {
  isLoading: boolean;
  currentTab: number;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error' | 'warning' | 'info';
  
  // Conflict dialog state
  showConflictDialog: boolean;
  conflictData: ConflictData | null;
}

interface UIActions {
  setLoading: (isLoading: boolean) => void;
  setCurrentTab: (tab: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  showSnackbar: (message: string, severity?: UIState['snackbarSeverity']) => void;
  hideSnackbar: () => void;
  
  // Conflict dialog actions
  openConflictDialog: (data: ConflictData) => void;
  closeConflictDialog: () => void;
}

type UIStore = UIState & UIActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UIState = {
  isLoading: false,
  currentTab: 0,
  sidebarOpen: true,
  theme: 'light',
  snackbarOpen: false,
  snackbarMessage: '',
  snackbarSeverity: 'info',
  showConflictDialog: false,
  conflictData: null,
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useUIStore = create<UIStore>()(  devtools(
    (set) => ({
      ...initialState,

      setLoading: (isLoading) => set({ isLoading }),
      
      setCurrentTab: (tab) => set({ currentTab: tab }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      showSnackbar: (message, severity = 'info') =>
        set({
          snackbarOpen: true,
          snackbarMessage: message,
          snackbarSeverity: severity,
        }),
      
      hideSnackbar: () => set({ snackbarOpen: false }),
      
      // Conflict dialog actions
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
    }),
    { name: 'ui-store' }
  )
);
