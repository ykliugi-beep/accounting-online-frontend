import React, { useState, useEffect } from 'react';
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

/**
 * ⚠️ CRITICAL: Transform date string to ISO DateTime format
 * HTML input type="date" returns "YYYY-MM-DD"
 * Backend .NET expects "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DDTHH:mm:ss.sssZ"
 * 
 * Without this transformation, backend validation fails with:
 * "DocumentDate mora biti validan datum"
 * 
 * Maps to SQL Server datetime columns in tblDokument:
 * - date → Datum (datetime NOT NULL)
 * - dueDate → DatumDPO (datetime NULL)
 * - currencyDate → DatumValute (datetime NULL)
 * - partnerDocumentDate → PartnerDatumDokumenta (datetime NULL)
 */
function toISODateTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
  
  // If already in ISO format with time, return as-is
  if (dateStr.includes('T')) {
    return dateStr;
  }
  
  // Transform "YYYY-MM-DD" to "YYYY-MM-DDTHH:mm:ss"
  return `${dateStr}T00:00:00`;
}

export const DocumentCreatePage: React.FC<DocumentCreatePageProps> = ({ docType }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Use docType prop or default to 'UR'
  const defaultDocType = docType || 'UR';
  const { data: combosData, isLoading: combosLoading, error: combosError } = useAllCombos(defaultDocType);

  const partners = combosData?.partners;
  const organizationalUnits = combosData?.orgUnits;
  const taxationMethods = combosData?.taxationMethods;
  const referents = combosData?.referents;

  const [formData, setFormData] = useState<CreateDocumentDto>({
    documentTypeCode: defaultDocType,
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
    mutationFn: (data: CreateDocumentDto) => {
      // ✅ TRANSFORM DATES TO ISO FORMAT BEFORE SENDING
      const payload: CreateDocumentDto = {
        ...data,
        date: toISODateTime(data.date) || data.date,  // Required, so never null
        dueDate: toISODateTime(data.dueDate),
        currencyDate: toISODateTime(data.currencyDate),
        partnerDocumentDate: toISODateTime(data.partnerDocumentDate),
      };

      console.log('📦 Sending payload with transformed dates:', payload);
      console.log('📅 Transformed dates:');
      console.log('  • date:', payload.date);
      console.log('  • dueDate:', payload.dueDate);
      console.log('  • currencyDate:', payload.currencyDate);
      console.log('  • partnerDocumentDate:', payload.partnerDocumentDate);
      
      return api.document.create(payload);
    },
    onSuccess: (newDocument) => {
      console.log('✅ Document Created:', newDocument);
      navigate(`/documents/${newDocument.id}`);
    },
    onError: (err: any) => {
      console.error('❌ API ERROR:', err);
      
      // Build user-friendly error message
      let errorMsg = 'Greška pri kreiranju dokumenta';
      if (err?.errors && Object.keys(err.errors).length > 0) {
        const errorDetails = Object.entries(err.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        errorMsg = `Prosleđeni podaci nisu prošli validaciju:\n${errorDetails}`;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
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
    if (!formData.organizationalUnitId || formData.organizationalUnitId === 0) {
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
        <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {combosError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Greška pri učitavanju podataka: {(combosError as any)?.message || 'Nepoznata greška'}
        </Alert>
      )}

      {combosLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            Učitavam dropdown podatke sa servera...
          </Box>
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Row 1: Document Type + Document Number */}
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
                placeholder="npr. T001/25"
              />
            </Grid>

            {/* Row 2: Date + Due Date */}
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
              <TextField
                fullWidth
                label="Datum Dospeća"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value || null)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Row 3: Partner + Partner Document Number */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={partners || []}
                getOptionLabel={(option) => {
                  const code = option.sifraPartner ?? option.code ?? 'N/A';
                  const name = option.nazivPartnera ?? option.name ?? '';
                  const city = option.mesto ?? option.city;
                  return `${code} - ${name}${city ? ` (${city})` : ''}`;
                }}
                loading={combosLoading}
                value={
                  partners?.find(
                    (p: PartnerComboDto) => (p.idPartner ?? p.id) === formData.partnerId
                  ) || null
                }
                onChange={(_, value) => {
                  const id = value ? (value.idPartner ?? value.id) : null;
                  handleChange('partnerId', id);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Partner (Dobavljač)" 
                    placeholder="Izaberite partnera"
                    helperText={partners ? `${partners.length} partnera učitano` : 'Učitavam...'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Broj Dokumenta Partnera"
                value={formData.partnerDocumentNumber || ''}
                onChange={(e) => handleChange('partnerDocumentNumber', e.target.value || null)}
                placeholder="Broj fakture dobavljača"
              />
            </Grid>

            {/* Row 4: Partner Document Date + Currency Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Datum Dokumenta Partnera"
                type="date"
                value={formData.partnerDocumentDate || ''}
                onChange={(e) => handleChange('partnerDocumentDate', e.target.value || null)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Datum Valute"
                type="date"
                value={formData.currencyDate || ''}
                onChange={(e) => handleChange('currencyDate', e.target.value || null)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Row 5: Organizational Unit + Referent */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={organizationalUnits || []}
                getOptionLabel={(option) => {
                  const code = option.sifra ?? option.code ?? 'N/A';
                  const name = option.naziv ?? option.name ?? '';
                  return `${code} - ${name}`;
                }}
                loading={combosLoading}
                value={
                  organizationalUnits?.find(
                    (ou: OrganizationalUnitComboDto) =>
                      (ou.idOrganizacionaJedinica ?? ou.id) === formData.organizationalUnitId
                  ) || null
                }
                onChange={(_, value) => {
                  const id = value ? (value.idOrganizacionaJedinica ?? value.id ?? 0) : 0;
                  handleChange('organizationalUnitId', id);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params} 
                    required 
                    label="Magacin" 
                    placeholder="Izaberite magacin"
                    helperText={organizationalUnits ? `${organizationalUnits.length} magacina učitano` : 'Učitavam...'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={referents || []}
                getOptionLabel={(option) => {
                  const code = option.sifraRadnika ?? option.code ?? 'N/A';
                  const name = option.imePrezime ?? option.fullName ?? '';
                  return `${code} - ${name}`;
                }}
                loading={combosLoading}
                value={
                  referents?.find(
                    (r: ReferentComboDto) => (r.idRadnik ?? r.id) === formData.referentId
                  ) || null
                }
                onChange={(_, value) => {
                  const id = value ? (value.idRadnik ?? value.id) : null;
                  handleChange('referentId', id);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Referent" 
                    placeholder="Izaberite referenta"
                    helperText={referents ? `${referents.length} referenata učitano` : 'Učitavam...'}
                  />
                )}
              />
            </Grid>

            {/* Row 6: Taxation Method */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={taxationMethods || []}
                getOptionLabel={(option) => option.opis ?? option.description}
                loading={combosLoading}
                value={
                  taxationMethods?.find(
                    (tm: TaxationMethodComboDto) =>
                      (tm.idNacinOporezivanja ?? tm.id) === formData.taxationMethodId
                  ) || null
                }
                onChange={(_, value) => {
                  const id = value ? (value.idNacinOporezivanja ?? value.id) : null;
                  handleChange('taxationMethodId', id);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Način Oporezivanja" 
                    placeholder="Izaberite"
                    helperText={taxationMethods ? `${taxationMethods.length} metoda učitano` : 'Učitavam...'}
                  />
                )}
              />
            </Grid>

            {/* Row 7: Notes (full width) */}
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
              disabled={createMutation.isPending || combosLoading}
            >
              {createMutation.isPending ? 'Sačuvavam...' : 'Sačuvaj i Nastavi'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
