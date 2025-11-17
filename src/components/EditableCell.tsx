import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  Fade,
  MenuItem,
} from '@mui/material';
import { Check, Error as ErrorIcon } from '@mui/icons-material';
import { AutoSaveStatus } from '../types';

export type CellNavigationDirection =
  | 'nextColumn'
  | 'prevColumn'
  | 'nextRow'
  | 'prevRow';

interface EditableCellProps {
  value: number | string;
  itemId: number;
  field: string;
  type: 'number' | 'decimal' | 'text' | 'select';
  onValueChange: (itemId: number, field: string, value: string | number) => void;
  status: AutoSaveStatus;
  error?: string;
  disabled?: boolean;
  selectOptions?: { value: string | number; label: string }[];
  inputRef?: (
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  ) => void;
  onMove?: (direction: CellNavigationDirection) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  itemId,
  field,
  type,
  onValueChange,
  status,
  error,
  disabled = false,
  selectOptions = [],
  inputRef,
  onMove,
}) => {
  const [tempValue, setTempValue] = useState<string>(String(value ?? ''));

  useEffect(() => {
    setTempValue(String(value ?? ''));
  }, [value]);

  const commitValue = useCallback(() => {
    let finalValue: string | number = tempValue;

    if (type === 'number' || type === 'decimal') {
      const parsed = tempValue === '' ? 0 : Number(tempValue);
      finalValue = Number.isNaN(parsed) ? 0 : parsed;
    } else if (type === 'select') {
      if (typeof value === 'number') {
        const parsed = tempValue === '' ? 0 : Number(tempValue);
        finalValue = Number.isNaN(parsed) ? 0 : parsed;
      } else {
        finalValue = tempValue;
      }
    }

    if (finalValue !== value) {
      onValueChange(itemId, field, finalValue);
    }
  }, [field, itemId, onValueChange, tempValue, type, value]);

  const handleBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitValue();
        onMove?.(event.shiftKey ? 'prevRow' : 'nextRow');
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        commitValue();
        onMove?.(event.shiftKey ? 'prevColumn' : 'nextColumn');
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setTempValue(String(value ?? ''));
      }
    },
    [commitValue, onMove, value]
  );

  const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.target.select();
  };

  const renderInput = () => {
    const commonProps = {
      size: 'small' as const,
      value: tempValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTempValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      inputRef,
      fullWidth: true,
      disabled,
      error: Boolean(error),
    };

    if (type === 'select') {
      return (
        <TextField
          select
          {...commonProps}
          SelectProps={{
            MenuProps: { PaperProps: { sx: { maxHeight: 320 } } },
          }}
        >
          {selectOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    const inputType = type === 'decimal' || type === 'number' ? 'number' : 'text';

    return (
      <TextField
        {...commonProps}
        type={inputType}
        inputProps={{
          step: type === 'decimal' ? '0.01' : undefined,
        }}
      />
    );
  };

  const statusIcon = () => {
    switch (status) {
      case 'saving':
        return (
          <Tooltip title="Sprema se...">
            <CircularProgress size={16} sx={{ color: '#ff9800' }} />
          </Tooltip>
        );
      case 'saved':
        return (
          <Tooltip title="Sačuvano">
            <Check sx={{ fontSize: 18, color: '#4caf50' }} />
          </Tooltip>
        );
      case 'error':
        return (
          <Tooltip title={error || 'Greška pri čuvanju'}>
            <ErrorIcon sx={{ fontSize: 18, color: '#f44336' }} />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box flex={1}>{renderInput()}</Box>
      <Fade in={status !== 'idle'}>
        <Box display="flex" alignItems="center">
          {statusIcon()}
        </Box>
      </Fade>
      {error && (
        <Typography
          variant="caption"
          sx={{
            color: '#f44336',
            display: 'block',
            fontStyle: 'italic',
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default EditableCell;
