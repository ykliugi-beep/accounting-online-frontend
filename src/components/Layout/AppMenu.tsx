import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Description as DocumentsIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  AccountBalance as FinanceIcon,
  ExpandLess,
  ExpandMore,
  Assignment,
  Receipt,
  ShoppingCart,
  LocalShipping,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'documents',
    label: 'Dokumenti',
    icon: <DocumentsIcon />,
    children: [
      {
        id: 'vp',
        label: 'VP - Veleprodaja',
        icon: <Receipt />,
        children: [
          { id: 'ur', label: 'Ulazna Kalkulacija VP', path: '/documents/vp/ur' },
          { id: 'fo', label: 'Finansijsko Odobrenje', path: '/documents/vp/fo' },
          { id: 'fz', label: 'Finansijsko Zaduženje', path: '/documents/vp/fz' },
          { id: 'ar', label: 'Avansni Račun', path: '/documents/vp/ar' },
          { id: 'pr', label: 'Predračun', path: '/documents/vp/pr' },
          { id: 'ro', label: 'Račun Otpremnica', path: '/documents/vp/ro' },
          { id: 'rp', label: 'Reprezentacija', path: '/documents/vp/rp' },
          { id: 'po', label: 'Popis', path: '/documents/vp/po' },
          { id: 'rv', label: 'Revers', path: '/documents/vp/rv' },
          { id: 'ps', label: 'Početno Stanje', path: '/documents/vp/ps' },
          { id: 'nv', label: 'Nivelacija', path: '/documents/vp/nv' },
          { id: 'kk', label: 'Korekcija Količina', path: '/documents/vp/kk' },
          { id: 'vs', label: 'Višak', path: '/documents/vp/vs' },
          { id: 'mj', label: 'Manjak', path: '/documents/vp/mj' },
          { id: 'op', label: 'Otpis', path: '/documents/vp/op' },
          { id: 'id', label: 'Interna Dostavnica', path: '/documents/vp/id' },
          { id: 'tr', label: 'Trebovanje', path: '/documents/vp/tr' },
          { id: 'pd', label: 'Predatnica', path: '/documents/vp/pd' },
        ],
      },
      {
        id: 'mp',
        label: 'MP - Maloprodaja',
        icon: <ShoppingCart />,
        children: [
          { id: 'pm', label: 'Popis MP', path: '/documents/mp/pm' },
          { id: 'psm', label: 'Početno Stanje MP', path: '/documents/mp/psm' },
          { id: 'vsm', label: 'Višak MP', path: '/documents/mp/vsm' },
          { id: 'mjm', label: 'Manjak MP', path: '/documents/mp/mjm' },
          { id: 'idm', label: 'Interna Dostavnica MP', path: '/documents/mp/idm' },
          { id: 'opm', label: 'Otpis MP', path: '/documents/mp/opm' },
          { id: 'kkm', label: 'Korekcija Količina MP', path: '/documents/mp/kkm' },
          { id: 'nvm', label: 'Nivelacija MP', path: '/documents/mp/nvm' },
          { id: 'oum', label: 'Otprema u Maloprodaju', path: '/documents/mp/oum' },
          { id: 'oim', label: 'Otprema iz Maloprodaje', path: '/documents/mp/oim' },
          { id: 'rmz', label: 'Račun MP-Zbirni', path: '/documents/mp/rmz' },
          { id: 'rpm', label: 'Reprezentacija MP', path: '/documents/mp/rpm' },
          { id: 'trm', label: 'Trebovanje MP', path: '/documents/mp/trm' },
          { id: 'dmk', label: 'Direktna MP Kalkulacija', path: '/documents/mp/dmk' },
        ],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Stanja Magacina',
    icon: <InventoryIcon />,
    children: [
      { id: 'stock', label: 'Robna Evidencija', path: '/inventory/stock' },
    ],
  },
  {
    id: 'master-data',
    label: 'Osnovni Podaci',
    icon: <SettingsIcon />,
    children: [
      { id: 'payment-types', label: 'Vrste Plaćanja', path: '/master-data/payment-types' },
      { id: 'banks', label: 'Banke', path: '/master-data/banks' },
      { id: 'places', label: 'Mesta', path: '/master-data/places' },
      { id: 'countries', label: 'Države', path: '/master-data/countries' },
      { id: 'categories', label: 'Kategorije', path: '/master-data/categories' },
      { id: 'org-units', label: 'Organizacione Jedinice', path: '/master-data/org-units' },
      { id: 'territories', label: 'Teritorije', path: '/master-data/territories' },
      { id: 'invoice-types', label: 'Vrste Ulaznih Računa', path: '/master-data/invoice-types' },
      { id: 'articles', label: 'Artikli i Usluge', path: '/master-data/articles' },
      { id: 'units', label: 'Jedinice Mera', path: '/master-data/units' },
      { id: 'tax-rates', label: 'Poreske Stope', path: '/master-data/tax-rates' },
      { id: 'currencies', label: 'Valute', path: '/master-data/currencies' },
      { id: 'vehicles', label: 'Vozila', path: '/master-data/vehicles' },
      { id: 'vehicle-models', label: 'Modeli Vozila', path: '/master-data/vehicle-models' },
    ],
  },
  {
    id: 'finance',
    label: 'Finansije',
    icon: <FinanceIcon />,
    path: '/finance',
  },
];

export const AppMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['documents']);

  const handleToggle = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleToggle(item.id);
              } else if (item.path) {
                handleNavigate(item.path);
              }
            }}
            selected={active}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: level === 0 ? '0.95rem' : '0.875rem',
                fontWeight: level === 0 ? 600 : 400,
              }}
            />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          ERP Accounting
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Online sistem
        </Typography>
      </Box>
      <List sx={{ pt: 2 }}>{menuItems.map((item) => renderMenuItem(item))}</List>
    </Box>
  );
};
