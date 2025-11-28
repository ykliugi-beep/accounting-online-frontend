/**
 * Formatiranje funkcije za prikaz podataka
 */

/**
 * Formatira iznos u valutu
 * @param amount Iznos
 * @param currency Kod valute (default: RSD)
 * @returns Formatiran string sa valutom
 */
export const formatCurrency = (amount: number, currency = 'RSD'): string => {
  return amount.toLocaleString('sr-RS', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formatira datum iz ISO string-a
 * @param dateStr ISO datum string
 * @returns Formatiran datum (dd.MM.yyyy)
 */
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('sr-RS');
};

/**
 * Formatira datum i vreme iz ISO string-a
 * @param dateStr ISO datum string
 * @returns Formatiran datum i vreme (dd.MM.yyyy HH:mm)
 */
export const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('sr-RS', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatira broj sa odredjenim brojem decimala
 * @param value Vrednost
 * @param decimals Broj decimala (default: 2)
 * @returns Formatiran broj
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return value.toLocaleString('sr-RS', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formatira procenat
 * @param value Vrednost (npr. 20 za 20%)
 * @returns Formatiran string sa % (npr. "20.00%")
 */
export const formatPercent = (value: number): string => {
  return `${formatNumber(value)}%`;
};

/**
 * Skraćuje tekst na određeni broj karaktera
 * @param text Tekst
 * @param maxLength Maksimalna dužina
 * @returns Skraćeni tekst sa ...
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
