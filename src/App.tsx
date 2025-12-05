import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Layout } from './components/Layout/Layout';
import { useUIStore } from './store';

// Lazy load all page components for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DocumentListPage = lazy(() => import('./pages/DocumentListPage'));
const DocumentCreatePage = lazy(() => import('./pages/DocumentCreatePage'));
const DocumentDetailPage = lazy(() => import('./pages/DocumentDetailPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Loading fallback component shown while lazy-loaded pages are being fetched
 */
const PageLoader: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="calc(100vh - 64px)" // Full height minus header
    sx={{
      background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(220, 0, 78, 0.05) 100%)',
    }}
  >
    <Box textAlign="center">
      <CircularProgress size={48} thickness={4} />
      <Box mt={2} color="text.secondary" fontSize="0.875rem">
        Učitavanje...
      </Box>
    </Box>
  </Box>
);

const App: React.FC = () => {
  const theme = useUIStore((state) => state.theme);

  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                {/* Dashboard */}
                <Route path="/" element={<DashboardPage />} />
                
                {/* Generic Documents */}
                <Route path="/documents" element={<DocumentListPage />} />
                <Route path="/documents/new" element={<DocumentCreatePage />} />
                <Route path="/documents/:id" element={<DocumentDetailPage />} />
                
                {/* Document Types - VP (Veleprodaja) */}
                <Route path="/documents/vp/ur" element={<DocumentCreatePage docType="UR" />} />
                <Route path="/documents/vp/fo" element={<DocumentCreatePage docType="FO" />} />
                <Route path="/documents/vp/fz" element={<DocumentCreatePage docType="FZ" />} />
                <Route path="/documents/vp/ar" element={<DocumentCreatePage docType="AR" />} />
                <Route path="/documents/vp/pr" element={<DocumentCreatePage docType="PR" />} />
                <Route path="/documents/vp/ro" element={<DocumentCreatePage docType="RO" />} />
                <Route path="/documents/vp/rp" element={<DocumentCreatePage docType="RP" />} />
                <Route path="/documents/vp/po" element={<DocumentCreatePage docType="PO" />} />
                <Route path="/documents/vp/rv" element={<DocumentCreatePage docType="RV" />} />
                <Route path="/documents/vp/ps" element={<DocumentCreatePage docType="PS" />} />
                <Route path="/documents/vp/nv" element={<DocumentCreatePage docType="NV" />} />
                <Route path="/documents/vp/kk" element={<DocumentCreatePage docType="KK" />} />
                <Route path="/documents/vp/vs" element={<DocumentCreatePage docType="VS" />} />
                <Route path="/documents/vp/mj" element={<DocumentCreatePage docType="MJ" />} />
                <Route path="/documents/vp/op" element={<DocumentCreatePage docType="OP" />} />
                <Route path="/documents/vp/id" element={<DocumentCreatePage docType="ID" />} />
                <Route path="/documents/vp/tr" element={<DocumentCreatePage docType="TR" />} />
                <Route path="/documents/vp/pd" element={<DocumentCreatePage docType="PD" />} />
                
                {/* Document Types - MP (Maloprodaja) */}
                <Route path="/documents/mp/pm" element={<DocumentCreatePage docType="PM" />} />
                <Route path="/documents/mp/psm" element={<DocumentCreatePage docType="PSM" />} />
                <Route path="/documents/mp/vsm" element={<DocumentCreatePage docType="VSM" />} />
                <Route path="/documents/mp/mjm" element={<DocumentCreatePage docType="MJM" />} />
                <Route path="/documents/mp/idm" element={<DocumentCreatePage docType="IDM" />} />
                <Route path="/documents/mp/opm" element={<DocumentCreatePage docType="OPM" />} />
                <Route path="/documents/mp/kkm" element={<DocumentCreatePage docType="KKM" />} />
                <Route path="/documents/mp/nvm" element={<DocumentCreatePage docType="NVM" />} />
                <Route path="/documents/mp/oum" element={<DocumentCreatePage docType="OUM" />} />
                <Route path="/documents/mp/oim" element={<DocumentCreatePage docType="OIM" />} />
                <Route path="/documents/mp/rmz" element={<DocumentCreatePage docType="RMZ" />} />
                <Route path="/documents/mp/rpm" element={<DocumentCreatePage docType="RPM" />} />
                <Route path="/documents/mp/trm" element={<DocumentCreatePage docType="TRM" />} />
                <Route path="/documents/mp/dmk" element={<DocumentCreatePage docType="DMK" />} />
                
                {/* 404 - Redirect to Dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
