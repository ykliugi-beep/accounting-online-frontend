// Moved from src/components/ConflictDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ConflictResolutionAction } from '../../types';

interface ConflictDialogProps {
  isOpen: boolean;
  itemId?: number;
  errorMessage?: string;
  onRefresh: () => Promise<void>;
  onOverwrite: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * KONFLIKT DIJALOG - prikazuje se pri 409 Conflict grešci
 *
 * Scenario:
 * 1. Korisnik A i Korisnik B otvaraju istu stavku
 * 2. Korisnik A prvo sprema izmene
 * 3. Korisnik B pokušava da spremi - dobija 409 Conflict
 * 4. Dijalog nudi 2 opcije:
 *    - REFRESH: Osveži podatke sa servera (odbaci lokalne izmene)
 *    - OVERWRITE: Prepiši podatke na serveru (force update)
 */

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  isOpen,
  itemId,
  errorMessage,
  onRefresh,
  onOverwrite,
  onCancel,
  isLoading = false,
}) => {
  const [selectedAction, setSelectedAction] = useState<ConflictResolutionAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleRefresh = async () => {
    setActionLoading(true);
    setSelectedAction('refresh');
    try {
      await onRefresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverwrite = async () => {
    setActionLoading(true);
    setSelectedAction('overwrite');
    try {
      await onOverwrite();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedAction(null);
    setActionLoading(false);
    onCancel();
  };

  return (
    <Dialog
      open={isOpen}
      maxWidth="sm"
      fullWidth
      onClose={handleCancel}
      disableEscapeKeyDown={actionLoading}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" component="span">
            ⚠️ Konflikt pri čuvanju
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Stavka je promenjena od drugog korisnika!
        </Alert>

        <Typography variant="body2" paragraph>
          Stavka ID: <strong>{itemId}</strong>
        </Typography>

        {errorMessage && (
          <Typography variant="body2" color="error" paragraph>
            {errorMessage}
          </Typography>
        )}

        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dostupne opcije:
          </Typography>

          <Typography variant="body2" paragraph sx={{ mt: 1 }}>
            <strong>1. Osveži (Refresh):</strong>
            <br />
            Učitaj najnovije podatke sa servera i odbaci svoje izmene.
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>2. Prepiši (Overwrite):</strong>
            <br />
            Spremi svoje izmene na server (zameni novu verziju).
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleCancel}
          disabled={actionLoading}
          variant="outlined"
        >
          Otkaži
        </Button>

        <Button
          onClick={handleRefresh}
          disabled={actionLoading}
          variant="contained"
          color="info"
          startIcon={
            actionLoading && selectedAction === 'refresh' ? (
              <CircularProgress size={20} />
            ) : undefined
          }
        >
          Osveži
        </Button>

        <Button
          onClick={handleOverwrite}
          disabled={actionLoading}
          variant="contained"
          color="warning"
          startIcon={
            actionLoading && selectedAction === 'overwrite' ? (
              <CircularProgress size={20} />
            ) : undefined
          }
        >
          Prepiši
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictDialog;
