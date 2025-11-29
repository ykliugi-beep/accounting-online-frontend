import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Autocomplete,
  Typography,
  Skeleton,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TableContainer,
} from '@mui/material';
import { ExpandMore, Add, Delete } from '@mui/icons-material';
import { useAllCombos } from '../../hooks/useCombos';
import type { 
  DocumentDto, 
  UpdateDocumentDto, 
  TaxRateComboDto,
  PartnerComboDto,
  OrganizationalUnitComboDto,
  TaxationMethodComboDto,
  ReferentComboDto,
} from '../../types/api.types';
import { formatDate } from '../../utils';

interface DocumentHeaderProps {
  document: DocumentDto | null;
  onChange?: (updates: Partial<UpdateDocumentDto>) => void;
}

interface AdvanceVATItem {
  taxRateId: string;
  taxRateName: string;
  taxRatePercentage: number;
  amount: number;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ document, onChange }) => {
  const { data: combosData, isLoading: combosLoading } = useAllCombos(document?.documentTypeCode || 'UR');

  const partners = combosData?.partners;
  const organizationalUnits = combosData?.orgUnits;
  const taxationMethods = combosData?.taxationMethods;
  const referents = combosData?.referents;
  const referenceDocuments = combosData?.documentsND;
  const taxRates = combosData?.taxRates;

  const [advanceVATItems, setAdvanceVATItems] = React.useState<AdvanceVATItem[]>([]);

  const handleFieldChange = (field: keyof UpdateDocumentDto, value: any) => {
    if (onChange) {
      onChange({ [field]: value });
    }
  };

  const handleAddAdvanceVAT = () => {
    if (taxRates && taxRates.length > 0) {
      const firstRate = taxRates[0];
      setAdvanceVATItems([...advanceVATItems, {
        taxRateId: firstRate.id,
        taxRateName: firstRate.name,
        taxRatePercentage: firstRate.percentage,
        amount: 0,
      }]);
    }
  };

  const handleRemoveAdvanceVAT = (index: number) => {
    setAdvanceVATItems(advanceVATItems.filter((_, i) => i !== index));
  };

  const handleAdvanceVATChange = (index: number, field: keyof AdvanceVATItem, value: any) => {
    const updated = [...advanceVATItems];
    updated[index] = { ...updated[index], [field]: value };
    setAdvanceVATItems(updated);
  };

  if (!document) {
    return (
      <Box>
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold" mb={3}>
        Zaglavlje Dokumenta
      </Typography>

      <Grid container spacing={3}>
        {/* Red 1: Dobavljač i Magacin */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={partners || []}
            getOptionLabel={(option) => `${option.code} - ${option.name} (${option.city})`}
            loading={combosLoading}
            value={partners?.find((p: PartnerComboDto) => p.id === document.partnerId) || null}
            onChange={(_, value) => handleFieldChange('partnerId', value?.id || null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Dobavljač (Partner)"
                placeholder="Pretražite po šifri ili nazivu"
                helperText="spPartnerComboStatusNabavka"
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2">
                    <strong>{option.code}</strong> - {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.city} • {option.statusName}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={organizationalUnits || []}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            loading={combosLoading}
            value={organizationalUnits?.find((ou: OrganizationalUnitComboDto) => ou.id === document.organizationalUnitId) || null}
            onChange={(_, value) => handleFieldChange('organizationalUnitId', value?.id || 0)}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Magacin (Org. Jedinica)"
                placeholder="Izaberite magacin"
                helperText="spOrganizacionaJedinicaCombo"
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2">
                    <strong>{option.code}</strong> - {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.city}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </Grid>

        {/* Red 2: Oporezivanje i Referent */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={taxationMethods || []}
            getOptionLabel={(option) => option.description}
            loading={combosLoading}
            value={taxationMethods?.find((tm: TaxationMethodComboDto) => tm.id === document.taxationMethodId) || null}
            onChange={(_, value) => handleFieldChange('taxationMethodId', value?.id || null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Način Oporezivanja"
                placeholder="Izaberite način oporezivanja"
                helperText="spNacinOporezivanjaComboNabavka"
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2">{option.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Akciza: {option.calculateExcise ? 'Da' : 'Ne'} • Porez:
                    {option.calculateTax ? 'Da' : 'Ne'}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={referents || []}
            getOptionLabel={(option) => `${option.code} - ${option.fullName}`}
            loading={combosLoading}
            value={referents?.find((r: ReferentComboDto) => r.id === document.referentId) || null}
            onChange={(_, value) => handleFieldChange('referentId', value?.id || null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Referent"
                placeholder="Izaberite referenta"
                helperText="spReferentCombo"
              />
            )}
          />
        </Grid>

        {/* Red 3: Broj i Datum */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Broj Dokumenta"
            value={document.documentNumber}
            onChange={(e) => handleFieldChange('documentNumber', e.target.value)}
            placeholder="npr. UR-2025-001"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Datum"
            type="date"
            value={document.date.split('T')[0]}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Red 4: Narudžbenica i Valuta */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={referenceDocuments || []}
            getOptionLabel={(option) =>
              `${option.documentNumber} - ${option.partnerName} (${formatDate(option.date)})`
            }
            loading={combosLoading}
            value={null} // TODO: Povezati sa backend poljem
            onChange={(_, value) => {
              // TODO: Implementirati kada backend podrži
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Narudžbenica"
                placeholder="Izaberite narudžbenicu"
                helperText="spDokumentNDCombo"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Valuta"
            value={document.currencyId || 'RSD'}
            onChange={(e) => handleFieldChange('currencyId', parseInt(e.target.value) || null)}
            helperText="spValutaCombo - TODO: Implementirati combo"
            disabled
          />
        </Grid>

        {/* Red 5: Datum dospeća i Datum valute */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Datum Dospeća"
            type="date"
            value={document.dueDate ? document.dueDate.split('T')[0] : ''}
            onChange={(e) => handleFieldChange('dueDate', e.target.value || null)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Datum Valute"
            type="date"
            value={document.currencyDate ? document.currencyDate.split('T')[0] : ''}
            onChange={(e) => handleFieldChange('currencyDate', e.target.value || null)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Red 6: Broj partnera i Datum partnera */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Broj Računa Partnera"
            value={document.partnerDocumentNumber || ''}
            onChange={(e) => handleFieldChange('partnerDocumentNumber', e.target.value || null)}
            placeholder="Unesite broj računa dobavljača"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Datum Računa Partnera"
            type="date"
            value={document.partnerDocumentDate ? document.partnerDocumentDate.split('T')[0] : ''}
            onChange={(e) => handleFieldChange('partnerDocumentDate', e.target.value || null)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Red 7: Kurs */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Kurs"
            type="number"
            value={document.exchangeRate || ''}
            onChange={(e) => handleFieldChange('exchangeRate', parseFloat(e.target.value) || null)}
            inputProps={{ step: 0.0001, min: 0 }}
            helperText="Kurs valute prema RSD"
          />
        </Grid>

        {/* Red 8: Napomena */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Napomena"
            multiline
            rows={3}
            value={document.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value || null)}
            placeholder="Dodatne napomene o dokumentu..."
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Avans PDV (tblDokumentAvansPDV) */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" fontWeight="bold">
            Avans PDV ({advanceVATItems.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Poreske tarife u avansu (tblDokumentAvansPDV + spPoreskaStopaCombo)
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Poreska Stopa</TableCell>
                    <TableCell align="right">Procenat (%)</TableCell>
                    <TableCell align="right">Iznos PDV-a</TableCell>
                    <TableCell align="center" width={80}>Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advanceVATItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>
                          Nema stavki. Kliknite "Dodaj" da dodate poresku stopu.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    advanceVATItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            options={taxRates || []}
                            getOptionLabel={(option) => `${option.id} - ${option.name}`}
                            value={taxRates?.find((tr: TaxRateComboDto) => tr.id === item.taxRateId) || null}
                            onChange={(_, value) => {
                              if (value) {
                                handleAdvanceVATChange(index, 'taxRateId', value.id);
                                handleAdvanceVATChange(index, 'taxRateName', value.name);
                                handleAdvanceVATChange(index, 'taxRatePercentage', value.percentage);
                              }
                            }}
                            renderInput={(params) => <TextField {...params} placeholder="Izaberite" />}
                            sx={{ minWidth: 200 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography>{item.taxRatePercentage}%</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={item.amount}
                            onChange={(e) =>
                              handleAdvanceVATChange(index, 'amount', parseFloat(e.target.value) || 0)
                            }
                            inputProps={{ step: 0.01, min: 0 }}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleRemoveAdvanceVAT(index)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Button
              startIcon={<Add />}
              onClick={handleAddAdvanceVAT}
              sx={{ mt: 2 }}
              variant="outlined"
              disabled={!taxRates || taxRates.length === 0}
            >
              Dodaj Poresku Stopu
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
