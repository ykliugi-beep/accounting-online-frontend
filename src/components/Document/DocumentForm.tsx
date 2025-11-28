import React, { useMemo, useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography, Divider, Skeleton } from '@mui/material';
import type {
  DependentCost,
  DocumentDetails,
  DocumentLineItem,
} from '../../types';
import { DocumentItemsTable } from '../DocumentItemsTable';
import { DocumentHeader } from './DocumentHeader';
import { DocumentCostsTable } from './DocumentCostsTable';

export interface DocumentFormProps {
  documentId: number;
  document: DocumentDetails | null;
  items: DocumentLineItem[];
  costs: DependentCost[];
  isLoading: boolean;
  onDocumentChange?: (updates: Partial<DocumentDetails>) => void;
  onAddCost: (cost: DependentCost) => void;
  onUpdateCost: (id: number, updates: Partial<DependentCost>) => void;
  onDeleteCost: (id: number) => void;
}

type DocumentTab = 'header' | 'items' | 'costs';

export const DocumentForm: React.FC<DocumentFormProps> = ({
  documentId,
  document,
  items,
  costs,
  isLoading,
  onDocumentChange,
  onAddCost,
  onUpdateCost,
  onDeleteCost,
}) => {
  const [activeTab, setActiveTab] = useState<DocumentTab>('header');

  const summary = useMemo(() => ({
    itemsCount: items.length,
    totalAmount: document?.totalAmount ?? 0,
  }), [document?.totalAmount, items.length]);

  const currency = document?.currency ?? 'RSD';

  const renderContent = () => {
    switch (activeTab) {
      case 'items':
        return <DocumentItemsTable documentId={documentId} />;
      case 'costs':
        return (
          <DocumentCostsTable
            costs={costs}
            onAddCost={onAddCost}
            onUpdateCost={onUpdateCost}
            onDeleteCost={onDeleteCost}
          />
        );
      case 'header':
      default:
        return <DocumentHeader document={document} onChange={onDocumentChange} />;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {isLoading ? (
              <Skeleton width={220} />
            ) : (
              <>Dokument #{document?.documentNumber ?? documentId}</>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLoading ? (
              <Skeleton width={180} />
            ) : (
              <>
                {document?.partnerName ?? 'Nepoznat partner'} · {document?.status ?? 'Draft'}
              </>
            )}
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography variant="subtitle2" color="text.secondary">
            Ukupno stavki
          </Typography>
          <Typography variant="h6">
            {isLoading ? <Skeleton width={40} sx={{ display: 'inline-block' }} /> : summary.itemsCount}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Vrednost dokumenta
          </Typography>
          <Typography variant="h6">
            {isLoading ? (
              <Skeleton width={140} sx={{ display: 'inline-block' }} />
            ) : (
              summary.totalAmount.toLocaleString('sr-RS', {
                style: 'currency',
                currency,
                minimumFractionDigits: 2,
              })
            )}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value as DocumentTab)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Zaglavlje" value="header" />
        <Tab label={`Stavke (${items.length})`} value="items" />
        <Tab label={`Troškovi (${costs.length})`} value="costs" />
      </Tabs>

      {renderContent()}
    </Paper>
  );
};

export default DocumentForm;
