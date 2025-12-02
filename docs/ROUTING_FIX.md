# 🔧 Routing Fix - Как Приказати Форму Умјесто Dashboard-а

**Датум:** 02.12.2025  
**Проблем:** Кликом на "Улазни рачуни" приказује се Dashboard умјесто форме за креирање документа  
**Циљ:** Приказати комплетну форму са 3 TAB-a (Zaglavље, Stavke, Troškovi)

---

## 🔴 ТРЕНУТНИ PROBLEM

### Шта видим:
```
URL: http://localhost:3000/
Приказ: Dashboard са картицама ("Dokumenti ovog meseca", "Vrednost prometa", итд.)
```

### Шта треба да видим:
```
URL: http://localhost:3000/documents/vp/ur
Приказ: Форма "Улазна Калкулација VP" са:
  - TAB 1: Zaglavlje (14 поља + Avans PDV subform)
  - TAB 2: Stavke (Excel-like grid)
  - TAB 3: Troškovi (3 subforms)
```

---

## 🔍 ROOT CAUSE

### Проблем у App.tsx (линија 62):

```tsx
// ❌ ПОГРЕШНО:
<Route path="/documents/vp/ur" element={<DocumentListPage />} />
```

**Објашњење:**
- `DocumentListPage` = Листа докумената (табела са бројем, датумом, партнером, износом)
- **НЕ** = Форма за креирање/едитовање!

**Треба:**
- Када кликнем "Улазни рачуни" → Одмах отворити **форму за креирање** новог документа
- Или водити на **листу постојећих** докумената па кликом на "+ Нови" отворити форму

---

## ✅ РЕШЕЊЕ

### Опција A: Директно на Форму (Препоручено за MVP)

**`src/App.tsx` - Измени линије 62-79:**

```tsx
{/* Document Types - VP (Veleprodaja) */}
<Route path="/documents/vp/ur" element={<DocumentCreatePage docType="UR" />} />
<Route path="/documents/vp/fo" element={<DocumentCreatePage docType="FO" />} />
<Route path="/documents/vp/fz" element={<DocumentCreatePage docType="FZ" />} />
<Route path="/documents/vp/ar" element={<DocumentCreatePage docType="AR" />} />
<Route path="/documents/vp/pr" element={<DocumentCreatePage docType="PR" />} />
<Route path="/documents/vp/ro" element={<DocumentCreatePage docType="RO" />} />
<Route path="/documents/vp/rp" element={<DocumentCreatePage docType="RP" />} />
<Route path="/documents/vp/po" element={<DocumentCreatePage docType="PO" />} />
<Route path="/documents/vp/rv" element={<DocumentCreatePage docType="RV" />} />
<Route path="/documents/vp/ps" element={<DocumentCreatePage docType="PS" />} />
<Route path="/documents/vp/nv" element={<DocumentCreatePage docType="NV" />} />
<Route path="/documents/vp/kk" element={<DocumentCreatePage docType="KK" />} />
<Route path="/documents/vp/vs" element={<DocumentCreatePage docType="VS" />} />
<Route path="/documents/vp/mj" element={<DocumentCreatePage docType="MJ" />} />
<Route path="/documents/vp/op" element={<DocumentCreatePage docType="OP" />} />
<Route path="/documents/vp/id" element={<DocumentCreatePage docType="ID" />} />
<Route path="/documents/vp/tr" element={<DocumentCreatePage docType="TR" />} />
<Route path="/documents/vp/pd" element={<DocumentCreatePage docType="PD" />} />
```

**Предности:**
- ✅ Брзо - један клик на мени → форма
- ✅ Као у Access апликацији
- ✅ Погодно за MVP

---

### Опција B: Листа па Форма (Класичан Flow)

**`src/App.tsx` - Измени:**

```tsx
{/* Document Types - VP (Veleprodaja) */}
<Route path="/documents/vp/ur" element={<DocumentListPage docType="UR" />} />
<Route path="/documents/vp/ur/new" element={<DocumentCreatePage docType="UR" />} />
<Route path="/documents/vp/ur/:id" element={<DocumentDetailPage docType="UR" />} />
```

**Flow:**
1. Клик на "Улазни рачуни" → Листа докумената
2. Клик на "+ Нови Документ" → Форма за креирање
3. Клик на документ у листи → Форма за едитовање

**Предности:**
- ✅ Прегледније
- ✅ Можеш видети постојеће документе
- ✅ Web-like UX

---

## 📄 КОМПЛЕТАН App.tsx СА ОПЦИЈОМ A

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentListPage } from './pages/DocumentListPage';
import { DocumentCreatePage } from './pages/DocumentCreatePage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { useUIStore } from './store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const { theme: themeMode } = useUIStore();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: { main: '#1976d2' },
          secondary: { main: '#dc004e' },
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
      }),
    [themeMode]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              
              {/* Generic Documents */}
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/documents/new" element={<DocumentCreatePage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              
              {/* 🔴 ИЗМЕЊЕНО: VP Documents - Директно на форму */}
              <Route path="/documents/vp/ur" element={<DocumentCreatePage docType="UR" />} />
              <Route path="/documents/vp/fo" element={<DocumentCreatePage docType="FO" />} />
              <Route path="/documents/vp/fz" element={<DocumentCreatePage docType="FZ" />} />
              <Route path="/documents/vp/ar" element={<DocumentCreatePage docType="AR" />} />
              <Route path="/documents/vp/pr" element={<DocumentCreatePage docType="PR" />} />
              <Route path="/documents/vp/ro" element={<DocumentCreatePage docType="RO" />} />
              <Route path="/documents/vp/rp" element={<DocumentCreatePage docType="RP" />} />
              <Route path="/documents/vp/po" element={<DocumentCreatePage docType="PO" />} />
              <Route path="/documents/vp/rv" element={<DocumentCreatePage docType="RV" />} />
              <Route path="/documents/vp/ps" element={<DocumentCreatePage docType="PS" />} />
              <Route path="/documents/vp/nv" element={<DocumentCreatePage docType="NV" />} />
              <Route path="/documents/vp/kk" element={<DocumentCreatePage docType="KK" />} />
              <Route path="/documents/vp/vs" element={<DocumentCreatePage docType="VS" />} />
              <Route path="/documents/vp/mj" element={<DocumentCreatePage docType="MJ" />} />
              <Route path="/documents/vp/op" element={<DocumentCreatePage docType="OP" />} />
              <Route path="/documents/vp/id" element={<DocumentCreatePage docType="ID" />} />
              <Route path="/documents/vp/tr" element={<DocumentCreatePage docType="TR" />} />
              <Route path="/documents/vp/pd" element={<DocumentCreatePage docType="PD" />} />
              
              {/* 🔴 ИЗМЕЊЕНО: MP Documents - Директно на форму */}
              <Route path="/documents/mp/pm" element={<DocumentCreatePage docType="PM" />} />
              <Route path="/documents/mp/psm" element={<DocumentCreatePage docType="PSM" />} />
              <Route path="/documents/mp/vsm" element={<DocumentCreatePage docType="VSM" />} />
              <Route path="/documents/mp/mjm" element={<DocumentCreatePage docType="MJM" />} />
              <Route path="/documents/mp/idm" element={<DocumentCreatePage docType="IDM" />} />
              <Route path="/documents/mp/opm" element={<DocumentCreatePage docType="OPM" />} />
              <Route path="/documents/mp/kkm" element={<DocumentCreatePage docType="KKM" />} />
              <Route path="/documents/mp/nvm" element={<DocumentCreatePage docType="NVM" />} />
              <Route path="/documents/mp/oum" element={<DocumentCreatePage docType="OUM" />} />
              <Route path="/documents/mp/oim" element={<DocumentCreatePage docType="OIM" />} />
              <Route path="/documents/mp/rmz" element={<DocumentCreatePage docType="RMZ" />} />
              <Route path="/documents/mp/rpm" element={<DocumentCreatePage docType="RPM" />} />
              <Route path="/documents/mp/trm" element={<DocumentCreatePage docType="TRM" />} />
              <Route path="/documents/mp/dmk" element={<DocumentCreatePage docType="DMK" />} />
              
              {/* Остале руте остају исте... */}
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

---

## 🧪 ТЕСТИРАЊЕ

### 1. Измени App.tsx

```bash
# Frontend terminal
cd accounting-online-frontend
# Измени src/App.tsx као горе
```

### 2. Restartuj Frontend (ако је потребно)

```bash
npm run dev
```

### 3. Тест

1. **Отвори:** http://localhost:3000
2. **Кликни:** Лева страна мени → "Dokumenti" → "VP" → "Ulazni računi"
3. **Очекивано:**
   - URL: `http://localhost:3000/documents/vp/ur`
   - Приказ: **Форма за креирање** са 3 tab-а
   - **НЕ Dashboard**!

---

## ✅ ШТА СЕ ПРИКАЗУЈЕ НАКОН ИЗМЕНЕ

### TAB 1: Zaglavlje Dokumenta

```
┌─────────────────────────────────────────────────────────────┐
│ Zaglavlje Dokumenta                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Broj Dokumenta: [_____________]  Datum: [__/__/____]      │
│                                                             │
│  Dobavljač: [▼ Combobox - Partners]                       │
│  Magacin:   [▼ Combobox - Org Units]                      │
│  Oporezivanje: [▼ Combobox - Taxation Methods]            │
│  Referent:  [▼ Combobox - Referents]                      │
│                                                             │
│  Način Plaćanja: [▼]  Datum Dospeća: [__/__/____]         │
│  Valuta: [▼ RSD]  Kurs: [___]                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Avans PDV (subform)                                 │  │
│  │ Poreska Stopa | Osnovica | PDV | Ukupno            │  │
│  │ 20%          | 1000     | 200 | 1200               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [Save] [Cancel]                                            │
└─────────────────────────────────────────────────────────────┘
```

### TAB 2: Stavke Dokumenta

```
┌─────────────────────────────────────────────────────────────┐
│ Stavke Dokumenta (Excel-like grid)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [+ Dodaj Stavku]                                           │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Rb | Artikal      | Kol | Cena  | Rabat | Iznos  │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 1  | Artikal 1    | 10  | 1000  | 5%    | 9500   │   │
│  │ 2  | Artikal 2    | 5   | 2000  | 0%    | 10000  │   │
│  │ 3  | [▼ Izaberi]  | []  | []    | []    | []     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  Ukupno: 19.500 RSD                                         │
│                                                             │
│  [Autosave: Saved ✓]                                        │
└─────────────────────────────────────────────────────────────┘
```

### TAB 3: Troškovi Dokumenta

```
┌─────────────────────────────────────────────────────────────┐
│ Zavisni Troškovi                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [+ Dodaj Trošak]                                           │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Vrsta Dokumenta | Partner       | Iznos           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ Transport       | Partner X     | 5000            │   │
│  │ Carinska        | Partner Y     | 3000            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  Način Deljenja: [▼ Po Količini / Po Vrednosti]           │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Raspodela po Stavkama                              │   │
│  │ Artikal      | Učešće | Trošak Raspodeljen        │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ Artikal 1    | 50%    | 4000                      │   │
│  │ Artikal 2    | 50%    | 4000                      │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 ПРОВЕРА: Да ли ради?

### ✅ Успешно ако:

- [ ] URL је `http://localhost:3000/documents/vp/ur`
- [ ] Приказује се **форма** (не Dashboard)
- [ ] Има 3 tab-а: Zaglavlje, Stavke, Troškovi
- [ ] Combobox-ови се учитавају (Dobavljač, Magacin, итд.)
- [ ] Можеш да додаш ставке у grid
- [ ] Autosave ради (промени количину, чекај 800ms, види "Saved")
- [ ] Можеš да додаш трошкове

### ❌ Не ради ако:

- [ ] И даље види Dashboard
- [ ] Combobox-ови су празни или показују "Dummy Partner 1"
- [ ] Grid не дозвољава едитовање
- [ ] Autosave не ради

---

## 🚨 АКО И ДАЉЕ ВИДИ DASHBOARD

### Провери:

1. **App.tsx измене сачуване?**
   ```bash
   # Провери да ли је измена у фајлу
   cat src/App.tsx | grep "DocumentCreatePage docType"
   ```

2. **Frontend restartovan?**
   ```bash
   # Ctrl+C
   # npm run dev
   ```

3. **Browser cache?**
   ```bash
   # Hard refresh: Ctrl+Shift+R
   # Или отвори Incognito/Private window
   ```

4. **URL тачан?**
   ```
   ✅ http://localhost:3000/documents/vp/ur
   ❌ http://localhost:3000/  (Dashboard је root route!)
   ```

---

## 📝 NEXT STEPS

### Након успешног приказа форме:

1. **Провери CORS + JWT Token** (види BACKEND_CORS_FIX.md)
2. **Тестирај combobox-ове** - да ли приказују реалне податке?
3. **Тестирај Save** - да ли се чува у бази?
4. **Тестирај Grid Autosave** - да ли ради 800ms debounce?
5. **Тестирај ETag Conflict** - отвори у 2 tab-а, мењај исту ставку

---

## 🎯 SUMMARY

**Проблем:** Routing води на погрешну страницу (Dashboard умјесто форме)

**Решење:** Измени `src/App.tsx` - замени `DocumentListPage` са `DocumentCreatePage`

**Време:** 2 минута измена + 1 минут рестарт

**Резултат:** Клик на "Улазни рачуни" → Форма са 3 tab-а ✅

---

**📅 Датум:** 02.12.2025  
**✅ Статус:** Решење спремно  
**⏱️ Време:** 3 минута  
**🎯 Циљ:** Приказ форме уместо Dashboard-а  
