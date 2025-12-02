import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export const DocumentListPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch documents from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', page, rowsPerPage, searchQuery, statusFilter],
    queryFn: async () => {
      const response = await api.document.list({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        searchTerm: searchQuery || undefined,
      });
      return response;
    },
  });

  const handleNewDocument = () => {
    navigate('/documents/new');
  };

  const handleViewDocument = (id: number) => {
    navigate(`/documents/${id}`);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const documents = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus =
      statusFilter === 'all' || doc.statusId?.toString() === statusFilter;
    return matchesStatus;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dokumenti</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewDocument}
        >
          Novi Dokument
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pretraži po broju"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Svi</MenuItem>
                <MenuItem value="1">Aktivan</MenuItem>
                <MenuItem value="2">Zatvoren</MenuItem>
                <MenuItem value="3">Storniran</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Greška pri učitavanju dokumenata. Proverite da li je backend pokrenut i da li je CORS podešen.
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          {filteredDocuments.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Nema dokumenata.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewDocument}
                sx={{ mt: 2 }}
              >
                Kreiraj novi dokument
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Broj</TableCell>
                      <TableCell>Datum</TableCell>
                      <TableCell>Tip</TableCell>
                      <TableCell>Partner</TableCell>
                      <TableCell>Magacin</TableCell>
                      <TableCell align="right">Neto</TableCell>
                      <TableCell align="right">PDV</TableCell>
                      <TableCell align="right">Ukupno</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Akcije</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id} hover>
                        <TableCell>{document.documentNumber}</TableCell>
                        <TableCell>{document.date}</TableCell>
                        <TableCell>{document.documentTypeCode}</TableCell>
                        <TableCell>{document.partnerName || '-'}</TableCell>
                        <TableCell>{document.organizationalUnitName}</TableCell>
                        <TableCell align="right">
                          {document.totalAmountNet?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell align="right">
                          {document.totalAmountVat?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell align="right">
                          {document.totalAmountGross?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              document.statusId === 1
                                ? 'Aktivan'
                                : document.statusId === 2
                                ? 'Zatvoren'
                                : 'Storniran'
                            }
                            color={
                              document.statusId === 1
                                ? 'success'
                                : document.statusId === 2
                                ? 'default'
                                : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDocument(document.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
                labelRowsPerPage="Redova po stranici:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} od ${count !== -1 ? count : `više od ${to}`}`
                }
              />
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default DocumentListPage;
