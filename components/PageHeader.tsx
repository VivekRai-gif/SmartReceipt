import { Bell, Search, X, Receipt, ShieldAlert, Award } from 'lucide-react';
import React, { useState } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const DUMMY_NOTIFS = [
  { id: 1, icon: <Receipt size={14} />, title: 'New Receipt Processed', time: '2m ago', color: '#3B82F6' },
  { id: 2, icon: <ShieldAlert size={14} />, title: 'Fraud Alert: Unusual Spend', time: '1h ago', color: '#F43F5E' },
  { id: 3, icon: <Award size={14} />, title: 'Goal Reached: Coffee Budget', time: '5h ago', color: '#10B981' },
];

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="page-header">
      <div style={{ display: isSearchOpen ? 'none' : 'block' }}>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>

      {isSearchOpen && (
        <div className="header-search-container animate-fade-in" style={{ flex: 1, marginRight: 24 }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search receipts, categories, or insights..." 
            autoFocus
            className="header-search-input"
            onBlur={() => !isSearchOpen && setIsSearchOpen(false)}
          />
          <button onClick={() => setIsSearchOpen(false)} className="search-close-btn">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="header-actions">
        {children}
        <button 
          className={`header-icon-btn${isSearchOpen ? ' active' : ''}`} 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Search"
        >
          <Search size={17} />
        </button>
        
        <div style={{ position: 'relative' }}>
          <button 
            className={`header-icon-btn${isNotifOpen ? ' active' : ''}`}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="header-notif-dot" />
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown animate-fade-in-up">
              <div className="notif-header">Notifications</div>
              <div className="notif-list">
                {DUMMY_NOTIFS.map(n => (
                  <div key={n.id} className="notif-item">
                    <div className="notif-icon-wrap" style={{ background: `${n.color}15`, color: n.color }}>
                      {n.icon}
                    </div>
                    <div className="notif-content">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notif-footer">View all notifications</div>
            </div>
          )}
        </div>

        <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: 13, cursor: 'pointer' }}>VR</div>
      </div>
    </header>
  );
}
