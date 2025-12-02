# React Components

**UI Components**

## Struktura

```
common/
├── Layout.tsx
├── Header.tsx
├── Navigation.tsx
├── LoadingSpinner.tsx
└── ErrorBoundary.tsx

document/
├── DocumentForm.tsx          # Main form sa 3 tab-a
├── DocumentHeader.tsx        # Tab 1: Osnovni podaci
├── DocumentItems.tsx         # Tab 2: Stavke
├── DocumentCosts.tsx         # Tab 3: Troškovi
├── ItemsTable.tsx            # KRITIČNO: Excel-like tabla
├── CostsTable.tsx
└── DocumentPreview.tsx

controls/
├── EditableCell.tsx          # Custom ćelija
├── ComboSelect.tsx           # Dropdown sa lookup
├── NumericInput.tsx
└── StatusBadge.tsx

dialogs/
├── ConflictDialog.tsx        # 409 handling
├── ConfirmDialog.tsx
└── ErrorDialog.tsx
```

## Component Hierarchy

```
<App>
  <Layout>
    <Header>
    <Navigation>
    <MainContent>
      <DocumentEditPage>
        <DocumentForm>
          <Tabs>
            <DocumentHeader />        # Tab 1
            <DocumentItems>           # Tab 2
              <ItemsTable>
                <EditableCell /> x N
              </ItemsTable>
            </DocumentItems>
            <DocumentCosts />         # Tab 3
          </Tabs>
        </DocumentForm>
        <ConflictDialog />  # Popup na 409
      </DocumentEditPage>
    </MainContent>
  </Layout>
</App>
```

## ItemsTable (KRITIČNO)

**Features:**

- Excel-like grid sa Material-UI TextFields
- Tab/Enter navigacija
- Autosave sa debounce
- ETag konkurentnost
- Status indicators (Saving, Saved, Error)
- Virtualizacija za 200+ redova

**Props:**

```typescript
interface ItemsTableProps {
  documentId: string;
}
```
