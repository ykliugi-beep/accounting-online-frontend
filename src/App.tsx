import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentListPage } from './pages/DocumentListPage';
import { DocumentCreatePage } from './pages/DocumentCreatePage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { useUIStore } from './store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { theme: themeMode } = useUIStore();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
      }),
    [themeMode]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              
              {/* Documents */}
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/documents/new" element={<DocumentCreatePage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              
              {/* Document Types - VP (Veleprodaja) */}
              <Route path="/documents/vp/ur" element={<DocumentListPage />} />
              <Route path="/documents/vp/fo" element={<DocumentListPage />} />
              <Route path="/documents/vp/fz" element={<DocumentListPage />} />
              <Route path="/documents/vp/ar" element={<DocumentListPage />} />
              <Route path="/documents/vp/pr" element={<DocumentListPage />} />
              <Route path="/documents/vp/ro" element={<DocumentListPage />} />
              <Route path="/documents/vp/rp" element={<DocumentListPage />} />
              <Route path="/documents/vp/po" element={<DocumentListPage />} />
              <Route path="/documents/vp/rv" element={<DocumentListPage />} />
              <Route path="/documents/vp/ps" element={<DocumentListPage />} />
              <Route path="/documents/vp/nv" element={<DocumentListPage />} />
              <Route path="/documents/vp/kk" element={<DocumentListPage />} />
              <Route path="/documents/vp/vs" element={<DocumentListPage />} />
              <Route path="/documents/vp/mj" element={<DocumentListPage />} />
              <Route path="/documents/vp/op" element={<DocumentListPage />} />
              <Route path="/documents/vp/id" element={<DocumentListPage />} />
              <Route path="/documents/vp/tr" element={<DocumentListPage />} />
              <Route path="/documents/vp/pd" element={<DocumentListPage />} />
              
              {/* Document Types - MP (Maloprodaja) */}
              <Route path="/documents/mp/pm" element={<DocumentListPage />} />
              <Route path="/documents/mp/psm" element={<DocumentListPage />} />
              <Route path="/documents/mp/vsm" element={<DocumentListPage />} />
              <Route path="/documents/mp/mjm" element={<DocumentListPage />} />
              <Route path="/documents/mp/idm" element={<DocumentListPage />} />
              <Route path="/documents/mp/opm" element={<DocumentListPage />} />
              <Route path="/documents/mp/kkm" element={<DocumentListPage />} />
              <Route path="/documents/mp/nvm" element={<DocumentListPage />} />
              <Route path="/documents/mp/oum" element={<DocumentListPage />} />
              <Route path="/documents/mp/oim" element={<DocumentListPage />} />
              <Route path="/documents/mp/rmz" element={<DocumentListPage />} />
              <Route path="/documents/mp/rpm" element={<DocumentListPage />} />
              <Route path="/documents/mp/trm" element={<DocumentListPage />} />
              <Route path="/documents/mp/dmk" element={<DocumentListPage />} />
              
              {/* Inventory */}
              <Route path="/inventory/stock" element={<ComingSoonPage title="Robna Evidencija" />} />
              
              {/* Master Data */}
              <Route path="/master-data/payment-types" element={<ComingSoonPage title="Vrste Plaćanja" />} />
              <Route path="/master-data/banks" element={<ComingSoonPage title="Banke" />} />
              <Route path="/master-data/places" element={<ComingSoonPage title="Mesta" />} />
              <Route path="/master-data/countries" element={<ComingSoonPage title="Države" />} />
              <Route path="/master-data/categories" element={<ComingSoonPage title="Kategorije" />} />
              <Route path="/master-data/org-units" element={<ComingSoonPage title="Organizacione Jedinice" />} />
              <Route path="/master-data/territories" element={<ComingSoonPage title="Teritorije" />} />
              <Route path="/master-data/invoice-types" element={<ComingSoonPage title="Vrste Ulaznih Računa" />} />
              <Route path="/master-data/articles" element={<ComingSoonPage title="Artikli i Usluge" />} />
              <Route path="/master-data/units" element={<ComingSoonPage title="Jedinice Mera" />} />
              <Route path="/master-data/tax-rates" element={<ComingSoonPage title="Poreske Stope" />} />
              <Route path="/master-data/currencies" element={<ComingSoonPage title="Valute" />} />
              <Route path="/master-data/vehicles" element={<ComingSoonPage title="Vozila" />} />
              <Route path="/master-data/vehicle-models" element={<ComingSoonPage title="Modeli Vozila" />} />
              
              {/* Finance */}
              <Route path="/finance" element={<ComingSoonPage title="Finansije" />} />
              
              {/* Reports */}
              <Route path="/reports" element={<ComingSoonPage title="Izveštaji" />} />
              
              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Placeholder component for coming soon pages
const ComingSoonPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ textAlign: 'center', padding: '4rem' }}>
    <h2>{title}</h2>
    <p style={{ color: '#666' }}>Ova stranica je u razvoju...</p>
  </div>
);

export default App;
