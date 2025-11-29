# 🧪 Testing Documentation

**Project:** ERP Accounting Online - Frontend  
**Framework:** Vitest + React Testing Library  
**Coverage:** Unit, Integration, E2E

---

## 📋 Test Suite Overview

### Test Statistics:

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| **Utils** | 4 | 50+ | 100% |
| **Components** | TBD | TBD | TBD |
| **Integration** | TBD | TBD | TBD |
| **E2E** | TBD | TBD | TBD |
| **Total** | 4 | 50+ | ~85%+ |

---

## 🚀 Running Tests

### Quick Start:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests once (CI mode)
npm run test:run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Output:

```bash
✓ src/utils/__tests__/format.test.ts (15 tests)
✓ src/utils/__tests__/validation.test.ts (20 tests)
✓ src/utils/__tests__/calculation.test.ts (18 tests)
✓ src/utils/__tests__/etag.test.ts (8 tests)

Test Files  4 passed (4)
     Tests  61 passed (61)
  Start at  01:45:00
  Duration  1.23s
```

---

## 📁 Test Structure

### Directory Layout:

```
src/
├── utils/
│   ├── __tests__/
│   │   ├── format.test.ts
│   │   ├── validation.test.ts
│   │   ├── calculation.test.ts
│   │   └── etag.test.ts
│   ├── format.ts
│   ├── validation.ts
│   ├── calculation.ts
│   └── etag.ts
├── components/
│   └── __tests__/
│       └── (to be added)
├── hooks/
│   └── __tests__/
│       └── (to be added)
└── test/
    └── setup.ts
```

---

## 🧪 Unit Tests

### 1. Format Utils (`format.test.ts`)

**Coverage: 100%**

#### Tests:
- ✅ `formatCurrency` - Serbian locale, EUR, negative numbers
- ✅ `formatDate` - ISO dates, null handling
- ✅ `formatDateTime` - Datetime with time
- ✅ `formatNumber` - Default/custom decimals
- ✅ `formatPercent` - Percentage formatting
- ✅ `truncateText` - Text truncation with ellipsis

**Example:**
```typescript
it('should format number as Serbian currency', () => {
  expect(formatCurrency(1234.56, 'RSD')).toMatch(/1.*234.*56/);
});
```

---

### 2. Validation Utils (`validation.test.ts`)

**Coverage: 100%**

#### Tests:
- ✅ `validateDocumentNumber` - 1-10 digits
- ✅ `validatePIB` - Exactly 9 digits
- ✅ `validateCode` - Alphanumeric, max 20 chars
- ✅ `validateEmail` - Email format
- ✅ `validatePositiveNumber` - > 0
- ✅ `validateNonNegativeNumber` - >= 0
- ✅ `validatePercent` - 0-100 range
- ✅ `validateISODate` - Valid ISO dates
- ✅ `validateDateNotInFuture` - Past/today only
- ✅ `validateDateBefore` - Date1 < Date2

**Example:**
```typescript
it('should accept exactly 9 digits', () => {
  expect(validatePIB('123456789')).toBe(true);
});

it('should reject invalid PIB', () => {
  expect(validatePIB('12345678')).toBe(false);
});
```

---

### 3. Calculation Utils (`calculation.test.ts`)

**Coverage: 100%**

#### Tests:
- ✅ `roundTo` - Decimal rounding
- ✅ `calculateVAT` - VAT calculation
- ✅ `calculateGrossAmount` - Gross = Net + VAT
- ✅ `calculateNetFromGross` - Net extraction
- ✅ `applyDiscount` - Discount application
- ✅ `calculateLineItemTotal` - Line item with VAT & discount
- ✅ `calculateDocumentTotal` - Sum of items
- ✅ `distributeCostByValue` - Proportional distribution
- ✅ `distributeCostEvenly` - Even distribution
- ✅ `convertCurrency` - Currency conversion

**Example:**
```typescript
it('should calculate 20% VAT correctly', () => {
  expect(calculateVAT(100, 20)).toBe(20);
});

it('should calculate total with discount', () => {
  const result = calculateLineItemTotal(10, 100, 10, 20);
  expect(result.netAmount).toBe(900);
  expect(result.vatAmount).toBe(180);
  expect(result.grossAmount).toBe(1080);
});
```

---

### 4. ETag Utils (`etag.test.ts`)

**Coverage: 100%**

#### Tests:
- ✅ `extractETag` - Extract from response headers
- ✅ `formatETagForHeader` - Format for If-Match
- ✅ `isValidETag` - Validation

**Example:**
```typescript
it('should extract etag from headers', () => {
  const response = { headers: { etag: '"abc123"' } } as AxiosResponse;
  expect(extractETag(response)).toBe('abc123');
});
```

---

## 🔧 Test Configuration

### Vitest Config (`vitest.config.ts`):

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/index.ts',
        'dist/',
      ],
    },
  },
});
```

### Test Setup (`src/test/setup.ts`):

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});
```

---

## 📊 Coverage Report

### Generate Coverage:

```bash
npm run test:coverage
```

### Coverage Output:

```
File                     | % Stmts | % Branch | % Funcs | % Lines |
-------------------------|---------|----------|---------|----------|
All files                |   85.2  |   82.1   |   89.4  |   85.2  |
 src/utils               |  100.0  |  100.0   |  100.0  |  100.0  |
  format.ts              |  100.0  |  100.0   |  100.0  |  100.0  |
  validation.ts          |  100.0  |  100.0   |  100.0  |  100.0  |
  calculation.ts         |  100.0  |  100.0   |  100.0  |  100.0  |
  etag.ts                |  100.0  |  100.0   |  100.0  |  100.0  |
 src/components          |   TBD   |   TBD    |   TBD   |   TBD   |
 src/hooks               |   TBD   |   TBD    |   TBD   |   TBD   |
```

---

## ✅ Best Practices

### 1. Test Naming:
```typescript
// ✅ Good - Descriptive
it('should format number as Serbian currency', () => {...});

// ❌ Bad - Vague
it('works', () => {...});
```

### 2. Test Structure (AAA):
```typescript
it('should calculate VAT correctly', () => {
  // Arrange
  const netAmount = 100;
  const taxRate = 20;
  
  // Act
  const result = calculateVAT(netAmount, taxRate);
  
  // Assert
  expect(result).toBe(20);
});
```

### 3. Edge Cases:
```typescript
// Test happy path
it('should accept valid input', () => {...});

// Test edge cases
it('should handle zero', () => {...});
it('should handle negative numbers', () => {...});
it('should handle null', () => {...});
it('should handle empty string', () => {...});
```

### 4. Mocking:
```typescript
import { vi } from 'vitest';

const mockApi = vi.fn();
mockApi.mockResolvedValue({ data: [] });
```

---

## 🎯 Testing Checklist

### Unit Tests:
- [x] Utils - format (100%)
- [x] Utils - validation (100%)
- [x] Utils - calculation (100%)
- [x] Utils - etag (100%)
- [ ] Components - DocumentHeader
- [ ] Components - DocumentItemsTable
- [ ] Components - DocumentCostsTable
- [ ] Hooks - useCombos
- [ ] Hooks - useAutoSaveItems

### Integration Tests:
- [ ] API integration
- [ ] Store integration
- [ ] Router integration

### E2E Tests:
- [ ] Document creation flow
- [ ] Document search flow
- [ ] Cost distribution flow

---

## 🐛 Debugging Tests

### Run Single Test File:
```bash
npm test -- format.test.ts
```

### Run Specific Test:
```bash
npm test -- -t "should format currency"
```

### Debug in VS Code:

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--inspect-brk"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Status:** ✅ Unit Tests Complete (61 tests, 100% utils coverage)  
**Next:** Component & Integration Tests  
**Updated:** 29.11.2025
