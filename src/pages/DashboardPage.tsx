import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Description,
  Add,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch dashboard stats from API
  const { isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // TODO: Replace with actual API endpoint when available
      // const response = await api.dashboard.getStats();
      // return response;
      return null;
    },
  });

  // Fetch recent documents from API
  const { data: recentDocs, isLoading: docsLoading, error: docsError } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: async () => {
      const response = await api.document.list({ pageNumber: 1, pageSize: 5 });
      return response.items || [];
    },
  });

  const quickActions = [
    {
      label: 'Nova Ulazna Kalkulacija',
      icon: <Add />,
      onClick: () => navigate('/documents/vp/ur'),
      color: 'primary',
    },
    {
      label: 'Novi Račun Otpremnica',
      icon: <Add />,
      onClick: () => navigate('/documents/vp/ro'),
      color: 'secondary',
    },
    {
      label: 'Pregled Dokumenata',
      icon: <Description />,
      onClick: () => navigate('/documents'),
      color: 'info',
    },
    {
      label: 'Izveštaji',
      icon: <Assessment />,
      onClick: () => navigate('/reports'),
      color: 'success',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pregled ključnih metrika i brzi pristup funkcijama
        </Typography>
      </Box>

      {/* Quick Stats - Only show if API is available */}
      {statsLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {statsError && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Statistika trenutno nije dostupna: {String((statsError as Error)?.message || 'Nepoznata greška')}. Koristite brze akcije ispod za rad sa dokumentima.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Brze Akcije
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Button
                    variant="outlined"
                    color={action.color as any}
                    fullWidth
                    startIcon={action.icon}
                    onClick={action.onClick}
                    sx={{ py: 1.5, justifyContent: 'flex-start' }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Nedavni Dokumenti
            </Typography>

            {docsLoading && (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress size={32} />
              </Box>
            )}

            {docsError && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Dokumenti trenutno nisu dostupni: {String((docsError as Error)?.message || 'Nepoznata greška')}
              </Alert>
            )}

            {!docsLoading && !docsError && recentDocs && recentDocs.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Nema nedavnih dokumenata.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/documents/vp/ur')}
                  sx={{ mt: 2 }}
                >
                  Kreiraj prvi dokument
                </Button>
              </Box>
            )}

            {!docsLoading && !docsError && recentDocs && recentDocs.length > 0 && (
              <>
                <Box sx={{ mt: 2 }}>
                  {recentDocs.map((doc: any) => (
                    <Card
                      key={doc.id}
                      sx={{
                        mb: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Description color="primary" />
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {doc.documentNumber || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {doc.documentType} • {doc.documentDate}
                            </Typography>
                          </Box>
                          {doc.totalAmount && (
                            <Typography variant="body1" fontWeight="medium">
                              {doc.totalAmount.toLocaleString('sr-RS')} RSD
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                <Button
                  fullWidth
                  variant="text"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/documents')}
                >
                  Vidi sve dokumente
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
