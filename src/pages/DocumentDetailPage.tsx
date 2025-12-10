import React, { useState } from 'react';
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
import type { DocumentDto, DocumentLineItemDto, DocumentCostDto } from '../types/api.types';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const documentId = Number(id);

  const [activeTab, setActiveTab] = useState(0);

  const { data: document, isLoading } = useQuery<DocumentDto | undefined>({
    queryKey: ['document', documentId],
    queryFn: async () => api.document.get(documentId),
    enabled: !!documentId,
  });

  const { data: lineItems, isLoading: itemsLoading } = useQuery<DocumentLineItemDto[]>({
    queryKey: ['document-line-items', documentId],
    queryFn: async () => api.lineItem.list(documentId),
    enabled: !!documentId,
  });

  const { data: costs, isLoading: costsLoading } = useQuery<DocumentCostDto[]>({
    queryKey: ['document-costs', documentId],
    queryFn: async () => api.cost.list(documentId),
    enabled: !!documentId,
  });

  const handleBack = () => {
    navigate('/documents');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderHeaderTab = (doc: DocumentDto) => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Osnovne informacije
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} gap={2}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Broj dokumenta
          </Typography>
          <Typography variant="body1">{doc.documentNumber}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Tip dokumenta
          </Typography>
          <Typography variant="body1">{doc.documentTypeCode}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Datum
          </Typography>
          <Typography variant="body1">{doc.date}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Partner
          </Typography>
          <Typography variant="body1">{doc.partnerName || 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Magacin
          </Typography>
          <Typography variant="body1">{doc.organizationalUnitName}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Referent
          </Typography>
          <Typography variant="body1">{doc.referentName || 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Ukupno (bez PDV)
          </Typography>
          <Typography variant="body1">{doc.totalAmountNet.toFixed(2)}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Ukupno (sa PDV)
          </Typography>
          <Typography variant="body1">{doc.totalAmountGross.toFixed(2)}</Typography>
        </Box>
      </Box>
    </Paper>
  );

  const renderItemsTab = () => (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Stavke dokumenta</Typography>
        {itemsLoading && <CircularProgress size={20} />}
      </Box>

      {!lineItems || lineItems.length === 0 ? (
        <Typography color="text.secondary">Nema stavki za ovaj dokument.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Šifra artikla</TableCell>
              <TableCell>Naziv</TableCell>
              <TableCell align="right">Količina</TableCell>
              <TableCell align="right">Jedinična cena</TableCell>
              <TableCell align="right">Ukupno</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.articleCode}</TableCell>
                <TableCell>{item.articleName}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.invoicePrice.toFixed(2)}</TableCell>
                <TableCell align="right">{item.totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );

  const renderCostsTab = () => (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Zavisni troškovi</Typography>
        {costsLoading && <CircularProgress size={20} />}
      </Box>

      {!costs || costs.length === 0 ? (
        <Typography color="text.secondary">Nema unetih troškova.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Partner</TableCell>
              <TableCell>Dokument</TableCell>
              <TableCell>Dospeće</TableCell>
              <TableCell align="right">Iznos bez PDV</TableCell>
              <TableCell align="right">Iznos PDV</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costs.map((cost) => (
              <TableRow key={cost.id} hover>
                <TableCell>{cost.partnerName}</TableCell>
                <TableCell>
                  {cost.documentTypeCode} - {cost.documentNumber}
                </TableCell>
                <TableCell>{cost.dueDate}</TableCell>
                <TableCell align="right">{cost.totalAmountNet.toFixed(2)}</TableCell>
                <TableCell align="right">{cost.totalAmountVat.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );

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
        {activeTab === 0 && renderHeaderTab(document)}
        {activeTab === 1 && renderItemsTab()}
        {activeTab === 2 && renderCostsTab()}
      </Box>
    </Box>
  );
};

export default DocumentDetailPage;
