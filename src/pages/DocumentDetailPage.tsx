import React, { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { DocumentForm } from '../components/Document/DocumentForm';
import { useDocumentStore, useUIStore } from '../store';

const DocumentDetailPage: React.FC = () => {
  const documentId = 1;

  const {
    currentDocument,
    items,
    costs,
    setCurrentDocument,
    updateDocument,
    setCosts,
    addCost,
    updateCost,
    deleteCost,
  } = useDocumentStore((state) => ({
    currentDocument: state.currentDocument,
    items: state.items,
    costs: state.costs,
    setCurrentDocument: state.setCurrentDocument,
    updateDocument: state.updateDocument,
    setCosts: state.setCosts,
    addCost: state.addCost,
    updateCost: state.updateCost,
    deleteCost: state.deleteCost,
  }));

  const { isLoading, setLoading } = useUIStore((state) => ({
    isLoading: state.isLoading,
    setLoading: state.setLoading,
  }));

  const hasCosts = costs.length > 0;

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      setCurrentDocument({
        id: documentId,
        documentNumber: 'PR-2025/0001',
        documentDate: new Date().toISOString().slice(0, 10),
        partnerName: 'Partner d.o.o.',
        status: 'Draft',
        currency: 'RSD',
        totalAmount: 0,
        notes: 'Automatski kreiran primer dokumenta.',
      });

      if (!hasCosts) {
        setCosts([
          { id: 1, description: 'Transport', amount: 0, method: 'Proporcionalno' },
        ]);
      }
      setLoading(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [documentId, hasCosts, setCosts, setCurrentDocument, setLoading]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Detalji dokumenta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Draft forma spremna za autosave i 409 handling.
          </Typography>
        </div>
      </Box>

      <DocumentForm
        documentId={documentId}
        document={currentDocument}
        items={items}
        costs={costs}
        isLoading={isLoading}
        onDocumentChange={updateDocument}
        onAddCost={addCost}
        onUpdateCost={updateCost}
        onDeleteCost={deleteCost}
      />
    </Container>
  );
};

export default DocumentDetailPage;
