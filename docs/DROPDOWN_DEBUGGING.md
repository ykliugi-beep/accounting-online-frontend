# 🔍 Dropdown Debugging Guide

## 💡 Problem Description

Dropdown fields on `DocumentCreatePage` show **"No options"** despite Backend API returning data successfully (confirmed with 200 OK status in audit log).

---

## 👀 Visual Checklist

### 1. Open Browser Console (F12 → Console)

**Expected console output when everything works:**

```javascript
📦 Combos Data Received: {
  partners: Array(5),
  orgUnits: Array(3),
  taxationMethods: Array(2),
  referents: Array(10),
  documentsND: Array(0),
  taxRates: Array(3),
  articles: Array(50),
  costTypes: Array(4),
  costDistributionMethods: Array(3)
}

👥 Partners: [
  {id: 1, code: "P001", name: "Partner A", statusNabavka: "Aktivan"},
  {id: 2, code: "P002", name: "Partner B", statusNabavka: "Aktivan"},
  ...
]

🏪 Org Units: [
  {id: 1, code: "M1", name: "Magacin 1"},
  {id: 2, code: "M2", name: "Magacin 2"},
  ...
]

💼 Taxation Methods: [
  {id: 1, description: "Opšte"},
  {id: 2, description: "Posebno"},
  ...
]

👤 Referents: [
  {id: 1, code: "R001", fullName: "John Doe"},
  {id: 2, code: "R002", fullName: "Jane Smith"},
  ...
]
```

---

## 🐞 Common Problems & Solutions

### Problem 1: Empty Arrays

**Console shows:**
```javascript
📦 Combos Data Received: {
  partners: [],  // ← Empty!
  orgUnits: [],  // ← Empty!
  ...
}
```

**🔴 Root Cause:** Database is empty or Stored Procedures not returning data

**✅ Solution:**

1. **Check database:**
   ```sql
   SELECT COUNT(*) FROM tblPartner WHERE StatusNabavka = 'Aktivan'
   SELECT COUNT(*) FROM tblOrganizacionaJedinica
   SELECT COUNT(*) FROM tblZaposleni WHERE Status = 'Aktivan'
   ```

2. **Test Stored Procedures directly:**
   ```sql
   EXEC spPartnerComboStatusNabavka
   EXEC spOrganizacionaJedinicaCombo @Dokument_Tip_ID = 1
   EXEC spReferentCombo
   ```

---

### Problem 2: CORS / Network Error

**Console shows:**
```javascript
❌ Combos Error: {
  status: 0,
  message: "Network error - no response from server"
}
```

**🔴 Root Cause:** Backend not running or CORS misconfigured

**✅ Solution:**

1. **Check Backend is running:**
   ```bash
   curl http://localhost:5286/swagger
   ```

2. **Check HTTPS redirect is DISABLED in `Program.cs`:**
   ```csharp
   // ✅ Correct
   if (!app.Environment.IsDevelopment()) {
       app.UseHttpsRedirection();
   }
   ```

---

### Problem 3: 401 Unauthorized

**Console shows:**
```javascript
❌ Combos Error: {
  status: 401,
  message: "Unauthorized"
}
```

**✅ Solution:**

1. **Generate new token:**
   ```bash
   curl http://localhost:5286/api/v1/auth/test-token
   ```

2. **Update `.env.local`:**
   ```bash
   VITE_JWT_TOKEN=your-token-here
   ```

3. **Restart Frontend**

---

## 🧪 Testing Checklist

### Before Testing:

- [ ] Backend PR #229 merged
- [ ] Backend running on `http://localhost:5286`
- [ ] Frontend `.env.local` has valid JWT token
- [ ] Browser Console open (F12)

### Testing Steps:

1. [ ] Navigate to `http://localhost:3000/documents/vp/ur`
2. [ ] Check Console for `📦 Combos Data Received`
3. [ ] Verify arrays have data
4. [ ] Check dropdowns populate

---

**Last Updated:** 2025-12-02  
**Related PR:** #34
