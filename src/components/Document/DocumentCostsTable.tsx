// Moved from src/components/DocumentCostsTable.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

interface DocumentCostsTableProps {
  documentId: number;
}

export const DocumentCostsTable: React.FC<DocumentCostsTableProps> = ({
  documentId,
}) => {
  const [expandedCostId, setExpandedCostId] = useState<number | null>(null);

  // Fetch costs
  const { data: costs } = useQuery({
    queryKey: ['documentCosts', documentId],
    queryFn: async () => api.cost.list(documentId),
    enabled: !!documentId,
  });

  const handleToggleAccordion = (costId: number) => {
    setExpandedCostId((prev) => (prev === costId ? null : costId));
  };

  const handleAddCost = () => {
    // TODO: Open dialog to add new cost
    console.log('Add cost');
  };

  const handleDeleteCost = (costId: number) => {
    // TODO: Implement delete cost
    console.log('Delete cost', costId);
  };

  if (!costs) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Zavisni Troškovi</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCost}
        >
          Dodaj Trošak
        </Button>
      </Box>

      {costs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Nema zavisnih troškova. Klikni "Dodaj Trošak" da dodaš novi.
          </Typography>
        </Paper>
      ) : (
        costs.map((cost) => (
          <Accordion
            key={cost.id}
            expanded={expandedCostId === cost.id}
            onChange={() => handleToggleAccordion(cost.id)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                pr={2}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {cost.documentNumber} - {cost.partnerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ukupno: {cost.totalAmountNet.toFixed(2)} + PDV{' '}
                    {cost.totalAmountVat.toFixed(2)} ={' '}
                    <strong>
                      {(cost.totalAmountNet + cost.totalAmountVat).toFixed(2)}
                    </strong>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={`${cost.items.length} stavki`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCost(cost.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vrsta Troška</TableCell>
                      <TableCell>Način Raspodele</TableCell>
                      <TableCell align="right">Iznos</TableCell>
                      <TableCell align="right">PDV</TableCell>
                      <TableCell align="right">Ukupno</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cost.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.costTypeName}</TableCell>
                        <TableCell>{item.distributionMethodName}</TableCell>
                        <TableCell align="right">
                          {item.amount.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {item.totalVat.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {(item.amount + item.totalVat).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2}>
                        <strong>Ukupno:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{cost.totalAmountNet.toFixed(2)}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{cost.totalAmountVat.toFixed(2)}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {(cost.totalAmountNet + cost.totalAmountVat).toFixed(2)}
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default DocumentCostsTable;
