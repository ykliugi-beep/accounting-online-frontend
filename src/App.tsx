import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Layout } from './components/Layout/Layout';
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
          <Layout>
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              
              {/* Generic Documents */}
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/documents/new" element={<DocumentCreatePage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              
              {/* Document Types - VP (Veleprodaja) - FIXED: Direct to form */}
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
              
              {/* Document Types - MP (Maloprodaja) - FIXED: Direct to form */}
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
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
