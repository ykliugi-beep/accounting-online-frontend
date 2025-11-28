import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '../config/env';
import type { ApiErrorResponse } from '../types/api.types';

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - Add Auth Token
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    // Use JWT token from environment for testing
    // In production, this should come from auth store/context
    const token = ENV.JWT_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// RESPONSE INTERCEPTOR - Error Handling
// ============================================================================

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      // Server responded with error status
      const apiError: ApiErrorResponse = {
        status: error.response.status,
        message: error.response.data?.message || error.response.data?.detail || error.message,
        title: error.response.data?.title,
        type: error.response.data?.type,
        errors: error.response.data?.errors,
        traceId: error.response.data?.traceId,
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'Network error - no response from server',
      });
    } else {
      // Something else happened
      return Promise.reject({
        status: -1,
        message: error.message,
      });
    }
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build URL with query parameters
 */
export function buildUrl(path: string, params?: Record<string, any>): string {
  if (!params) return path;

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Extract ETag from response headers
 */
export function extractETag(response: AxiosResponse): string | null {
  return response.headers['etag'] || null;
}

/**
 * Create config with If-Match header for ETag concurrency
 */
export function withETag(etag: string, config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...config?.headers,
      'If-Match': etag,
    },
  };
}

export default apiClient;
