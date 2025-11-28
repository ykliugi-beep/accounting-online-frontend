/**
 * Validacione funkcije za forme
 */

/**
 * Validira broj dokumenta
 * Pravila: 1-10 cifara
 */
export const validateDocumentNumber = (num: string): boolean => {
  return /^\d{1,10}$/.test(num);
};

/**
 * Validira PIB (Poreski Identifikacioni Broj)
 * Pravila: tačno 9 cifara
 */
export const validatePIB = (pib: string): boolean => {
  return /^\d{9}$/.test(pib);
};

/**
 * Validira šifru (alfanumerički, max 20 karaktera)
 */
export const validateCode = (code: string): boolean => {
  return /^[A-Za-z0-9-_]{1,20}$/.test(code);
};

/**
 * Validira email adresu
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validira pozitivan broj
 */
export const validatePositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Validira pozitivan broj ili nula
 */
export const validateNonNegativeNumber = (value: number): boolean => {
  return !isNaN(value) && value >= 0;
};

/**
 * Validira procenat (0-100)
 */
export const validatePercent = (value: number): boolean => {
  return !isNaN(value) && value >= 0 && value <= 100;
};

/**
 * Validira datum u ISO formatu
 */
export const validateISODate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validira da datum nije u budućnosti
 */
export const validateDateNotInFuture = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  return date <= now;
};

/**
 * Validira da je datum1 pre datum2
 */
export const validateDateBefore = (date1Str: string, date2Str: string): boolean => {
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);
  return date1 < date2;
};
