// Environment configuration
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  API_TIMEOUT: 30000,
  AUTOSAVE_DEBOUNCE: 800,
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
} as const;

export type Env = typeof ENV;
