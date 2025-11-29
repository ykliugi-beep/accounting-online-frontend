import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  ExpandMore,
  PlayArrow,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { useAllCombos } from '../../hooks/useCombos';
import { formatCurrency, formatDate } from '../../utils';
import type {
  DocumentCostDto,
  CreateDocumentCostDto,
  CreateDocumentCostItemDto,
  CostItemVatDto,
  PartnerComboDto,
  CostTypeComboDto,
  CostDistributionMethodComboDto,
  TaxRateComboDto,
} from '../../types/api.types';

interface DocumentCostsTableProps {
  documentId: number;
}

export const DocumentCostsTable: React.FC<DocumentCostsTableProps> = ({ documentId }) => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<DocumentCostDto | null>(null);
  const [selectedCostId, setSelectedCostId] = useState<number | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  const { data: combosData } = useAllCombos('UR');
  const partners = combosData?.partners;
  const costTypes = combosData?.costTypes;
  const costDistributionMethods = combosData?.costDistributionMethods;
  const taxRates = combosData?.taxRates;

  // Load costs
  const { data: costs, isLoading } = useQuery({
    queryKey: ['document-costs', documentId],
    queryFn: () => api.cost.list(documentId),
  });

  // Create cost mutation
  const createCostMutation = useMutation({
    mutationFn: (data: CreateDocumentCostDto) => api.cost.create(documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['document-costs', documentId]);
      setCreateDialogOpen(false);
    },
  });

  // Delete cost mutation
  const deleteCostMutation = useMutation({
    mutationFn: (costId: number) => api.cost.delete(documentId, costId),
    onSuccess: () => {
      queryClient.invalidateQueries(['document-costs', documentId]);
    },
  });

  // Distribute cost mutation
  const distributeMutation = useMutation({
    mutationFn: ({ costId, itemId }: { costId: number; itemId: number }) =>
      api.costItem.distribute(documentId, costId, { itemId, recalculate: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['document-costs', documentId]);
      queryClient.invalidateQueries(['document-items', documentId]);
    },
  });

  const handleCreateCost = () => {
    setCreateDialogOpen(true);
  };

  const handleDeleteCost = (costId: number) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj trošak?')) {
      deleteCostMutation.mutate(costId);
    }
  };

  const handleDistribute = (costId: number) => {
    if (confirm('Primeniti raspodelu troška na sve stavke dokumenta?')) {
      // TODO: Get selected item ID from user
      const itemId = 1; // Placeholder
      distributeMutation.mutate({ costId, itemId });
    }
  };

  const totalCostAmount = costs?.reduce((sum, cost) => sum + cost.totalAmountNet, 0) || 0;
  const totalCostVat = costs?.reduce((sum, cost) => sum + cost.totalAmountVat, 0) || 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Zavisni Troškovi
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreateCost}>
          Dodaj Trošak
        </Button>
      </Box>

      {costs && costs.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Ukupno troškova: <strong>{formatCurrency(totalCostAmount)}</strong> | PDV:
          <strong>{formatCurrency(totalCostVat)}</strong>
        </Alert>
      )}

      {costs && costs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Nema zavisnih troškova. Kliknite "Dodaj Trošak" da dodate novi.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {costs?.map((cost) => (
            <CostCard
              key={cost.id}
              cost={cost}
              documentId={documentId}
              onDelete={() => handleDeleteCost(cost.id)}
              onDistribute={() => handleDistribute(cost.id)}
              costTypes={costTypes || []}
              costDistributionMethods={costDistributionMethods || []}
              taxRates={taxRates || []}
            />
          ))}
        </Box>
      )}

      {/* Create Cost Dialog */}
      <CreateCostDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={(data) => createCostMutation.mutate(data)}
        partners={partners || []}
        isLoading={createCostMutation.isLoading}
      />
    </Box>
  );
};

// Cost Card Component
interface CostCardProps {
  cost: DocumentCostDto;
  documentId: number;
  onDelete: () => void;
  onDistribute: () => void;
  costTypes: CostTypeComboDto[];
  costDistributionMethods: CostDistributionMethodComboDto[];
  taxRates: TaxRateComboDto[];
}

const CostCard: React.FC<CostCardProps> = ({
  cost,
  documentId,
  onDelete,
  onDistribute,
  costTypes,
  costDistributionMethods,
  taxRates,
}) => {
  const queryClient = useQueryClient();
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  // Create cost item mutation
  const createItemMutation = useMutation({
    mutationFn: (data: CreateDocumentCostItemDto) =>
      api.costItem.create(documentId, cost.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['document-costs', documentId]);
      setItemDialogOpen(false);
    },
  });

  // Delete cost item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => api.costItem.delete(documentId, cost.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['document-costs', documentId]);
    },
  });

  const handleDeleteItem = (itemId: number) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovu stavku troška?')) {
      deleteItemMutation.mutate(itemId);
    }
  };

  return (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box display="flex" alignItems="center" gap={2} width="100%">
          <Typography variant="subtitle1" fontWeight="bold">
            {cost.partnerName} - {cost.documentTypeCode} {cost.documentNumber}
          </Typography>
          <Chip label={formatDate(cost.dueDate)} size="small" />
          <Box flexGrow={1} />
          <Typography variant="body2" color="text.secondary">
            Neto: {formatCurrency(cost.totalAmountNet)} | PDV:{' '}
            {formatCurrency(cost.totalAmountVat)}
          </Typography>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          {/* Cost Header Info */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                Partner
              </Typography>
              <Typography variant="body2">{cost.partnerName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                Datum Dospeca
              </Typography>
              <Typography variant="body2">{formatDate(cost.dueDate)}</Typography>
            </Grid>
            {cost.description && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Opis
                </Typography>
                <Typography variant="body2">{cost.description}</Typography>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Cost Items Table */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Stavke Troška ({cost.items.length})
            </Typography>
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => setItemDialogOpen(true)}
            >
              Dodaj Stavku
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Vrsta Troška</TableCell>
                  <TableCell>Način Deljenja</TableCell>
                  <TableCell align="right">Iznos</TableCell>
                  <TableCell>PDV</TableCell>
                  <TableCell>Sve Stavke</TableCell>
                  <TableCell align="center">Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cost.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" py={2}>
                        Nema stavki troška
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cost.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.costTypeName}</TableCell>
                      <TableCell>{item.distributionMethodName}</TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(item.amount)}</strong>
                      </TableCell>
                      <TableCell>
                        {item.vatItems.length > 0 ? (
                          <Box>
                            {item.vatItems.map((vat, idx) => (
                              <Typography key={idx} variant="caption" display="block">
                                {vat.taxRateName}: {formatCurrency(vat.vatAmount)}
                              </Typography>
                            ))}
                            <Typography variant="caption" color="primary">
                              <strong>Ukupno: {formatCurrency(item.totalVat)}</strong>
                            </Typography>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {item.applyToAllItems ? (
                          <Chip label="Da" color="success" size="small" />
                        ) : (
                          <Chip label="Ne" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Distribute Button */}
          {cost.items.length > 0 && (
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrow />}
                onClick={onDistribute}
              >
                Primeni Raspodelu
              </Button>
            </Box>
          )}

          {/* Create Item Dialog */}
          <CreateCostItemDialog
            open={itemDialogOpen}
            onClose={() => setItemDialogOpen(false)}
            onSubmit={(data) => createItemMutation.mutate(data)}
            costTypes={costTypes}
            costDistributionMethods={costDistributionMethods}
            taxRates={taxRates}
            isLoading={createItemMutation.isLoading}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

// Create Cost Dialog
interface CreateCostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDocumentCostDto) => void;
  partners: PartnerComboDto[];
  isLoading: boolean;
}

const CreateCostDialog: React.FC<CreateCostDialogProps> = ({
  open,
  onClose,
  onSubmit,
  partners,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateDocumentCostDto>({
    partnerId: 0,
    documentTypeCode: 'UR',
    documentNumber: '',
    dueDate: new Date().toISOString().split('T')[0],
    currencyDate: null,
    description: null,
    statusId: 1,
    currencyId: null,
    exchangeRate: null,
  });

  const handleSubmit = () => {
    if (!formData.partnerId || !formData.documentNumber) {
      alert('Partner i broj dokumenta su obavezni');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Dodaj Novi Trošak</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={partners}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={partners.find((p: PartnerComboDto) => p.id === formData.partnerId) || null}
              onChange={(_, value) =>
                setFormData({ ...formData, partnerId: value?.id || 0 })
              }
              renderInput={(params) => (
                <TextField {...params} required label="Partner" placeholder="Izaberite partnera" />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Broj Dokumenta"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Datum Dospeca"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Opis"
              multiline
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Odustani
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isLoading ? 'Čuvam...' : 'Sačuvaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Create Cost Item Dialog
interface CreateCostItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDocumentCostItemDto) => void;
  costTypes: CostTypeComboDto[];
  costDistributionMethods: CostDistributionMethodComboDto[];
  taxRates: TaxRateComboDto[];
  isLoading: boolean;
}

const CreateCostItemDialog: React.FC<CreateCostItemDialogProps> = ({
  open,
  onClose,
  onSubmit,
  costTypes,
  costDistributionMethods,
  taxRates,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateDocumentCostItemDto>({
    costTypeId: 0,
    distributionMethodId: 0,
    amount: 0,
    applyToAllItems: false,
    statusId: 1,
    calculateTaxOnCost: false,
    addVatToCost: false,
    currencyAmount: null,
    cashAmount: null,
    cardAmount: null,
    wireTransferAmount: null,
    quantity: null,
    vatItems: [],
  });

  const [vatRows, setVatRows] = useState<CostItemVatDto[]>([]);

  const handleAddVat = () => {
    if (taxRates.length > 0) {
      setVatRows([...vatRows, { taxRateId: taxRates[0].id, vatAmount: 0 }]);
    }
  };

  const handleRemoveVat = (index: number) => {
    setVatRows(vatRows.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.costTypeId || !formData.distributionMethodId) {
      alert('Vrsta troška i način deljenja su obavezni');
      return;
    }
    onSubmit({ ...formData, vatItems: vatRows });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Dodaj Stavku Troška</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={costTypes}
              getOptionLabel={(option) => option.name}
              value={costTypes.find((ct: CostTypeComboDto) => ct.id === formData.costTypeId) || null}
              onChange={(_, value) =>
                setFormData({ ...formData, costTypeId: value?.id || 0 })
              }
              renderInput={(params) => (
                <TextField {...params} required label="Vrsta Troška" />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={costDistributionMethods}
              getOptionLabel={(option) => option.name}
              value={
                costDistributionMethods.find((m: CostDistributionMethodComboDto) => m.id === formData.distributionMethodId) || null
              }
              onChange={(_, value) =>
                setFormData({ ...formData, distributionMethodId: value?.id || 0 })
              }
              renderInput={(params) => (
                <TextField {...params} required label="Način Deljenja" />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Iznos"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              inputProps={{ step: 0.01, min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.applyToAllItems}
                  onChange={(e) => setFormData({ ...formData, applyToAllItems: e.target.checked })}
                />
              }
              label="Primeni na sve stavke"
            />
          </Grid>

          {/* VAT Items */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">PDV Stavke</Typography>
              <Button size="small" startIcon={<Add />} onClick={handleAddVat}>
                Dodaj PDV
              </Button>
            </Box>
            {vatRows.map((vat, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <Autocomplete
                    size="small"
                    options={taxRates}
                    getOptionLabel={(option) => `${option.id} - ${option.name} (${option.percentage}%)`}
                    value={taxRates.find((tr: TaxRateComboDto) => tr.id === vat.taxRateId) || null}
                    onChange={(_, value) => {
                      const updated = [...vatRows];
                      updated[index].taxRateId = value?.id || '';
                      setVatRows(updated);
                    }}
                    renderInput={(params) => <TextField {...params} label="Poreska Stopa" />}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Iznos PDV-a"
                    type="number"
                    value={vat.vatAmount}
                    onChange={(e) => {
                      const updated = [...vatRows];
                      updated[index].vatAmount = parseFloat(e.target.value) || 0;
                      setVatRows(updated);
                    }}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="error" onClick={() => handleRemoveVat(index)}>
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Odustani
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isLoading ? 'Čuvam...' : 'Sačuvaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
