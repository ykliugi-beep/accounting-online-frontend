import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { DependentCost } from '../../types';

interface DocumentCostsTableProps {
  costs: DependentCost[];
  onAddCost: (cost: DependentCost) => void;
  onUpdateCost: (id: number, updates: Partial<DependentCost>) => void;
  onDeleteCost: (id: number) => void;
}

export const DocumentCostsTable: React.FC<DocumentCostsTableProps> = ({
  costs,
  onAddCost,
  onUpdateCost,
  onDeleteCost,
}) => {
  const handleAddCost = () => {
    const nextId = Date.now();
    onAddCost({
      id: nextId,
      description: 'Novi trošak',
      amount: 0,
      method: 'Proporcionalno',
    });
  };

  const handleFieldChange = (
    costId: number,
    field: keyof DependentCost,
    parser?: (value: string) => string | number
  ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parser ? parser(event.target.value) : event.target.value;
      onUpdateCost(costId, { [field]: value });
    };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Zavisni troškovi</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={handleAddCost}>
          Dodaj trošak
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Opis</TableCell>
              <TableCell width="180">Metod raspodele</TableCell>
              <TableCell align="right" width="180">
                Iznos
              </TableCell>
              <TableCell width="80" align="center">
                Akcije
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Nema dodatnih troškova.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {costs.map((cost) => (
              <TableRow key={cost.id} hover>
                <TableCell>
                  <TextField
                    variant="standard"
                    fullWidth
                    value={cost.description}
                    onChange={handleFieldChange(cost.id, 'description')}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    fullWidth
                    value={cost.method ?? ''}
                    onChange={handleFieldChange(cost.id, 'method')}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    variant="standard"
                    fullWidth
                    type="number"
                    inputProps={{ step: '0.01' }}
                    value={cost.amount}
                    onChange={handleFieldChange(cost.id, 'amount', (value) =>
                      Number.isNaN(Number(value)) ? 0 : parseFloat(value)
                    )}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => onDeleteCost(cost.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DocumentCostsTable;
