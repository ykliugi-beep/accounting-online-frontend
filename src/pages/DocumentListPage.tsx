// Moved from src/pages/DocumentList.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { DocumentDto } from '../types/api.types';

export const DocumentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', page, rowsPerPage, searchQuery],
    queryFn: async () => {
      // TODO: Implement proper pagination API call
      return {
        items: [] as DocumentDto[],
        totalCount: 0,
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        totalPages: 0,
        hasPrevious: page > 0,
        hasNext: false,
      };
    },
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDocument = (documentId: number) => {
    navigate(`/documents/${documentId}`);
  };

  const handleCreateDocument = () => {
    navigate('/documents/new');
  };

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Greška pri učitavanju dokumenata</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Ulazni Računi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDocument}
        >
          Novi dokument
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Pretraži dokumente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" startIcon={<FilterList />}>
            Filteri
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Broj dokumenta</TableCell>
              <TableCell>Datum</TableCell>
              <TableCell>Partner</TableCell>
              <TableCell>Org. jedinica</TableCell>
              <TableCell align="right">Iznos netto</TableCell>
              <TableCell align="right">PDV</TableCell>
              <TableCell align="right">Ukupno</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Akcije</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Učitavanje...
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Nema dokumenata
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>{doc.documentNumber}</TableCell>
                  <TableCell>{new Date(doc.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{doc.partnerName || '-'}</TableCell>
                  <TableCell>{doc.organizationalUnitName}</TableCell>
                  <TableCell align="right">
                    {doc.totalAmountNet.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {doc.totalAmountVat.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {doc.totalAmountGross.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.statusId === 1 ? 'Aktivan' : 'Neaktivan'}
                      color={doc.statusId === 1 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDocument(doc.id)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={data?.totalCount || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Redova po stranici:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} od ${count !== -1 ? count : `više od ${to}`}`
          }
        />
      </TableContainer>
    </Box>
  );
};

export default DocumentListPage;
