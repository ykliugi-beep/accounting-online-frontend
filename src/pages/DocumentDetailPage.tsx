import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useDocumentStore } from '../store';
import StavkeDokumentaTable, { Stavka } from '../components/Document/StavkeDokumentaTable';
import TroskoviTable, { Trosak } from '../components/Document/TroskoviTable';
import { useCostTypes } from '../hooks/useCombos';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const documentId = Number(id);

  const [activeTab, setActiveTab] = useState(0);
  const { setItems } = useDocumentStore();
  const [stavke, setStavke] = useState<Stavka[]>([]);
  const [troskovi, setTroskovi] = useState<Trosak[]>([]);

  const { data: costTypesData = [] } = useCostTypes();

  const { data: document, isLoading } = useQuery<DocumentDto | undefined>({
    queryKey: ['document', documentId],
    queryFn: async () => api.document.get(documentId),
    enabled: !!documentId,
  });

  const { data: documentItems = [] } = useQuery({
    queryKey: ['document', documentId, 'items'],
    queryFn: async () => api.lineItem.list(documentId),
    enabled: !!documentId,
  });

  const { data: documentCosts = [] } = useQuery({
    queryKey: ['document', documentId, 'costs'],
    queryFn: async () => api.cost.list(documentId),
    enabled: !!documentId,
  });

  useEffect(() => {
    setItems(documentItems);
  }, [documentItems, setItems]);

  const mappedStavke = useMemo<Stavka[]>(
    () =>
      documentItems.map((item) => ({
        id: item.id,
        idArtikal: item.articleId,
        nazivArtikal: item.articleName,
        jedinicaMere: item.unitOfMeasure,
        kolicina: item.quantity,
        jedinicnaCena: item.invoicePrice,
        iznos: item.totalAmount,
      })),
    [documentItems]
  );

  const mappedTroskovi = useMemo<Trosak[]>(
    () =>
      documentCosts.flatMap((cost) =>
        cost.items?.map((item) => ({
          id: item.id,
          idVrstaTroska: item.costTypeId,
          nazivVrstaTroska: item.costTypeName,
          opis: cost.description || '',
          iznos: item.amount,
          nacin: item.distributionMethodId || 3,
        })) || []
      ),
    [documentCosts]
  );

  useEffect(() => {
    setStavke(mappedStavke);
  }, [mappedStavke]);

  useEffect(() => {
    setTroskovi(mappedTroskovi);
  }, [mappedTroskovi]);

  const handleBack = () => {
    navigate('/documents');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddStavka = () => {
    const newStavka: Stavka = {
      idArtikal: 0,
      nazivArtikal: '',
      jedinicaMere: '',
      kolicina: 0,
      jedinicnaCena: 0,
      iznos: 0,
    };
    setStavke((prev) => [...prev, newStavka]);
  };

  const handleDeleteStavka = (index: number) => {
    setStavke((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateStavka = (index: number, updated: Stavka) => {
    setStavke((prev) => prev.map((stavka, i) => (i === index ? updated : stavka)));
  };

  const handleAddTrosak = () => {
    const newTrosak: Trosak = {
      idVrstaTroska: 0,
      nazivVrstaTroska: '',
      opis: '',
      iznos: 0,
      nacin: 3,
    };
    setTroskovi((prev) => [...prev, newTrosak]);
  };

  const handleDeleteTrosak = (index: number) => {
    setTroskovi((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTrosak = (index: number, updated: Trosak) => {
    setTroskovi((prev) => prev.map((trosak, i) => (i === index ? updated : trosak)));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!document) {
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">
          Dokument nije pronađen
        </Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Nazad na listu
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Nazad
        </Button>
        <Typography variant="h4">
          Dokument: {document.documentNumber}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Zaglavlje" />
          <Tab label="Stavke" />
          <Tab label="Zavisni Troškovi" />
        </Tabs>
      </Paper>

      <Box>
        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Zaglavlje dokumenta
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={2}>
              <Box>
                <Typography variant="subtitle2">Broj dokumenta</Typography>
                <Typography>{document.documentNumber}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Vrsta</Typography>
                <Typography>{document.documentTypeCode}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Datum</Typography>
                <Typography>{new Date(document.date).toLocaleDateString()}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Partner</Typography>
                <Typography>{document.partnerName || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Magacin</Typography>
                <Typography>{document.organizationalUnitName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Status</Typography>
                <Typography>{document.statusId ?? 'N/A'}</Typography>
              </Box>
            </Box>
          </Paper>
        )}
        {activeTab === 1 && (
          <StavkeDokumentaTable
            stavke={stavke}
            onAddRow={handleAddStavka}
            onDeleteRow={handleDeleteStavka}
            onUpdateRow={handleUpdateStavka}
            artikli={[]}
          />
        )}
        {activeTab === 2 && (
          <TroskoviTable
            troskovi={troskovi}
            stavke={stavke}
            onAddRow={handleAddTrosak}
            onDeleteRow={handleDeleteTrosak}
            onUpdateRow={handleUpdateTrosak}
            costTypes={costTypesData}
          />
        )}
      </Box>
    </Box>
  );
};

export default DocumentDetailPage;
