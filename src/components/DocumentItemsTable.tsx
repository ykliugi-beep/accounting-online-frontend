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
import { DocumentLineItem, DocumentLineItemCreateDto } from '../types';
import { useAutoSaveItems } from '../hooks/useAutoSaveItems';
import { useArticles, useTaxRates } from '../hooks/useCombos';
import { api } from '../api/endpoints';
import EditableCell, { CellNavigationDirection } from './EditableCell';
import ConflictDialog from './ConflictDialog';
import { useDocumentStore, useUIStore } from '../store';

interface DocumentItemsTableProps {
  documentId: number;
}

const GRID_TEMPLATE_COLUMNS =
  '70px minmax(220px, 1fr) 140px 140px 140px 140px 100px 140px 160px 90px';
const ROW_HEIGHT = 72;
const FOCUSABLE_COLUMN_INDEXES = [1, 2, 3, 4, 5];

const columnHelper = createColumnHelper<DocumentLineItem>();

const getNavigationKey = (rowIndex: number, columnIndex: number) =>
  `${rowIndex}-${columnIndex}`;

export const DocumentItemsTable: React.FC<DocumentItemsTableProps> = ({
  documentId,
}) => {
  const [items, setItems] = useState<DocumentLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const focusRefs = useRef<Map<string, HTMLElement>>(new Map());
  const listRef = useRef<FixedSizeListType>(null);
  const handledErrorItemsRef = useRef<Set<number>>(new Set());

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

  useEffect(() => {
    Object.values(autoSaveMap).forEach((state) => {
      if (!state?.id) {
        return;
      }

      if (state.status === 'error') {
        if (handledErrorItemsRef.current.has(state.id)) {
          return;
        }

        handledErrorItemsRef.current.add(state.id);
        (async () => {
          const refreshed = await refreshItem(state.id);
          if (refreshed) {
            setItems((prev) =>
              prev.map((item) =>
                item.id === state.id ? (refreshed as DocumentLineItem) : item
              )
            );
          }
        })();
      } else {
        handledErrorItemsRef.current.delete(state.id);
      }
    });
  }, [autoSaveMap, refreshItem]);

  const handleValueChange = useCallback(
    (itemId: number, field: string, value: string | number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? ({ ...item, [field]: value } as DocumentLineItem) : item
        )
      );
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
      setItems((prev) => [...prev, created as unknown as DocumentLineItem]);
    } catch (err) {
      alert('Greška pri kreiranju stavke');
    }
  }, [documentId]);

  const handleDeleteItem = useCallback(
    async (itemId: number) => {
      try {
        await api.items.deleteItem(documentId, itemId);
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        setAnchorEl(null);
      } catch (err) {
        alert('Greška pri brisanju stavke');
      }
    },
    [documentId]
  );

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, itemId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  }, []);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleConflictRefresh = useCallback(async () => {
    if (conflictItemId) {
      const refreshed = await refreshItem(conflictItemId);
      if (refreshed) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === conflictItemId
              ? (refreshed as unknown as DocumentLineItem)
              : item
          )
        );
      }
    }
    setConflictDialogOpen(false);
  }, [conflictItemId, refreshItem]);

  const handleConflictOverwrite = useCallback(async () => {
    if (conflictItemId) {
      const item = items.find((i) => i.id === conflictItemId);
      if (item) {
        await forceUpdateItem(conflictData.itemId, 'quantity', item.quantity);
      }
    }
    setConflictDialogOpen(false);
  }, [conflictItemId, forceUpdateItem, items]);

  const articleOptions = useMemo(
    () =>
      articles?.map((article) => ({
        value: article.idArtikal,
        label: article.nazivArtikla,
      })) ?? [],
    [articles]
  );

  const taxRateMap = useMemo(
    () => new Map(taxRates?.map((rate) => [rate.idPoreskaStopa, rate.procenatPDV]) ?? []),
    [taxRates]
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

  const columns = useMemo<ColumnDef<DocumentLineItem>[]>(() => {
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
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' };
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
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' };
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
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' };
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
      columnHelper.accessor('discountAmount', {
        header: () => 'Rabat',
        cell: (info) => {
          const item = info.row.original;
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' };
          return (
            <EditableCell
              value={info.getValue() ?? 0}
              itemId={item.id}
              field="discountAmount"
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
      columnHelper.accessor('marginAmount', {
        header: () => 'Marža',
        cell: (info) => {
          const item = info.row.original;
          const autoSaveState = autoSaveMap[item.id] || { status: 'idle' };
          return (
            <EditableCell
              value={info.getValue() ?? 0}
              itemId={item.id}
              field="marginAmount"
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
        id: 'taxPercent',
        header: () => 'PDV %',
        cell: ({ row }) => {
          const percent =
            row.original.taxPercent ??
            (row.original.taxRateId
              ? taxRateMap.get(row.original.taxRateId)
              : undefined) ?? 0;
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
            {(row.original.taxAmount ?? 0).toFixed(2)}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'total',
        header: () => 'Ukupno',
        cell: ({ row }) => (
          <Typography variant="body2" fontWeight={600} align="right">
            {(row.original.total ?? 0).toFixed(2)}
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
    ];
  }, [
    articleOptions,
    autoSaveMap,
    handleMenuOpen,
    handleNavigate,
    handleValueChange,
    registerCellRef,
    taxRateMap,
  ]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  const listHeight = Math.min(Math.max(rows.length, 1) * ROW_HEIGHT, 400);

  if (isLoading || articlesLoading || taxRatesLoading) {
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
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
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
