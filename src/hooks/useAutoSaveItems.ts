import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  SaveStatus,
  DocumentLineItemDto,
  PatchDocumentLineItemDto,
  AutoSaveStateMap,
} from '../types';
import { api } from '../api';

interface UseAutoSaveItemsOptions {
  documentId: number;
  onConflict?: (itemId: number) => void;
}

export const useAutoSaveItems = ({
  documentId,
  onConflict,
}: UseAutoSaveItemsOptions) => {
  const queryClient = useQueryClient();
  const [autoSaveMap, setAutoSaveMap] = useState<AutoSaveStateMap>({});
  const timerRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const pendingChangesRef = useRef<Map<number, Partial<DocumentLineItemDto>>>(new Map());

  const initializeETags = useCallback((items: DocumentLineItemDto[]) => {
    const newMap: AutoSaveStateMap = {};
    items.forEach((item) => {
      newMap[item.id] = {
        id: item.id,
        status: 'idle',
        error: null,
        etag: item.etag,
      };
    });
    setAutoSaveMap(newMap);
  }, []);

  const updateItemStatus = useCallback(
    (itemId: number, status: SaveStatus, error: string | null = null) => {
      setAutoSaveMap((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          id: itemId,
          status,
          error,
        },
      }));
    },
    []
  );

  const debouncedSave = useCallback(
    (itemId: number, field: string, value: string | number) => {
      const existingTimer = timerRefs.current.get(itemId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const currentChanges = pendingChangesRef.current.get(itemId) || {};
      pendingChangesRef.current.set(itemId, {
        ...currentChanges,
        [field]: value,
      });

      updateItemStatus(itemId, 'saving');

      const timer = setTimeout(async () => {
        const changes = pendingChangesRef.current.get(itemId);
        if (!changes) return;

        try {
          const currentETag = autoSaveMap[itemId]?.etag;
          const patchData: PatchDocumentLineItemDto = changes;

          const updated = await api.lineItem.patch(
            documentId,
            itemId,
            patchData,
            currentETag
          );

          setAutoSaveMap((prev) => ({
            ...prev,
            [itemId]: {
              id: itemId,
              status: 'saved',
              error: null,
              etag: updated.etag,
            },
          }));

          pendingChangesRef.current.delete(itemId);

          setTimeout(() => {
            updateItemStatus(itemId, 'idle');
          }, 2000);
        } catch (err: unknown) {
          if (typeof err === 'object' && err !== null && 'status' in err && err.status === 409) {
            updateItemStatus(itemId, 'conflict', 'Stavka je izmenjena od drugog korisnika');
            onConflict?.(itemId);
          } else {
            const message =
              typeof err === 'object' && err !== null && 'message' in err
                ? String(err.message)
                : 'Greška pri čuvanju';
            updateItemStatus(itemId, 'error', message);
          }
        }
      }, 500);

      timerRefs.current.set(itemId, timer);
    },
    [autoSaveMap, documentId, onConflict, updateItemStatus]
  );

  const forceUpdateItem = useCallback(
    async (itemId: number, field: string, value: string | number) => {
      try {
        updateItemStatus(itemId, 'saving');
        const patchData: PatchDocumentLineItemDto = { [field]: value };
        const updated = await api.lineItem.patch(documentId, itemId, patchData);

        setAutoSaveMap((prev) => ({
          ...prev,
          [itemId]: {
            id: itemId,
            status: 'saved',
            error: null,
            etag: updated.etag,
          },
        }));

        queryClient.invalidateQueries(['lineItems', documentId]);
      } catch (err: unknown) {
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'Greška pri čuvanju';
        updateItemStatus(itemId, 'error', message);
      }
    },
    [documentId, queryClient, updateItemStatus]
  );

  const refreshItem = useCallback(
    async (itemId: number): Promise<DocumentLineItemDto | null> => {
      try {
        const items = await api.lineItem.list(documentId);
        const refreshed = items.find((item) => item.id === itemId);

        if (refreshed) {
          setAutoSaveMap((prev) => ({
            ...prev,
            [itemId]: {
              id: itemId,
              status: 'idle',
              error: null,
              etag: refreshed.etag,
            },
          }));
          return refreshed;
        }
        return null;
      } catch (err: unknown) {
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'Greška pri osvežavanju';
        updateItemStatus(itemId, 'error', message);
        return null;
      }
    },
    [documentId, updateItemStatus]
  );

  return {
    autoSaveMap,
    debouncedSave,
    forceUpdateItem,
    refreshItem,
    initializeETags,
  };
};
