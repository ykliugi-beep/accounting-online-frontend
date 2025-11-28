/**
 * Konstante za aplikaciju
 */

/**
 * Tipovi dokumenata
 */
export const DOCUMENT_TYPES = {
  // Veleprodaja (VP)
  UR: 'Ulazna Kalkulacija VP',
  FO: 'Finansijsko Odobrenje',
  FZ: 'Finansijsko Zaduženje',
  AR: 'Avansni Račun',
  PR: 'Predračun',
  RO: 'Račun Otpremnica',
  RP: 'Reprezentacija',
  PO: 'Popis',
  RV: 'Revers',
  PS: 'Početno Stanje',
  NV: 'Nivelacija',
  KK: 'Korekcija Količina',
  VS: 'Višak',
  MJ: 'Manjak',
  OP: 'Otpis',
  ID: 'Interna Dostavnica',
  TR: 'Trebovanje',
  PD: 'Predatnica',
  
  // Maloprodaja (MP)
  PM: 'Popis MP',
  PSM: 'Početno Stanje MP',
  VSM: 'Višak MP',
  MJM: 'Manjak MP',
  IDM: 'Interna Dostavnica MP',
  OPM: 'Otpis MP',
  KKM: 'Korekcija Količina MP',
  NVM: 'Nivelacija MP',
  OUM: 'Otprema u Maloprodaju',
  OIM: 'Otprema iz Maloprodaje',
  RMZ: 'Račun MP-Zbirni',
  RPM: 'Reprezentacija MP',
  TRM: 'Trebovanje MP',
  DMK: 'Direktna MP Kalkulacija',
} as const;

/**
 * Tipovi naloga
 */
export const TRANSACTION_TYPES = {
  IZ: 'Izvodi',
  UR: 'Ulazni Računi',
  KO: 'Kompenzacije',
  ON: 'Opšti Nalog',
  PS: 'Početno Stanje',
} as const;

/**
 * Statusi dokumenata
 */
export const DOCUMENT_STATUSES = {
  DRAFT: { id: 1, label: 'Draft', color: 'default' },
  ACTIVE: { id: 2, label: 'Aktivan', color: 'success' },
  CLOSED: { id: 3, label: 'Zatvoren', color: 'info' },
  CANCELLED: { id: 4, label: 'Storniran', color: 'error' },
} as const;

/**
 * Valute
 */
export const CURRENCIES = {
  RSD: { code: 'RSD', name: 'Srpski dinar', symbol: 'RSD' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  USD: { code: 'USD', name: 'Američki dolar', symbol: '$' },
} as const;

/**
 * Autosave debounce vreme (ms)
 */
export const AUTOSAVE_DEBOUNCE_MS = 800;

/**
 * React Query stale time (ms)
 */
export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minuta

/**
 * React Query cache time (ms)
 */
export const QUERY_CACHE_TIME = 10 * 60 * 1000; // 10 minuta

/**
 * Paginacija - default page size
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Virtualizacija - row height
 */
export const VIRTUAL_ROW_HEIGHT = 48;

/**
 * Maksimalan broj stavki za prikaz bez virtualizacije
 */
export const MAX_ITEMS_WITHOUT_VIRTUALIZATION = 50;

/**
 * Date format
 */
export const DATE_FORMAT = 'dd.MM.yyyy';

/**
 * DateTime format
 */
export const DATETIME_FORMAT = 'dd.MM.yyyy HH:mm';

/**
 * API timeout (ms)
 */
export const API_TIMEOUT = 30000; // 30 sekundi
