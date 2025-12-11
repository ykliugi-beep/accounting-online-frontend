import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';

export interface TabConfig {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsComponentProps {
  tabs: TabConfig[];
  defaultTab?: string;
}

/**
 * ✅ Custom TabPanel component
 * MUI v5 doesn't export TabPanel, so we create our own
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  sx?: any;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, sx, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{
        ...sx,
        display: value !== index ? 'none' : 'block',
      }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const TabsComponent: React.FC<TabsComponentProps> = ({ tabs, defaultTab = '0' }) => {
  const defaultTabIndex = tabs.findIndex((tab) => tab.id === defaultTab);
  const [activeTab, setActiveTab] = useState(defaultTabIndex >= 0 ? defaultTabIndex : 0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: '2px solid #eee',
          backgroundColor: '#f5f5f5',
          '& .MuiTabs-indicator': {
            backgroundColor: '#1976d2',
            height: '3px',
          },
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={`${tab.id}-${index}`}
            label={tab.label}
            id={`tab-${tab.id}`}
            aria-controls={`tabpanel-${tab.id}`}
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: activeTab === index ? 600 : 500,
              color: activeTab === index ? '#1976d2' : '#666',
              '&:hover': {
                backgroundColor: '#eee',
              },
            }}
          />
        ))}
      </Tabs>

      {tabs.map((tab, index) => (
        <TabPanel
          key={`${tab.id}-panel-${index}`}
          value={activeTab}
          index={index}
          sx={{
            p: 0,
            backgroundColor: '#fff',
            '&.MuiTabPanel-root': {
              padding: 0,
            },
          }}
        >
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
};

export default TabsComponent;
