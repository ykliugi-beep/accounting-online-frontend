import { useCallback, useRef, useEffect, useState } from 'react';
import {
  DocumentLineItemDto,
  PatchDocumentLineItemDto,
  SaveStatus,
  AutoSaveStateMap,
} from '../types';
import { api } from '../api';

/**
 * KLJUČNI HOOK za autosave sa ETag konkurentnosti
 *
 * WORKFLOW:
 * 1. User unese vrednost u celiju
 * 2. Hook postavi status na 'saving' sa 800ms debounce
 * 3. Pošalje PATCH sa If-Match header-om (ETag)
 * 4. Ako OK (200) -> 'saved' status, novi ETag
 * 5. Ako 409 Conflict -> prikaži ConflictDialog
 * 6. User odabere 'refresh' ili 'overwrite'
 * 7. Nastavi sa novim ETag-om
 */

interface UseAutoSaveItemsProps {
  documentId: number;
  onConflict?: (itemId: number) => void;
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

  const initializeETags = useCallback((items: DocumentLineItemDto[]) => {
    eTagsRef.current.clear();
    items.forEach((item) => {
      eTagsRef.current.set(item.id, item.etag);
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
          status: 'saving' as SaveStatus,
          error: null,
          etag: currentETag,
        },
      }));

      try {
        // Konvertuj field u API format (camelCase -> camelCase)
        const patchData: PatchDocumentLineItemDto = {
          [field]: field.includes('Price') || field.includes('discount') || field.includes('quantity')
            ? parseFloat(String(value))
            : value,
        } as PatchDocumentLineItemDto;

        // KRITIČNO: Prosledi If-Match sa trenutnim ETag-om
        const response = await api.lineItem.patch(
          documentId,
          itemId,
          patchData,
          currentETag
        );

        // Ekstraktuj novi ETag iz response-a
        const newETag = response.etag;
        eTagsRef.current.set(itemId, newETag);

        // Setuj status na 'saved'
        setAutoSaveMap((prev) => ({
          ...prev,
          [itemId]: {
            id: itemId,
            status: 'saved' as SaveStatus,
            error: null,
            etag: newETag,
          },
        }));

        // Auto-reset status na 'idle' nakon 2 sekunde
        setTimeout(() => {
          setAutoSaveMap((prev) => ({
            ...prev,
            [itemId]: {
              ...prev[itemId],
              status: 'idle' as SaveStatus,
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
              status: 'error' as SaveStatus,
              error: conflictData.message,
              etag: conflictData.currentETag || currentETag,
            },
          }));

          // Pozovi callback za 409 Conflict - prikaži ConflictDialog
          if (onConflict) {
            onConflict(itemId);
          }
        } else {
          // Ostale greške
          const errorMessage =
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as { message: string }).message
              : 'Greška pri čuvanju';

          setAutoSaveMap((prev) => ({
            ...prev,
            [itemId]: {
              id: itemId,
              status: 'error' as SaveStatus,
              error: errorMessage,
              etag: currentETag,
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
      // Očisti prethodni timeout za ovu stavku
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
    async (itemId: number): Promise<DocumentLineItemDto | null> => {
      try {
        const item = await api.lineItem.get(documentId, itemId);
        eTagsRef.current.set(itemId, item.etag);
        return item;
      } catch (error) {
        console.error('Error refreshing item:', error);
        return null;
      }
    },
    [documentId]
  );

  // ==========================================
  // CLEANUP - očisti timeout-e
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
