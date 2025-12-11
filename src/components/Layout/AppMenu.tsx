// Moved from src/components/AppMenu.tsx
import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from '@mui/material';
import {
  Dashboard,
  Description,
  People,
  Inventory,
  ExpandLess,
  ExpandMore,
  ChevronRight,
  Settings,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactElement;
}

const menuSections: MenuSection[] = [
  {
    title: 'Pregled',
    items: [
      { label: 'Kontrolna tabla', path: '/dashboard', icon: <Dashboard /> },
    ],
  },
  {
    title: 'Dokumenti',
    items: [
      { label: 'Ulazni računi', path: '/documents', icon: <Description /> },
      { label: '🔍 Pretraga dokumenata', path: '/documents/search', icon: <SearchIcon /> },
      { label: 'Nivelacioni dokumenti', path: '/documents/nd', icon: <Description /> },
    ],
  },
  {
    title: 'Šifarnici',
    items: [
      { label: 'Partneri', path: '/partners', icon: <People /> },
      { label: 'Artikli', path: '/articles', icon: <Inventory /> },
    ],
  },
  {
    title: 'Podešavanja',
    items: [
      { label: 'Sistem', path: '/settings', icon: <Settings /> },
    ],
  },
];

export const AppMenu: React.FC = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = React.useState<string[]>(['Pregled', 'Dokumenti']);

  const handleToggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Box>
      {menuSections.map((section) => (
        <React.Fragment key={section.title}>
          <ListItemButton
            onClick={() => handleToggleSection(section.title)}
            sx={{ py: 1.5, px: 2 }}
          >
            <ListItemText
              primary={section.title}
              primaryTypographyProps={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            />
            {openSections.includes(section.title) ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={openSections.includes(section.title)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {section.items.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    pl: 4,
                    py: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                  {location.pathname === item.path && <ChevronRight />}
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default AppMenu;
