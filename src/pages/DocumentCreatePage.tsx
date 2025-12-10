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
  Divider,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { useAllCombos } from '../hooks/useCombos';
import { usePartnerAutocomplete, formatPartnerLabel } from '../hooks/usePartnerAutocomplete';
import TabsComponent from '../components/Document/TabsComponent';
import StavkeDokumentaTable from '../components/Document/StavkeDokumentaTable';
import TroskoviTable from '../components/Document/TroskoviTable';
import type { 
  CreateDocumentDto,
  PartnerComboDto,
  OrganizationalUnitComboDto,
  ReferentComboDto,
  TaxationMethodComboDto,
} from '../types/api.types';
import type { TabConfig } from '../components/Document/TabsComponent';
import type { Stavka } from '../components/Document/StavkeDokumentaTable';
import type { Trosak } from '../components/Document/TroskoviTable';

const DOCUMENT_TYPES = [
  { code: 'UR', label: 'Ulazna Kalkulacija VP' },
  { code: 'RO', label: 'Račun Otpremnica' },
  { code: 'FO', label: 'Finansijsko Odobrenje' },
  { code: 'AR', label: 'Avansni Račun' },
];

const STATUS_OPTIONS = [
  { value: 'Otvorena', label: 'Otvorena' },
  { value: 'Pauzirana', label: 'Pauzirana' },
  { value: 'Završena', label: 'Završena' },
];

const TAXATION_OPTIONS = [
  { value: 'PDV na uvozu', label: 'PDV na uvozu' },
  { value: 'PDV na nabavci', label: 'PDV na nabavci' },
  { value: 'Bez PDV-a', label: 'Bez PDV-a' },
];

const CURRENCY_OPTIONS = [
  { value: 'RSD', label: 'RSD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
];

// Props interface for route-based document type
interface DocumentCreatePageProps {
  docType?: string;
}

/**
 * ⚠️ CRITICAL: Transform date string to ISO DateTime format
 */
function toISODateTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
  if (dateStr.includes('T')) {
    return dateStr;
  }
  return `${dateStr}T00:00:00`;
}

export const DocumentCreatePage: React.FC<DocumentCreatePageProps> = ({ docType }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Use docType prop or default to 'UR'
  const defaultDocType = docType || 'UR';
  const { data: combosData, isLoading: combosLoading, error: combosError } = useAllCombos(defaultDocType);

  // 🚀 Partner autocomplete with search
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<PartnerComboDto | null>(null);
  const { 
    partners, 
    isLoading: partnersLoading, 
    isEmpty,
    needsMoreChars 
  } = usePartnerAutocomplete(partnerSearchTerm);

  const organizationalUnits = combosData?.orgUnits;
  const taxationMethods = combosData?.taxationMethods;
  const referents = combosData?.referents;
  const artikli = combosData?.artikli || [];
  const costTypes = combosData?.costTypes || [];

  // ✅ Stavke state
  const [stavke, setStavke] = useState<Stavka[]>([]);

  // ✅ Troškovi state
  const [troskovi, setTroskovi] = useState<Trosak[]>([]);

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
        date: toISODateTime(data.date) || data.date,
        dueDate: toISODateTime(data.dueDate),
        currencyDate: toISODateTime(data.currencyDate),
        partnerDocumentDate: toISODateTime(data.partnerDocumentDate),
      };

      console.log('📦 Sending payload:', payload);
      return api.document.create(payload);
    },
    onSuccess: (newDocument) => {
      console.log('✅ Document Created:', newDocument);
      navigate(`/documents/${newDocument.id}`);
    },
    onError: (err: any) => {
      console.error('❌ API ERROR:', err);
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

  // ✅ STAVKE HANDLERS
  const handleAddStavka = () => {
    const newStavka: Stavka = {
      idArtikal: 0,
      nazivArtikal: '',
      jedinicaMere: '',
      kolicina: 0,
      jedinicnaCena: 0,
      iznos: 0,
    };
    setStavke([...stavke, newStavka]);
  };

  const handleDeleteStavka = (index: number) => {
    setStavke(stavke.filter((_, i) => i !== index));
  };

  const handleUpdateStavka = (index: number, stavka: Stavka) => {
    const updated = [...stavke];
    updated[index] = stavka;
    setStavke(updated);
  };

  // ✅ TROSKOVI HANDLERS
  const handleAddTrosak = () => {
    const newTrosak: Trosak = {
      idVrstaTroska: 0,
      nazivVrstaTroska: '',
      opis: '',
      iznos: 0,
      nacin: 1, // Po količini
    };
    setTroskovi([...troskovi, newTrosak]);
  };

  const handleDeleteTrosak = (index: number) => {
    setTroskovi(troskovi.filter((_, i) => i !== index));
  };

  const handleUpdateTrosak = (index: number, trosak: Trosak) => {
    const updated = [...troskovi];
    updated[index] = trosak;
    setTroskovi(updated);
  };

  // ✅ ZAGLAVLJE SEKCIJA - Tab 1 Content sa pravilnom strukturom po specifikaciji
  const HeaderSection = () => (
    <Box sx={{ p: 3 }}>
      {/* OSNOVNA POLJA DOKUMENTA */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', pb: 1, borderLeft: '3px solid #1976d2', pl: 2 }}>
        OSNOVNA POLJA DOKUMENTA
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Broj dokumenta"
            value={formData.documentNumber}
            onChange={(e) => handleChange('documentNumber', e.target.value)}
            placeholder="npr. DOK-001"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Datum dokumenta"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.date || 'Otvorena'}
            onChange={(e) => handleChange('date', e.target.value)}
            size="small"
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* DOBAVLJAČ I MAGACIN */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', pb: 1, borderLeft: '3px solid #1976d2', pl: 2 }}>
        DOBAVLJAČ I MAGACIN
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={partners}
            getOptionLabel={formatPartnerLabel}
            loading={partnersLoading}
            value={selectedPartner}
            onChange={(_, value) => {
              setSelectedPartner(value);
              const id = value ? (value.idPartner ?? value.id) : null;
              handleChange('partnerId', id);
            }}
            onInputChange={(_, newValue) => {
              setPartnerSearchTerm(newValue);
            }}
            inputValue={partnerSearchTerm}
            noOptionsText={
              needsMoreChars
                ? 'Unesite bar 2 karaktera za pretragu'
                : isEmpty
                ? 'Nema rezultata'
                : 'Počnite kucati za pretragu...'
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Dobavljač" 
                placeholder="-- Izaberite dobavljača --"
                size="small"
              />
            )}
            slotProps={{
              paper: {
                sx: { fontSize: '0.875rem' }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={organizationalUnits || []}
            getOptionLabel={(option) => {
              const name = option.naziv ?? option.name ?? '';
              return name;
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
                size="small"
              />
            )}
            slotProps={{
              paper: {
                sx: { fontSize: '0.875rem' }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={referents || []}
            getOptionLabel={(option) => {
              const name = option.imePrezime ?? option.fullName ?? '';
              return name;
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
                size="small"
              />
            )}
            slotProps={{
              paper: {
                sx: { fontSize: '0.875rem' }
              }
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* FINANSIJSKI PARAMETRI */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', pb: 1, borderLeft: '3px solid #1976d2', pl: 2 }}>
        FINANSIJSKI PARAMETRI
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Valuta"
            value={formData.currencyId || 'RSD'}
            onChange={(e) => handleChange('currencyId', e.target.value)}
            size="small"
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Oporezivanje"
            value={formData.taxationMethodId || 'PDV na nabavci'}
            onChange={(e) => handleChange('taxationMethodId', e.target.value)}
            size="small"
          >
            {TAXATION_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Narudžbenica (Ref.)"
            value={formData.partnerDocumentNumber || ''}
            onChange={(e) => handleChange('partnerDocumentNumber', e.target.value || null)}
            placeholder="npr. NAR-2024-001"
            size="small"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* DODATNE NAPOMENE */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', pb: 1, borderLeft: '3px solid #1976d2', pl: 2 }}>
        DODATNE NAPOMENE
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Napomena"
            multiline
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value || null)}
            placeholder="Unesite sve relevantne napomene..."
            size="small"
          />
        </Grid>
      </Grid>
    </Box>
  );

  // ✅ TABS CONFIGURATION
  const tabs: TabConfig[] = [
    {
      id: 'zaglavlje',
      label: 'Zaglavlje Dokumenta',
      content: <HeaderSection />,
    },
    {
      id: 'stavke',
      label: 'Stavke Dokumenta',
      content: (
        <Box sx={{ p: 3 }}>
          <StavkeDokumentaTable 
            stavke={stavke}
            onAddRow={handleAddStavka}
            onDeleteRow={handleDeleteStavka}
            onUpdateRow={handleUpdateStavka}
            artikli={artikli}
          />
        </Box>
      ),
    },
    {
      id: 'troskovi',
      label: 'Zavisni Troškovi',
      content: (
        <Box sx={{ p: 3 }}>
          <TroskoviTable 
            troskovi={troskovi}
            stavke={stavke}
            onAddRow={handleAddTrosak}
            onDeleteRow={handleDeleteTrosak}
            onUpdateRow={handleUpdateTrosak}
            costTypes={costTypes}
          />
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={handleCancel} sx={{ mr: 2 }}>
          ← Nazad
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {docTypeLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unesite osnovne podatke za novi dokument
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!!combosError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Greška pri učitavanju podataka:{' '}
          {String((combosError as Error)?.message || 'Nepoznata greška')}
        </Alert>
      )}

      {combosLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            Učitavam podatke sa servera...
          </Box>
        </Alert>
      )}

      {/* ✅ TABS KOMPONENTA */}
      <Paper>
        <TabsComponent tabs={tabs} defaultTab="zaglavlje" />

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ p: 2, borderTop: '1px solid #eee', backgroundColor: '#f5f5f5' }}>
          <Button variant="outlined" onClick={handleCancel} disabled={createMutation.isPending}>
            Odustani
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            startIcon={
              createMutation.isPending ? <CircularProgress size={20} /> : <Save />
            }
            disabled={createMutation.isPending || combosLoading}
          >
            {createMutation.isPending ? 'Sačuvavam...' : 'Sačuvaj i Nastavi'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DocumentCreatePage;