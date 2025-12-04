// File moved from src/components/DocumentItemsTable.tsx
// This component belongs to Document module

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import type { FixedSizeList as FixedSizeListType } from 'react-window';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import { DocumentLineItemDto, CreateDocumentLineItemDto } from '../../types';
import { useAutoSaveItems } from '../../hooks/useAutoSaveItems';
import { useArticles } from '../../hooks/useCombos';
import { api } from '../../api';
import { EditableCell, CellNavigationDirection } from './EditableCell';
import { ConflictDialog } from './ConflictDialog';
import { useDocumentStore, useUIStore } from '../../store';

interface DocumentItemsTableProps {
  documentId: number;
}

const GRID_TEMPLATE_COLUMNS =
  '70px minmax(220px, 1fr) 140px 140px 140px 140px 100px 140px 160px 90px';
const ROW_HEIGHT = 72;
const FOCUSABLE_COLUMN_INDEXES = [1, 2, 3, 4, 5];

const columnHelper = createColumnHelper<DocumentLineItemDto>();

const getNavigationKey = (rowIndex: number, columnIndex: number) =>
  `${rowIndex}-${columnIndex}`;

export const DocumentItemsTable: React.FC<DocumentItemsTableProps> = ({
  documentId,
}) => {
  // ==========================================
  // STATE
  // ==========================================

  const { items, setItems, addItem, removeItem, updateItem } =
    useDocumentStore((state) => ({
      items: state.items,
      setItems: state.setItems,
      addItem: state.addItem,
      removeItem: state.removeItem,
      updateItem: state.updateItem,
    }));
  const { showConflictDialog, conflictData, openConflictDialog, closeConflictDialog } = useUIStore((state) => ({
    showConflictDialog: state.showConflictDialog,
    conflictData: state.conflictData,
    openConflictDialog: state.openConflictDialog,
    closeConflictDialog: state.closeConflictDialog,
  }));
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const focusRefs = useRef<Map<string, HTMLElement>>(new Map());
  const listRef = useRef<FixedSizeListType>(null);
  const handledErrorItemsRef = useRef<Set<number>>(new Set());
  const optimisticSnapshotsRef = useRef<Map<number, DocumentLineItemDto>>(new Map());
  const lastKnownItemsRef = useRef<Map<number, DocumentLineItemDto>>(new Map());

  const { data: articles, isLoading: articlesLoading } = useArticles();

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

  const loadItems = useCallback(async () => {
    try {
      setIsTableLoading(true);
      setError(null);
      const loadedItems = await api.lineItem.list(documentId);
      setItems(loadedItems);
      initializeETags(loadedItems);
      lastKnownItemsRef.current = new Map(
        loadedItems.map((item) => [item.id, { ...item }])
      );
      optimisticSnapshotsRef.current.clear();
      handledErrorItemsRef.current.clear();
    } catch (err) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message: string }).message
          : 'Greška pri učitavanju stavki';
      setError(message);
    } finally {
      setIsTableLoading(false);
    }
  }, [documentId, initializeETags, setItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    Object.values(autoSaveMap).forEach((state) => {
      if (!state?.id) {
        return;
      }

      if (state.status === 'error') {
        const snapshot = optimisticSnapshotsRef.current.get(state.id);
        const lastKnown = lastKnownItemsRef.current.get(state.id);
        if (snapshot || lastKnown) {
          const fallback = snapshot ?? lastKnown;
          setItems(
            items.map((item) =>
              item.id === state.id && fallback ? { ...fallback } : item
            )
          );
        }

        optimisticSnapshotsRef.current.delete(state.id);

        if (handledErrorItemsRef.current.has(state.id)) {
          return;
        }

        handledErrorItemsRef.current.add(state.id);
        (async () => {
          const refreshed = await refreshItem(state.id);
          if (refreshed) {
            setItems(
              items.map((item) =>
                item.id === state.id ? refreshed : item
              )
            );
            lastKnownItemsRef.current.set(state.id, { ...refreshed });
          }
        })();
      } else if (state.status === 'saved') {
        optimisticSnapshotsRef.current.delete(state.id);
        handledErrorItemsRef.current.delete(state.id);
        const currentItem = items.find((item) => item.id === state.id);
        if (currentItem) {
          lastKnownItemsRef.current.set(state.id, { ...currentItem });
        }
      } else {
        handledErrorItemsRef.current.delete(state.id);
      }
    });
  }, [autoSaveMap, refreshItem, items, setItems]);

  const handleValueChange = useCallback(
    (itemId: number, field: string, value: string | number) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      if (!optimisticSnapshotsRef.current.has(itemId)) {
        optimisticSnapshotsRef.current.set(itemId, { ...item });
      }

      updateItem(itemId, { [field]: value });
      debouncedSave(itemId, field, value);
    },
    [debouncedSave, items, updateItem]
  );

  const handleAddItem = useCallback(async () => {
    const newItem: CreateDocumentLineItemDto = {
      articleId: 0,
      quantity: 1,
      invoicePrice: 0,
      discount: 0,
      taxRateId: '01',
      taxRatePercentage: 20,
      unitOfMeasure: 'kom',
      statusId: null,
      notes: null,
    };

    try {
      const created = await api.lineItem.create(documentId, newItem);
      addItem(created);
      lastKnownItemsRef.current.set(created.id, created);
    } catch (err) {
      alert('Greška pri kreiranju stavke');
    }
  }, [documentId, addItem]);

  const handleDeleteItem = useCallback(
    async (itemId: number) => {
      try {
        await api.lineItem.delete(documentId, itemId);
        removeItem(itemId);
        lastKnownItemsRef.current.delete(itemId);
        setAnchorEl(null);
      } catch (err) {
        alert('Greška pri brisanju stavke');
      }
    },
    [documentId, removeItem]
  );

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, itemId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  }, []);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleConflictRefresh = useCallback(async () => {
    if (conflictData?.itemId) {
      const refreshed = await refreshItem(conflictData.itemId);
      if (refreshed) {
        setItems(
          items.map((item) =>
            item.id === conflictData.itemId ? refreshed : item
          )
        );
        lastKnownItemsRef.current.set(conflictData.itemId, refreshed);
      }
    }
    closeConflictDialog();
  }, [conflictData, refreshItem, items, setItems, closeConflictDialog]);

  const handleConflictOverwrite = useCallback(async () => {
    if (conflictData?.itemId) {
      const item = items.find((i) => i.id === conflictData.itemId);
      if (item) {
        await forceUpdateItem(conflictData.itemId, 'quantity', item.quantity);
      }
    }
    closeConflictDialog();
  }, [conflictData, forceUpdateItem, items, closeConflictDialog]);

  const articleOptions = useMemo(
    () =>
      articles?.map((article) => ({
        value: article.idArtikal ?? article.id,
        label: article.nazivArtikla ?? article.name,
      })) ?? [],
    [articles]
  );

  const registerCellRef = useCallback(
    (rowIndex: number, columnIndex: number, element: HTMLElement | null) => {
      const key = getNavigationKey(rowIndex, columnIndex);
      if (element) {
        focusRefs.current.set(key, element);
      } else {
        focusRefs.current.delete(key);
      }
    },
    []
  );

  const focusCell = useCallback((rowIndex: number, columnIndex: number) => {
    if (rowIndex < 0 || columnIndex < 0) {
      return;
    }

    const key = getNavigationKey(rowIndex, columnIndex);
    const focusTarget = focusRefs.current.get(key);

    if (focusTarget) {
      focusTarget.focus();
      if ('select' in focusTarget && typeof (focusTarget as HTMLInputElement).select === 'function') {
        (focusTarget as HTMLInputElement).select();
      }
      return;
    }

    listRef.current?.scrollToItem(rowIndex);
    requestAnimationFrame(() => {
      const retryTarget = focusRefs.current.get(key);
      retryTarget?.focus();
    });
  }, []);

  const findFocusableColumn = useCallback((columnIndex: number, forward: boolean) => {
    const currentIdx = FOCUSABLE_COLUMN_INDEXES.indexOf(columnIndex);
    if (currentIdx === -1) {
      return null;
    }

    const nextIdx = currentIdx + (forward ? 1 : -1);
    return FOCUSABLE_COLUMN_INDEXES[nextIdx] ?? null;
  }, []);

  const handleNavigate = useCallback(
    (rowIndex: number, columnIndex: number, direction: CellNavigationDirection) => {
      const totalRows = items.length;
      if (!totalRows) {
        return;
      }

      if (direction === 'nextColumn') {
        const nextColumn = findFocusableColumn(columnIndex, true);
        if (nextColumn !== null) {
          focusCell(rowIndex, nextColumn);
        }
        return;
      }

      if (direction === 'prevColumn') {
        const prevColumn = findFocusableColumn(columnIndex, false);
        if (prevColumn !== null) {
          focusCell(rowIndex, prevColumn);
        }
        return;
      }

      if (direction === 'nextRow') {
        if (rowIndex + 1 < totalRows) {
          focusCell(rowIndex + 1, columnIndex);
        }
        return;
      }

      if (direction === 'prevRow') {
        if (rowIndex - 1 >= 0) {
          focusCell(rowIndex - 1, columnIndex);
        }
      }
    },
    [findFocusableColumn, focusCell, items.length]
  );

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'id',
        header: () => '☰',
        cell: ({ row }) => (
          <Typography variant="caption" color="text.secondary">
            {row.original.id}
          </Typography>
        ),
      }),
      columnHelper.accessor('articleId', {
        header: () => 'Artikal',
        cell: (info) => {
          const item = info.row.original;
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' as const };
          return (
            <EditableCell
              value={info.getValue() ?? ''}
              itemId={item.id}
              field="articleId"
              type="select"
              selectOptions={articleOptions}
              onValueChange={handleValueChange}
              status={autoSaveState.status}
              error={autoSaveState.error}
              inputRef={(element) =>
                registerCellRef(info.row.index, info.column.getIndex(), element)
              }
              onMove={(direction) =>
                handleNavigate(info.row.index, info.column.getIndex(), direction)
              }
            />
          );
        },
      }),
      columnHelper.accessor('quantity', {
        header: () => 'Količina',
        cell: (info) => {
          const item = info.row.original;
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' as const };
          return (
            <EditableCell
              value={info.getValue() ?? 0}
              itemId={item.id}
              field="quantity"
              type="decimal"
              onValueChange={handleValueChange}
              status={autoSaveState.status}
              error={autoSaveState.error}
              inputRef={(element) =>
                registerCellRef(info.row.index, info.column.getIndex(), element)
              }
              onMove={(direction) =>
                handleNavigate(info.row.index, info.column.getIndex(), direction)
              }
            />
          );
        },
      }),
      columnHelper.accessor('invoicePrice', {
        header: () => 'Cena',
        cell: (info) => {
          const item = info.row.original;
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' as const };
          return (
            <EditableCell
              value={info.getValue() ?? 0}
              itemId={item.id}
              field="invoicePrice"
              type="decimal"
              onValueChange={handleValueChange}
              status={autoSaveState.status}
              error={autoSaveState.error}
              inputRef={(element) =>
                registerCellRef(info.row.index, info.column.getIndex(), element)
              }
              onMove={(direction) =>
                handleNavigate(info.row.index, info.column.getIndex(), direction)
              }
            />
          );
        },
      }),
      columnHelper.accessor('discount', {
        header: () => 'Rabat',
        cell: (info) => {
          const item = info.row.original;
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' as const };
          return (
            <EditableCell
              value={info.getValue() ?? 0}
              itemId={item.id}
              field="discount"
              type="decimal"
              onValueChange={handleValueChange}
              status={autoSaveState.status}
              error={autoSaveState.error}
              inputRef={(element) =>
                registerCellRef(info.row.index, info.column.getIndex(), element)
              }
              onMove={(direction) =>
                handleNavigate(info.row.index, info.column.getIndex(), direction)
              }
            />
          );
        },
      }),
      columnHelper.display({
        id: 'margin',
        header: () => 'Marža',
        cell: () => (
          <Typography variant="body2" align="right">
            -
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'taxPercent',
        header: () => 'PDV %',
        cell: ({ row }) => {
          const percent = row.original.taxRatePercentage ?? 0;
          return (
            <Typography variant="body2" align="right">
              {percent.toFixed(2)}%
            </Typography>
          );
        },
      }),
      columnHelper.display({
        id: 'taxAmount',
        header: () => 'PDV Iznos',
        cell: ({ row }) => (
          <Typography variant="body2" align="right">
            {(row.original.vatAmount ?? 0).toFixed(2)}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'total',
        header: () => 'Ukupno',
        cell: ({ row }) => (
          <Typography variant="body2" fontWeight={600} align="right">
            {(row.original.totalAmount ?? 0).toFixed(2)}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => 'Akcije',
        cell: ({ row }) => (
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row.original.id)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      }),
    ] as ColumnDef<DocumentLineItemDto>[];
  }, [
    articleOptions,
    autoSaveMap,
    handleMenuOpen,
    handleNavigate,
    handleValueChange,
    registerCellRef,
  ]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  const listHeight = Math.min(Math.max(rows.length, 1) * ROW_HEIGHT, 400);

  if (isTableLoading || articlesLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ mt: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
            gap: 1,
            px: 2,
            py: 1.5,
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <Typography key={header.id} variant="body2" fontWeight={600} color="text.secondary">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </Typography>
            ))
          )}
        </Box>

        {rows.length === 0 ? (
          <Box px={2} py={4} textAlign="center">
            <Typography color="text.secondary">
              Nema stavki. Klikni dugme "Dodaj" da kreneš.
            </Typography>
          </Box>
        ) : (
          <List
            ref={listRef}
            height={listHeight}
            itemCount={rows.length}
            itemSize={ROW_HEIGHT}
            width="100%"
            itemKey={(index) => rows[index]?.original.id ?? index}
          >
            {({ index, style }: ListChildComponentProps) => {
              const row = rows[index];
              if (!row) {
                return null;
              }

              return (
                <Box
                  style={style}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderBottom: '1px solid #f0f0f0',
                    alignItems: 'center',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Box key={cell.id} sx={{ pr: 1 }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Box>
                  ))}
                </Box>
              );
            }}
          </List>
        )}
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddItem}>
          Dodaj stavku
        </Button>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedItemId) {
              handleDeleteItem(selectedItemId);
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18}} />
          Obriši
        </MenuItem>
      </Menu>

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
