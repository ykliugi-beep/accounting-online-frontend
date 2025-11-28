// Environment configuration
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5286/api/v1',
  API_TIMEOUT: 30000,
  AUTOSAVE_DEBOUNCE: 800,
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  JWT_TOKEN: import.meta.env.VITE_JWT_TOKEN || '',
} as const;

export type Env = typeof ENV;
