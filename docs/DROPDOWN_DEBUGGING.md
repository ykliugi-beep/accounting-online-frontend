# 🔍 Dropdown Debugging Guide

## 💡 Problem Description

Dropdown fields on `DocumentCreatePage` show **"No options"** despite Backend API returning data successfully.

---

## 👀 Quick Checklist

### 1. Open Browser Console (F12)

**Expected output when everything works:**

```javascript
📦 Combos Data Received: {
  partners: Array(5),
  orgUnits: Array(3),
  taxationMethods: Array(2),
  referents: Array(10),
  documentsND: Array(X),  // ← Should have data!
  taxRates: Array(3),
  articles: Array(50),
  ...
}

👥 Partners: [{id: 1, code: "P001", name: "Partner A"}, ...]
🏪 Org Units: [{id: 1, code: "M1", name: "Magacin 1"}, ...]
💼 Taxation Methods: [{id: 1, description: "Opšte"}, ...]
👤 Referents: [{id: 1, code: "R001", fullName: "John Doe"}, ...]
📄 Documents ND: [{id: 1, documentNumber: "ND-2025-001"}, ...]
```

---

## 🐞 Common Problems

### Problem 1: Empty Arrays

**Console shows:**
```javascript
📦 Combos Data Received: { partners: [], orgUnits: [], ... }
```

**🔴 Root Cause:** Database is empty

**✅ Solution:** Check database has data

```sql
SELECT COUNT(*) FROM tblPartner WHERE StatusNabavka = 'Aktivan'
SELECT COUNT(*) FROM tblOrganizacionaJedinica
SELECT COUNT(*) FROM tblZaposleni WHERE Status = 'Aktivan'
```

---

### Problem 2: Network Error

**Console shows:**
```javascript
❌ Combos Error: { status: 0, message: "Network error" }
```

**✅ Solution:**

1. Check Backend is running:
   ```bash
   curl http://localhost:5286/swagger
   ```

2. Check CORS configuration in `Program.cs`

---

### Problem 3: 401 Unauthorized

**Console shows:**
```javascript
❌ Combos Error: { status: 401, message: "Unauthorized" }
```

**✅ Solution:**

1. Generate new JWT token
2. Update `.env.local`:
   ```bash
   VITE_JWT_TOKEN=your-token-here
   ```
3. Restart Frontend

---

## 🧪 Testing Steps

1. [ ] Backend running on `http://localhost:5286`
2. [ ] Frontend running on `http://localhost:3000`
3. [ ] Navigate to `/documents/vp/ur`
4. [ ] Open Console (F12)
5. [ ] Check for `📦 Combos Data Received`
6. [ ] Verify dropdown options appear

---

**Last Updated:** 2025-12-02  
**Related PR:** #35
