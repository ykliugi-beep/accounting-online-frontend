import { useCallback, useRef, useEffect, useState } from 'react';
import {
  DocumentLineItem,
  DocumentLineItemPatchDto,
  AutoSaveStatus,
  ItemAutoSaveState,
  AutoSaveStateMap,
  ConflictResolutionAction,
} from '../types';
import { api } from '../api';  // FIXED: Import from index.ts instead of endpoints.ts

/**
 * KLJUCwNI HOOK za autosave sa ETag konkurentnosti
 *
 * WORKFLOW:
 * 1. User unese vrednost u celiju
 * 2. Hook postavi status na 'saving' sa 800ms debounce
 * 3. Posalje PATCH sa If-Match header-om (ETag)
 * 4. Ako OK (200) -> 'saved' status, novi ETag
 * 5. Ako 409 Conflict -> prikazi ConflictDialog
 * 6. User odabere 'refresh' ili 'overwrite'
 * 7. Nastavi sa novim ETag-om
 */

interface UseAutoSaveItemsProps {
  documentId: number;
  onConflict?: (itemId: number, action: ConflictResolutionAction) => void;
}

// Helper function to handle 409 Conflict errors
function handleConflict(error: any): { message: string; currentETag?: string } | null {
  if (error?.status === 409 || error?.response?.status === 409) {
    return {
      message: error?.message || 'Dokument je promenjen od strane drugog korisnika',
      currentETag: error?.response?.headers?.etag?.replace(/"/g, ''),
    };
  }
  return null;
}

export const useAutoSaveItems = ({
  documentId,
  onConflict,
}: UseAutoSaveItemsProps) => {
  // ==========================================
  // STATE
  // ==========================================

  const [autoSaveMap, setAutoSaveMap] = useState<AutoSaveStateMap>({});
  const debounceTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const eTagsRef = useRef<Map<number, string>>(new Map());

  // ==========================================
  // INICIJALIZACIJA eTags
  // ==========================================

  const initializeETags = useCallback((items: DocumentLineItem[]) => {
    eTagsRef.current.clear();
    items.forEach((item) => {
      eTagsRef.current.set(item.id, item.eTag);
    });
  }, []);

  // ==========================================
  // AUTOSAVE FUNKCIJA sa 800ms debounce
  // ==========================================

  const saveItem = useCallback(
    async (
      itemId: number,
      field: string,
      value: number | string,
      currentETag: string
    ): Promise<void> => {
      // Setuj status na 'saving'
      setAutoSaveMap((prev) => ({
        ...prev,
        [itemId]: {
          id: itemId,
          status: 'saving',
          eTag: currentETag,
        },
      }));

      try {
        // Konvertuj field u API format (camelCase -> camelCase)
        const patchData: DocumentLineItemPatchDto = {
          [field]: field.includes('Price')
            ? parseFloat(String(value))
            : field.includes('Quantity')
              ? parseFloat(String(value))
              : value,
        };

        // KRITICNO: Prosled If-Match sa trenutnim ETag-om
        const response = await api.lineItem.patch(
          documentId,
          itemId,
          patchData,
          currentETag
        );

        // Ekstraktuj novi ETag iz response-a
        const newETag = response.eTag;
        eTagsRef.current.set(itemId, newETag);

        // Setuj status na 'saved'
        setAutoSaveMap((prev) => ({
          ...prev,
          [itemId]: {
            id: itemId,
            status: 'saved',
            eTag: newETag,
            lastSavedAt: new Date().toISOString(),
          },
        }));

        // Auto-reset status na 'idle' nakon 2 sekunde
        setTimeout(() => {
          setAutoSaveMap((prev) => ({
            ...prev,
            [itemId]: {
              ...prev[itemId],
              status: 'idle',
            },
          }));
        }, 2000);
      } catch (error) {
        // Hendluj 409 Conflict posebno
        const conflictData = handleConflict(error);
        if (conflictData) {
          console.warn('409 Conflict:', conflictData);

          // Setuj novi ETag iz response-a
          if (conflictData.currentETag) {
            eTagsRef.current.set(itemId, conflictData.currentETag);
          }

          setAutoSaveMap((prev) => ({
            ...prev,
            [itemId]: {
              id: itemId,
              status: 'error',
              error: conflictData.message,
              eTag: conflictData.currentETag || currentETag,
            },
          }));

          // Pozovi callback za 409 Conflict - prikazi ConflictDialog
          if (onConflict) {
            onConflict(itemId, 'refresh');
          }
        } else {
          // Ostale greske
          const errorMessage =
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as { message: string }).message
              : 'Greska pri cuvanju';

          setAutoSaveMap((prev) => ({
            ...prev,
            [itemId]: {
              id: itemId,
              status: 'error',
              error: errorMessage,
              eTag: currentETag,
            },
          }));
        }
      }
    },
    [documentId, onConflict]
  );

  // ==========================================
  // DEBOUNCE WRAPPER - 800ms
  // ==========================================

  const debouncedSave = useCallback(
    (itemId: number, field: string, value: number | string): void => {
      // Ocisti prethodni timeout za ovu stavku
      const existingTimer = debounceTimersRef.current.get(itemId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Postavi novi timeout sa 800ms debounce-om
      const newTimer = setTimeout(() => {
        const currentETag = eTagsRef.current.get(itemId) || '';
        saveItem(itemId, field, value, currentETag);
        debounceTimersRef.current.delete(itemId);
      }, 800);

      debounceTimersRef.current.set(itemId, newTimer);
    },
    [saveItem]
  );

  // ==========================================
  // FORCE UPDATE - za 'overwrite' akciju
  // ==========================================

  const forceUpdateItem = useCallback(
    async (
      itemId: number,
      field: string,
      value: number | string
    ): Promise<void> => {
      const currentETag = eTagsRef.current.get(itemId) || '';
      await saveItem(itemId, field, value, currentETag);
    },
    [saveItem]
  );

  // ==========================================
  // REFRESH ITEM - za 'refresh' akciju
  // ==========================================

  const refreshItem = useCallback(
    async (itemId: number): Promise<DocumentLineItem | null> => {
      try {
        const item = await api.lineItem.get(documentId, itemId);
        eTagsRef.current.set(itemId, item.eTag);
        return item;
      } catch (error) {
        console.error('Error refreshing item:', error);
        return null;
      }
    },
    [documentId]
  );

  // ==========================================
  // CLEANUP - ocisti timeout-e
  // ==========================================

  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach((timer) => clearTimeout(timer));
      debounceTimersRef.current.clear();
    };
  }, []);

  // ==========================================
  // RETURN
  // ==========================================

  return {
    autoSaveMap,
    debouncedSave,
    forceUpdateItem,
    refreshItem,
    initializeETags,
    getItemETag: (itemId: number) => eTagsRef.current.get(itemId) || '',
  };
};

export default useAutoSaveItems;
