import React from 'react';
import { Box, Grid, TextField, Typography } from '@mui/material';
import type { DocumentDetails } from '../../types';

interface DocumentHeaderProps {
  document: DocumentDetails | null;
  onChange?: (updates: Partial<DocumentDetails>) => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ document, onChange }) => {
  const handleInputChange = (field: keyof DocumentDetails) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ [field]: event.target.value });
    };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Osnovni podaci
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Broj dokumenta"
            fullWidth
            value={document?.documentNumber ?? ''}
            onChange={handleInputChange('documentNumber')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Datum"
            type="date"
            fullWidth
            value={document?.documentDate ?? ''}
            onChange={handleInputChange('documentDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Status"
            fullWidth
            value={document?.status ?? 'Draft'}
            onChange={handleInputChange('status')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Partner"
            fullWidth
            value={document?.partnerName ?? ''}
            onChange={handleInputChange('partnerName')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Napomena"
            fullWidth
            multiline
            minRows={2}
            value={document?.notes ?? ''}
            onChange={handleInputChange('notes')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentHeader;
