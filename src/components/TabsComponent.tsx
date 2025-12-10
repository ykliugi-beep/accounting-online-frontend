import React, { useState } from 'react';
import styles from './TabsComponent.module.css';

export interface TabConfig {
  label: string;
  id: string;
  content: React.ReactNode;
}

interface TabsComponentProps {
  tabs: TabConfig[];
  defaultTab?: string;
}

export const TabsComponent: React.FC<TabsComponentProps> = ({
  tabs,
  defaultTab = tabs[0]?.id,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.navTabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${
              activeTab === tab.id ? styles.active : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabsContent}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${
              activeTab === tab.id ? styles.active : styles.inactive
            } ${styles.tabContent}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabsComponent;
