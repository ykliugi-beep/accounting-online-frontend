import React, { useState, useCallback } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { debounce } from 'lodash';
import { PartnerComboDto } from '../types/api.types';
import { usePartnerSearch } from '../hooks/usePartnerSearch';

interface PartnerAutocompleteProps {
  value: PartnerComboDto | null;
  onChange: (partner: PartnerComboDto | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * 🔍 Partner Autocomplete sa server-side search
 * 
 * Features:
 * - Minimum 2 karaktera za pretragu
 * - Debounce 300ms
 * - Server-side filtering
 * - Loading indicator
 * - Max 50 rezultata
 * 
 * @example
 * ```tsx
 * <PartnerAutocomplete
 *   value={selectedPartner}
 *   onChange={setSelectedPartner}
 *   label="Partner"
 *   required
 * />
 * ```
 */
export const PartnerAutocomplete: React.FC<PartnerAutocompleteProps> = ({
  value,
  onChange,
  label = 'Partner',
  placeholder = 'Unesi šifru ili naziv partnera (min 2 karaktera)...',
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce funkcija - čeka 300ms pre nego što pozove search
  const debouncedSetSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 300),
    []
  );

  const handleInputChange = (_: React.SyntheticEvent, newValue: string) => {
    setSearchTerm(newValue);
    debouncedSetSearch(newValue);
  };

  // React Query hook - automatski kešira rezultate
  const { data: options = [], isLoading } = usePartnerSearch(debouncedSearchTerm, 50);

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={searchTerm}
      onInputChange={handleInputChange}
      options={options}
      loading={isLoading}
      disabled={disabled}
      fullWidth={fullWidth}
      // Format opcije: "P001 - Partner ABC"
      getOptionLabel={(option) => `${option.code} - ${option.name}`}
      // Disable client-side filtering - server radi filtering!
      filterOptions={(x) => x}
      // Empty message kada nema rezultata
      noOptionsText={
        debouncedSearchTerm.length < 2
          ? 'Unesi min 2 karaktera za pretragu'
          : 'Nema rezultata'
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText || (searchTerm.length === 1 ? 'Još 1 karakter...' : undefined)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default PartnerAutocomplete;
