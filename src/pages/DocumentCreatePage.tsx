import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { useAllCombos } from '../hooks/useCombos';
import type { 
  CreateDocumentDto,
  PartnerComboDto,
  OrganizationalUnitComboDto,
  ReferentComboDto,
  TaxationMethodComboDto,
} from '../types/api.types';

const DOCUMENT_TYPES = [
  { code: 'UR', label: 'Ulazna Kalkulacija VP' },
  { code: 'RO', label: 'Račun Otpremnica' },
  { code: 'FO', label: 'Finansijsko Odobrenje' },
  { code: 'AR', label: 'Avansni Račun' },
];

// Props interface for route-based document type
interface DocumentCreatePageProps {
  docType?: string;
}

export const DocumentCreatePage: React.FC<DocumentCreatePageProps> = ({ docType }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Use docType prop or default to 'UR'
  const defaultDocType = docType || 'UR';
  const { data: combosData, isLoading: combosLoading } = useAllCombos(defaultDocType);

  const partners = combosData?.partners;
  const organizationalUnits = combosData?.orgUnits;
  const taxationMethods = combosData?.taxationMethods;
  const referents = combosData?.referents;

  const [formData, setFormData] = useState<CreateDocumentDto>({
    documentTypeCode: defaultDocType,  // Use prop or default
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    partnerId: null,
    organizationalUnitId: 0,
    referentId: null,
    dueDate: null,
    currencyDate: null,
    partnerDocumentNumber: null,
    partnerDocumentDate: null,
    taxationMethodId: null,
    statusId: 1, // Draft
    currencyId: null,
    exchangeRate: null,
    notes: null,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDocumentDto) => api.document.create(data),
    onSuccess: (newDocument) => {
      navigate(`/documents/${newDocument.id}`);
    },
    onError: (err: any) => {
      setError(err?.message || 'Greška pri kreiranju dokumenta');
    },
  });

  const handleChange = (field: keyof CreateDocumentDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validacija
    if (!formData.documentNumber) {
      setError('Broj dokumenta je obavezan');
      return;
    }
    if (!formData.organizationalUnitId) {
      setError('Magacin je obavezan');
      return;
    }
    
    createMutation.mutate(formData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Get document type label
  const docTypeLabel = DOCUMENT_TYPES.find(t => t.code === defaultDocType)?.label || 'Novi Dokument';

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={handleCancel} sx={{ mr: 2 }}>
          Nazad
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {docTypeLabel}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Unesite osnovne podatke za novi dokument
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="Tip Dokumenta"
                value={formData.documentTypeCode}
                onChange={(e) => handleChange('documentTypeCode', e.target.value)}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <MenuItem key={type.code} value={type.code}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Broj Dokumenta"
                value={formData.documentNumber}
                onChange={(e) => handleChange('documentNumber', e.target.value)}
                placeholder="npr. UR-2025-001"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Datum"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={partners || []}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                loading={combosLoading}
                value={partners?.find((p: PartnerComboDto) => p.id === formData.partnerId) || null}
                onChange={(_, value) => handleChange('partnerId', value?.id || null)}
                renderInput={(params) => (
                  <TextField {...params} label="Partner (Dobavljač)" placeholder="Izaberite partnera" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={organizationalUnits || []}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                loading={combosLoading}
                value={
                  organizationalUnits?.find((ou: OrganizationalUnitComboDto) => ou.id === formData.organizationalUnitId) || null
                }
                onChange={(_, value) =>
                  handleChange('organizationalUnitId', value?.id || 0)
                }
                renderInput={(params) => (
                  <TextField {...params} required label="Magacin" placeholder="Izaberite magacin" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={referents || []}
                getOptionLabel={(option) => `${option.code} - ${option.fullName}`}
                loading={combosLoading}
                value={referents?.find((r: ReferentComboDto) => r.id === formData.referentId) || null}
                onChange={(_, value) => handleChange('referentId', value?.id || null)}
                renderInput={(params) => (
                  <TextField {...params} label="Referent" placeholder="Izaberite referenta" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={taxationMethods || []}
                getOptionLabel={(option) => option.description}
                loading={combosLoading}
                value={
                  taxationMethods?.find((tm: TaxationMethodComboDto) => tm.id === formData.taxationMethodId) || null
                }
                onChange={(_, value) => handleChange('taxationMethodId', value?.id || null)}
                renderInput={(params) => (
                  <TextField {...params} label="Način Oporezivanja" placeholder="Izaberite" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Datum Dospeća"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value || null)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Napomena"
                multiline
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value || null)}
                placeholder="Dodatne napomene..."
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button variant="outlined" onClick={handleCancel} disabled={createMutation.isPending}>
              Odustani
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                createMutation.isPending ? <CircularProgress size={20} /> : <Save />
              }
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Sačuvavam...' : 'Sačuvaj i Nastavi'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
