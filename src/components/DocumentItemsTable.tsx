import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { DocumentLineItem, DocumentLineItemCreateDto } from '../types';
import { useAutoSaveItems } from '../hooks/useAutoSaveItems';
import { useArticles, useTaxRates } from '../hooks/useCombos';
import { api } from '../api/endpoints';
import EditableCell from './EditableCell';
import ConflictDialog from './ConflictDialog';
import { useDocumentStore, useUIStore } from '../store';

interface DocumentItemsTableProps {
  documentId: number;
}

/**
 * EXCEL-LIKE TABELA za stavke dokumenta
 *
 * KARAKTERISTIKE:
 * - Inline editing sa 800ms autosave
 * - ETag konkurentnost
 * - 409 Conflict handling sa ConflictDialog
 * - ADD/DELETE stavki
 * - Status indikatori (saving, saved, error)
 * - Tab/Enter navigacija
 */

export const DocumentItemsTable: React.FC<DocumentItemsTableProps> = ({
  documentId,
}) => {
  // ==========================================
  // STATE
  // ==========================================

  const { items, setItems, addItem: addItemToStore, deleteItem: deleteItemFromStore, replaceItem } =
    useDocumentStore((state) => ({
      items: state.items,
      setItems: state.setItems,
      addItem: state.addItem,
      deleteItem: state.deleteItem,
      replaceItem: state.replaceItem,
    }));
  const { isLoading, setLoading, showConflictDialog, conflictData, openConflictDialog, closeConflictDialog } =
    useUIStore((state) => ({
      isLoading: state.isLoading,
      setLoading: state.setLoading,
      showConflictDialog: state.showConflictDialog,
      conflictData: state.conflictData,
      openConflictDialog: state.openConflictDialog,
      closeConflictDialog: state.closeConflictDialog,
    }));
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // ==========================================
  // HOOKS
  // ==========================================

  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: taxRates, isLoading: taxRatesLoading } = useTaxRates();

  const { autoSaveMap, debouncedSave, forceUpdateItem, refreshItem, initializeETags } =
    useAutoSaveItems({
      documentId,
      onConflict: (itemId) => {
        openConflictDialog({
          itemId,
          message: 'Stavka je izmenjena od drugog korisnika.',
        });
      },
    });

  // ==========================================
  // LOAD ITEMS
  // ==========================================

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedItems = await api.items.getItems(documentId);
      setItems(loadedItems);
      initializeETags(loadedItems);
    } catch (err) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message: string }).message
          : 'Greška pri učitavanju stavki';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [documentId, initializeETags, setItems, setLoading]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleValueChange = useCallback(
    (itemId: number, field: string, value: string | number) => {
      // Debounced autosave (800ms)
      debouncedSave(itemId, field, value);
    },
    [debouncedSave]
  );

  const handleAddItem = useCallback(async () => {
    const newItem: DocumentLineItemCreateDto = {
      articleId: 0,
      quantity: 1,
      invoicePrice: 0,
      calculateTax: true,
    };

    try {
      const created = await api.items.createItem(documentId, newItem);
      addItemToStore(created as unknown as DocumentLineItem);
    } catch (err) {
      alert('Greška pri kreiranju stavke');
    }
  }, [addItemToStore, documentId]);

  const handleDeleteItem = useCallback(async (itemId: number) => {
    try {
      await api.items.deleteItem(documentId, itemId);
      deleteItemFromStore(itemId);
      setAnchorEl(null);
    } catch (err) {
      alert('Greška pri brisanju stavke');
    }
  }, [deleteItemFromStore, documentId]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, itemId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // CONFLICT RESOLUTION
  const handleConflictRefresh = async () => {
    if (conflictData?.itemId) {
      const refreshed = await refreshItem(conflictData.itemId);
      if (refreshed) {
        replaceItem(refreshed as unknown as DocumentLineItem);
      }
    }
    closeConflictDialog();
  };

  const handleConflictOverwrite = async () => {
    if (conflictData?.itemId) {
      const item = items.find((i) => i.id === conflictData.itemId);
      if (item) {
        await forceUpdateItem(conflictData.itemId, 'quantity', item.quantity);
      }
    }
    closeConflictDialog();
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (isLoading || articlesLoading || taxRatesLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const articleMap = useMemo(
    () => new Map(articles?.map((a) => [a.idArtikal, a.nazivArtikla]) ?? []),
    [articles]
  );

  const taxRateMap = useMemo(
    () => new Map(taxRates?.map((t) => [t.idPoreskaStopa, t.procenatPDV]) ?? []),
    [taxRates]
  );

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>☰</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Artikal</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}
                >Količina</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}
                >Cena</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}
                >Rabat</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}
                >Marža</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}
                >PDV %</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}
                >PDV Iznos</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}
                >Ukupno</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Akcije</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 2 }}>
                  Nema stavki. Klikni dugme "Dodaj" da kreneš
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const autoSaveState = autoSaveMap[item.id] || {};
                return (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ width: '30px' }}>
                      <Typography variant="caption">{item.id}</Typography>
                    </TableCell>
                    <EditableCell
                      value={articleMap.get(item.articleId) || ''}
                      itemId={item.id}
                      field="articleId"
                      type="select"
                      onValueChange={handleValueChange}
                      status={autoSaveState.status || 'idle'}
                      error={autoSaveState.error}
                      selectOptions={articles?.map((a) => ({
                        value: a.idArtikal,
                        label: a.nazivArtikla,
                      })) || []}
                    />
                    <EditableCell
                      value={item.quantity}
                      itemId={item.id}
                      field="quantity"
                      type="decimal"
                      onValueChange={handleValueChange}
                      status={autoSaveState.status || 'idle'}
                      error={autoSaveState.error}
                    />
                    <EditableCell
                      value={item.invoicePrice}
                      itemId={item.id}
                      field="invoicePrice"
                      type="decimal"
                      onValueChange={handleValueChange}
                      status={autoSaveState.status || 'idle'}
                      error={autoSaveState.error}
                    />
                    <EditableCell
                      value={item.discountAmount || 0}
                      itemId={item.id}
                      field="discountAmount"
                      type="decimal"
                      onValueChange={handleValueChange}
                      status={autoSaveState.status || 'idle'}
                      error={autoSaveState.error}
                    />
                    <EditableCell
                      value={item.marginAmount || 0}
                      itemId={item.id}
                      field="marginAmount"
                      type="decimal"
                      onValueChange={handleValueChange}
                      status={autoSaveState.status || 'idle'}
                      error={autoSaveState.error}
                    />
                    <TableCell sx={{ textAlign: 'right' }}>
                      {item.taxPercent?.toFixed(2)}%
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      {item.taxAmount?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {item.total?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DUGME ZA DODAVANJE */}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
        >
          Dodaj stavku
        </Button>
      </Box>

      {/* CONTEXT MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            selectedItemId &&
            handleDeleteItem(selectedItemId)
          }
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Obriši
        </MenuItem>
      </Menu>

      {/* CONFLICT DIALOG */}
      <ConflictDialog
        isOpen={showConflictDialog}
        itemId={conflictData?.itemId || undefined}
        errorMessage={conflictData?.message}
        onRefresh={handleConflictRefresh}
        onOverwrite={handleConflictOverwrite}
        onCancel={closeConflictDialog}
      />
    </>
  );
};

export default DocumentItemsTable;
