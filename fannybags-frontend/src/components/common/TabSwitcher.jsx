import { useState } from 'react';
import './TabSwitcher.css';

export default function TabSwitcher({ tabs = [], onChange }) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index, tabs[index]);
  };

  // Default tabs if none provided
  const defaultTabs = [
    { id: 'hello', label: 'Hello', notification: 2 },
    { id: 'ui', label: 'UI', notification: 0 },
    { id: 'world', label: 'World', notification: 0 }
  ];

  const tabList = tabs.length > 0 ? tabs : defaultTabs;

  return (
    <div className="tab-container">
      <div className="tab-switcher">
        {tabList.map((tab, index) => (
          <div key={tab.id}>
            <input
              type="radio"
              id={`radio-${index + 1}`}
              name="tabs"
              checked={activeTab === index}
              onChange={() => handleTabChange(index)}
              style={{ display: 'none' }}
            />
            <label className="tab" htmlFor={`radio-${index + 1}`}>
              {tab.label}
              {tab.notification > 0 && (
                <span className="tab-notification">{tab.notification}</span>
              )}
            </label>
          </div>
        ))}
        <span className="glider"></span>
      </div>
    </div>
  );
}