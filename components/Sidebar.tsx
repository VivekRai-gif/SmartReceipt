'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Upload, ScanLine, BarChart3,
  ShieldAlert, MessageSquare, Settings, Zap, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Main Menu', items: [
    { icon: LayoutDashboard, label: 'Dashboard',       href: '/dashboard',  badge: null,  badgeType: '' },
    { icon: Upload,          label: 'Upload Receipt',  href: '/upload',     badge: null,  badgeType: '' },
    { icon: ScanLine,        label: 'Analysis',        href: '/analysis',   badge: '3',   badgeType: '' },
    { icon: BarChart3,       label: 'Insights',        href: '/insights',   badge: null,  badgeType: '' },
  ]},
  { label: 'Security & AI', items: [
    { icon: ShieldAlert,     label: 'Fraud Detection', href: '/fraud',      badge: '2',   badgeType: 'danger' },
    { icon: MessageSquare,   label: 'AI Assistant',    href: '/chat',       badge: null,  badgeType: '' },
  ]},
  { label: 'System', items: [
    { icon: Settings,        label: 'Settings',        href: '/settings',   badge: null,  badgeType: '' },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-icon">
            <Zap size={18} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <div>SmartReceipt</div>
            <div className="sidebar-logo-sub">AI Expense Intelligence</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => router.push(item.href)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="sidebar-nav-icon" size={18} />
                  {item.label}
                  {item.badge && (
                    <span className={`sidebar-badge${item.badgeType === 'danger' ? ' danger' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">SA</div>
          <div>
            <div className="sidebar-user-name">Sarah Anderson</div>
            <div className="sidebar-user-role">Finance Manager</div>
          </div>
          <LogOut size={15} color="var(--text-sidebar-muted)" style={{ marginLeft: 'auto' }} />
        </div>
      </div>
    </aside>
  );
}
