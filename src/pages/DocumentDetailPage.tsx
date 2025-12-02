import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { DocumentHeader } from '../components/Document/DocumentHeader';
import { DocumentItemsTable } from '../components/Document/DocumentItemsTable';
import { DocumentCostsTable } from '../components/Document/DocumentCostsTable';
import { api } from '../api';
import { useDocumentStore } from '../store';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const documentId = Number(id);

  const [activeTab, setActiveTab] = useState(0);
  const { setItems } = useDocumentStore();

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => api.document.get(documentId),
    enabled: !!documentId,
  });

  useEffect(() => {
    if (!document) return;

    const loadItems = async () => {
      try {
        const loadedItems = await api.lineItem.list(documentId);
        setItems(loadedItems);
      } catch (err) {
        console.error('Error loading items:', err);
      }
    };

    loadItems();
  }, [document, documentId, setItems]);

  const handleBack = () => {
    navigate('/documents');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
          <DocumentHeader document={document} />
        )}
        {activeTab === 1 && <DocumentItemsTable documentId={documentId} />}
        {activeTab === 2 && <DocumentCostsTable documentId={documentId} />}
      </Box>
    </Box>
  );
};

export default DocumentDetailPage;
