import { describe, it, expect } from 'vitest';
import { extractETag, formatETagForHeader, isValidETag } from '../etag';
import type { AxiosResponse } from 'axios';

describe('etag utils', () => {
  describe('extractETag', () => {
    it('should extract etag from headers', () => {
      const response = {
        headers: { etag: '"abc123"' },
      } as unknown as AxiosResponse;
      expect(extractETag(response)).toBe('abc123');
    });

    it('should handle etag without quotes', () => {
      const response = {
        headers: { etag: 'abc123' },
      } as unknown as AxiosResponse;
      expect(extractETag(response)).toBe('abc123');
    });

    it('should handle case-insensitive header', () => {
      const response = {
        headers: { ETag: '"abc123"' },
      } as unknown as AxiosResponse;
      expect(extractETag(response)).toBe('abc123');
    });

    it('should return empty for missing etag', () => {
      const response = {
        headers: {},
      } as AxiosResponse;
      expect(extractETag(response)).toBe('');
    });
  });

  describe('formatETagForHeader', () => {
    it('should add quotes if missing', () => {
      expect(formatETagForHeader('abc123')).toBe('"abc123"');
    });

    it('should not double-quote', () => {
      expect(formatETagForHeader('"abc123"')).toBe('"abc123"');
    });

    it('should handle empty string', () => {
      expect(formatETagForHeader('')).toBe('');
    });
  });

  describe('isValidETag', () => {
    it('should validate non-empty etag', () => {
      expect(isValidETag('abc123')).toBe(true);
      expect(isValidETag('"abc123"')).toBe(true);
    });

    it('should reject empty/null/undefined', () => {
      expect(isValidETag('')).toBe(false);
      expect(isValidETag(null)).toBe(false);
      expect(isValidETag(undefined)).toBe(false);
    });
  });
});
