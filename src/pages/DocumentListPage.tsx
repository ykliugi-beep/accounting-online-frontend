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
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { DocumentDto } from '../types';

export const DocumentListPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data for now - replace with actual API call
  const mockDocuments: DocumentDto[] = [
    {
      id: 1,
      documentTypeCode: 'UR',
      documentNumber: 'UR-2024-001',
      date: '2024-01-15',
      partnerId: 1,
      partnerName: 'Partner A',
      organizationalUnitId: 1,
      organizationalUnitName: 'Magacin 1',
      referentId: null,
      referentName: null,
      dueDate: null,
      currencyDate: null,
      partnerDocumentNumber: null,
      partnerDocumentDate: null,
      taxationMethodId: null,
      statusId: 1,
      currencyId: null,
      exchangeRate: null,
      notes: null,
      totalAmountNet: 10000,
      totalAmountVat: 2000,
      totalAmountGross: 12000,
      dependentCostsNet: 0,
      dependentCostsVat: 0,
      createdAt: '2024-01-15T10:00:00',
      createdBy: 'admin',
      updatedAt: null,
      updatedBy: null,
      etag: 'abc123',
    },
  ];

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', page, rowsPerPage, searchQuery, statusFilter],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return mockDocuments;
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

  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.documentNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || doc.statusId?.toString() === statusFilter;
    return matchesSearch && matchesStatus;
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

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
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
                {filteredDocuments?.map((document) => (
                  <TableRow key={document.id} hover>
                    <TableCell>{document.documentNumber}</TableCell>
                    <TableCell>{document.date}</TableCell>
                    <TableCell>{document.documentTypeCode}</TableCell>
                    <TableCell>{document.partnerName || '-'}</TableCell>
                    <TableCell>{document.organizationalUnitName}</TableCell>
                    <TableCell align="right">
                      {document.totalAmountNet.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {document.totalAmountVat.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {document.totalAmountGross.toFixed(2)}
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
            count={filteredDocuments?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}
    </Box>
  );
};

export default DocumentListPage;
