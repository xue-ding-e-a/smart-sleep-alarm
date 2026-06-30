import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon, { IconName } from '../ui/Icon';
import './style.css';

interface TabItem {
  key: string;
  label: string;
  icon: IconName;
  path: string;
}

const tabs: TabItem[] = [
  { key: 'home', label: '首页', icon: 'home', path: '/home' },
  { key: 'sleep', label: '睡眠', icon: 'sleep', path: '/sleep' },
  { key: 'profile', label: '我的', icon: 'profile', path: '/profile' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-content">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`bottom-nav-item ${isActive(tab.path) ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.path)}
          >
            <div className="bottom-nav-icon">
              <Icon name={tab.icon} size={20} active={isActive(tab.path)} />
            </div>
            <span className="bottom-nav-label">{tab.label}</span>
            {isActive(tab.path) && <div className="bottom-nav-indicator" />}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
