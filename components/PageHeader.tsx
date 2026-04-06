'use client';
import { Bell, Search } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-actions">
        {children}
        <button className="header-icon-btn" id="header-search-btn" aria-label="Search">
          <Search size={17} />
        </button>
        <button className="header-icon-btn" id="header-notif-btn" aria-label="Notifications">
          <Bell size={17} />
          <span className="header-notif-dot" />
        </button>
        <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>SA</div>
      </div>
    </header>
  );
}
