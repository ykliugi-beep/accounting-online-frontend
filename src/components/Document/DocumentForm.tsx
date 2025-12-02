import React, { useMemo, useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography, Divider, Skeleton } from '@mui/material';
import type { DocumentDto, DocumentLineItemDto } from '../../types/api.types';
import { DocumentItemsTable } from './DocumentItemsTable';
import { DocumentHeader } from './DocumentHeader';
import { DocumentCostsTable } from './DocumentCostsTable';

export interface DocumentFormProps {
  documentId: number;
  document: DocumentDto | null;
  items: DocumentLineItemDto[];
  isLoading: boolean;
  onDocumentChange?: (updates: Partial<DocumentDto>) => void;
}

type DocumentTab = 'header' | 'items' | 'costs';

export const DocumentForm: React.FC<DocumentFormProps> = ({
  documentId,
  document,
  items,
  isLoading,
  onDocumentChange,
}) => {
  const [activeTab, setActiveTab] = useState<DocumentTab>('header');

  const summary = useMemo(
    () => ({
      itemsCount: items.length,
      totalAmount: document?.totalAmountGross ?? 0,
      totalNet: document?.totalAmountNet ?? 0,
      totalVat: document?.totalAmountVat ?? 0,
    }),
    [document, items.length]
  );

  const currency = 'RSD'; // TODO: Get from document when backend supports

  const renderContent = () => {
    switch (activeTab) {
      case 'items':
        return <DocumentItemsTable documentId={documentId} />;
      case 'costs':
        return <DocumentCostsTable documentId={documentId} />;
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
                {document?.partnerName ?? 'Nepoznat partner'} •{' '}
                {document?.organizationalUnitName ?? 'Nepoznat magacin'}
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
          <Typography variant="caption" display="block" color="text.secondary">
            Neto: {isLoading ? <Skeleton width={80} sx={{ display: 'inline-block' }} /> : summary.totalNet.toLocaleString('sr-RS', { style: 'currency', currency })}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            PDV: {isLoading ? <Skeleton width={80} sx={{ display: 'inline-block' }} /> : summary.totalVat.toLocaleString('sr-RS', { style: 'currency', currency })}
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
        <Tab label="Troškovi" value="costs" />
      </Tabs>

      {renderContent()}
    </Paper>
  );
};

export default DocumentForm;
