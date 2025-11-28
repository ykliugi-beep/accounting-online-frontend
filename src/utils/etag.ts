/**
 * ETag helper funkcije za konkurentnost handling
 */

import type { AxiosResponse } from 'axios';

/**
 * Ekstraktuje ETag iz response headera
 * @param response Axios response
 * @returns ETag string bez navodnika
 */
export const extractETag = (response: AxiosResponse): string => {
  const etag = response.headers.etag || response.headers['ETag'];
  if (!etag) return '';
  
  // Ukloni navodnike ako postoje
  return etag.replace(/"/g, '');
};

/**
 * Formatira ETag za If-Match header
 * @param etag ETag string
 * @returns Formatiran ETag sa navodnicima
 */
export const formatETagForHeader = (etag: string): string => {
  if (!etag) return '';
  
  // Dodaj navodnike ako ne postoje
  if (etag.startsWith('"') && etag.endsWith('"')) {
    return etag;
  }
  
  return `"${etag}"`;
};

/**
 * Proverava da li je ETag validan
 * @param etag ETag string
 * @returns true ako je validan
 */
export const isValidETag = (etag: string | null | undefined): boolean => {
  if (!etag) return false;
  return etag.length > 0;
};
