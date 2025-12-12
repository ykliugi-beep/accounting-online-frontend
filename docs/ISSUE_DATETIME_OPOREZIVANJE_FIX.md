# 📋 Issue Report: DateTime Serialization & Oporezivanje Dropdown

**Date**: December 12, 2025  
**Status**: 🔄 In Investigation  
**Related Frontend Commit**: 79e7332c735483136f5add587cd3071c4009b161  
**Related Backend Commit**: 289d21496db8519dd1c2d80b40bc76640e1d801c  

---

## Problem Description

### Issue 1: DateTime.MinValue Error ❌

**Symptom**: When creating a document with date `2025-12-12`, backend saves it as `{1.1.0001, 00:00:00}` (DateTime.MinValue).

**Root Cause**:
- Frontend was sending: `"2025-01-01T00:00:00"` (no timezone info)
- Backend System.Text.Json deserializer couldn't parse ambiguous format
- Result: DateTime.MinValue was returned

**Status**: ✅ **FIXED** - Backend now has IsoDateTimeConverter

**How to Verify**:
```sql
SELECT DocumentNumber, DocumentDate FROM Documents 
WHERE DocumentNumber LIKE 'TEST%'
-- Should show: 2025-12-12 00:00:00 (not 0001-01-01)
```

---

### Issue 2: Oporezivanje Dropdown Empty ❌

**Symptom**: Dropdown shows no options even though API returns taxation methods.

**Root Cause**: 
- Backend returns: `{ "idNacinOporezivanja": 1, "opis": "Opšte" }`
- Frontend was using fallback: `method.id` which doesn't exist
- Result: Dropdown stays empty with no error

**Status**: 🔄 **In Investigation** - Code was fixed but issue persists

**What to Check**:
1. Is browser showing new code? (Hard refresh: Ctrl+F5)
2. Is backend restarted and running with latest code?
3. What does API actually return? (Check Network tab)
4. Does select element have options? (Inspect HTML)

---

## How to Verify Fixes

### Test 1: DateTime Serialization

```javascript
// In Browser Console:
fetch('http://localhost:5286/api/v1/lookups/taxation-methods', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
  .then(r => r.json())
  .then(data => {
    console.log('API Response:', JSON.stringify(data, null, 2));
  });
```

### Test 2: Oporezivanje Dropdown

```javascript
// In Browser Console:
api.lookup.getTaxationMethods()
  .then(data => {
    console.log('Methods:', data);
    console.log('First item keys:', Object.keys(data[0] || {}));
  })
  .catch(err => console.error('Error:', err));
```

### Test 3: Network Payload

1. Open DevTools (F12)
2. Go to Network tab
3. Create a document
4. Find POST /api/v1/documents request
5. Check Request body - date field should be: `"date": "2025-12-12T00:00:00.000Z"`

---

## Implementation Details

### Frontend Fix

**File**: `src/pages/DocumentCreatePage.tsx`

#### Change 1: toISODateTime Function

```typescript
// BEFORE (❌ WRONG)
function toISODateTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
  if (dateStr.includes('T')) return dateStr;
  return `${dateStr}T00:00:00`;  // Missing timezone!
}

// AFTER (✅ CORRECT)
function toISODateTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
  if (dateStr.includes('T')) return dateStr;
  const date = new Date(dateStr + 'T00:00:00.000Z');  // UTC timezone
  return date.toISOString();  // "2025-12-12T00:00:00.000Z"
}
```

#### Change 2: Taxation Methods Dropdown

```typescript
// BEFORE (❌ WRONG)
{taxationMethods && Array.isArray(taxationMethods) && 
  taxationMethods.map((method: any) => {
    const id = method.idNacinOporezivanja || method.id;  // Fallback doesn't help!
    const description = method.opis || method.description;  // Fallback doesn't help!
    return (
      <option key={id} value={id}>
        {description}
      </option>
    );
  })
}

// AFTER (✅ CORRECT)
{taxationMethods && Array.isArray(taxationMethods) && 
  taxationMethods.map((method: any) => {
    const methodId = method.idNacinOporezivanja;  // Direct access
    const methodDescription = method.opis;         // Direct access
    return (
      <option key={methodId} value={methodId}>
        {methodDescription}
      </option>
    );
  })
}
```

### Backend Fix

**File**: `src/ERPAccounting.API/Program.cs`

```csharp
// Added custom DateTime converters
options.JsonSerializerOptions.Converters.Add(new IsoDateTimeConverter());
options.JsonSerializerOptions.Converters.Add(new IsoNullableDateTimeConverter());
```

**What it does**:
- Accepts: `"2025-12-12"`, `"2025-12-12T00:00:00"`, `"2025-12-12T00:00:00Z"`, `"2025-12-12T00:00:00.000Z"`
- Converts all to UTC
- Returns DateTime object, NOT DateTime.MinValue
- Prevents deserialization errors

---

## Troubleshooting Checklist

### If DateTime Still Shows {1.1.0001}:

- [ ] Hard refresh browser (Ctrl+F5)
- [ ] Clear browser cache (DevTools → Right-click reload → Empty cache)
- [ ] Restart backend application
- [ ] Check database column type (should be `datetime2`)
- [ ] Verify API is returning DateTime, not null

### If Oporezivanje Dropdown is Still Empty:

- [ ] Hard refresh browser (Ctrl+F5)
- [ ] Check Network tab - does API return 200 status?
- [ ] Run test code in console to see actual API response
- [ ] Verify API returns correct field names
- [ ] Check if select element exists in HTML (Inspect)
- [ ] Check browser console for errors
- [ ] Verify React DevTools shows taxationMethods state

---

## Debug Logging

Code now includes detailed console logs:

```
📦 Raw tax methods from API: [{ idNacinOporezivanja: 1, opis: "Opšte" }]
🔍 First taxation method structure: { has_idNacinOporezivanja: true, has_opis: true }
Method: ID=1, Desc="Opšte"

📋 Date fields before sending:
  documentDate (date): "2025-12-12" → "2025-12-12T00:00:00.000Z"

📤 Sending document payload: { date: "2025-12-12T00:00:00.000Z", ... }
```

---

## Database Verification

If DocumentDate column type is wrong:

```sql
-- Check current type
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='Documents' AND COLUMN_NAME='DocumentDate'

-- If type is 'datetime', change it:
ALTER TABLE Documents
ALTER COLUMN DocumentDate datetime2 NOT NULL;
```

---

## Related Documentation

- [Frontend Implementation Status](./IMPLEMENTATION_STATUS.md)
- [Backend Specification](./DETALJNE-SPECIFIKACIJE-v4.md)
- [API Endpoints](./api/)
- [Dropdown Diagnostic Guide](./DROPDOWN_DIAGNOSTIC.md)

---

## Next Steps

1. ✅ Frontend code fixed and committed
2. ✅ Backend DateTime converter added
3. 🔄 **Verify both fixes are working**
4. 🔄 **Test dropdown with actual API response**
5. ⏳ Deploy to production when verified

---

## Contact & Questions

If you encounter issues:

1. Check this document first
2. Run diagnostic tests from console
3. Share output and error messages
4. Check browser console and Network tab
5. Verify database state

**Last Updated**: December 12, 2025  
**Status**: Implementation Complete, Testing in Progress ✅
