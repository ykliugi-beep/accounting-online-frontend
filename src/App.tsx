import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DocumentDetailPage from './pages/DocumentDetailPage';

const theme = createTheme();

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <DocumentDetailPage />
  </ThemeProvider>
);

export default App;
