import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
}

interface UIActions {
  setLoading: (isLoading: boolean) => void;
  setCurrentTab: (tab: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  showSnackbar: (message: string, severity?: UIState['snackbarSeverity']) => void;
  hideSnackbar: () => void;
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
    }),
    { name: 'ui-store' }
  )
);
