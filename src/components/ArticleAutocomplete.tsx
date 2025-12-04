import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material';
import { ArticleComboDto } from '../types/api.types';
import { useArticleSearch } from '../hooks/useArticleSearch';

interface ArticleAutocompleteProps {
  value: ArticleComboDto | null;
  onChange: (article: ArticleComboDto | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * 🔍 Article Autocomplete sa server-side search
 * 
 * Features:
 * - Minimum 2 karaktera za pretragu
 * - Debounce 300ms
 * - Server-side filtering
 * - Loading indicator
 * - Max 50 rezultata
 * - Prikazuje jedinicu mere
 * 
 * Backend mapping:
 * - idArtikal → IdArtikal
 * - nazivArtikla → NazivArtikla
 * - sifraArtikal → SifraArtikal
 * - jedinicaMere → JedinicaMere
 * 
 * @example
 * ```tsx
 * <ArticleAutocomplete
 *   value={selectedArticle}
 *   onChange={setSelectedArticle}
 *   label="Artikal"
 *   required
 * />
 * ```
 */
export const ArticleAutocomplete: React.FC<ArticleAutocompleteProps> = ({
  value,
  onChange,
  label = 'Artikal',
  placeholder = 'Unesi šifru ili naziv artikla (min 2 karaktera)...',
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Custom debounce - čeka 300ms pre nego što pozove search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  const handleInputChange = (_: React.SyntheticEvent, newValue: string) => {
    setSearchTerm(newValue);
  };

  // React Query hook - automatski kešira rezultate
  const { data: options = [], isLoading } = useArticleSearch(debouncedSearchTerm, 50);

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
      // Format opcije: "A001 - Artikal XYZ"
      getOptionLabel={(option) => {
        const code = option.sifraArtikal;
        const name = option.nazivArtikla;
        return `${code} - ${name}`;
      }}
      // Disable client-side filtering - server radi filtering!
      filterOptions={(x) => x}
      // Empty message kada nema rezultata
      noOptionsText={
        debouncedSearchTerm.length < 2
          ? 'Unesi min 2 karaktera za pretragu'
          : 'Nema rezultata'
      }
      // Custom rendering sa jedinicom mere
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body1">
              <strong>{option.sifraArtikal}</strong> - {option.nazivArtikla}
            </Typography>
            {option.jedinicaMere && (
              <Typography variant="caption" color="text.secondary">
                Jedinica: {option.jedinicaMere}
              </Typography>
            )}
          </Box>
        </Box>
      )}
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

export default ArticleAutocomplete;
