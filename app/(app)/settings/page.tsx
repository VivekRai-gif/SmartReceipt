'use client';
import PageHeader from '@/components/PageHeader';
import { Bell, Moon, Globe, Shield, Database, Plug } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Configure your account and AI preferences" />
      <div className="page-content">
        <div style={{ maxWidth: 680 }}>
          {[
            { icon: <Plug size={18} />, title: 'AI Model', sub: 'Select LLM for extraction and insights', controls: (<select id="settings-model-select" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-base)', fontSize: 13, color: 'var(--text-primary)' }}><option>GPT-4o (Recommended)</option><option>GPT-3.5 Turbo</option><option>Gemini Pro</option></select>) },
            { icon: <Globe size={18} />, title: 'Currency', sub: 'Default currency for expense display', controls: (<select id="settings-currency-select" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-base)', fontSize: 13, color: 'var(--text-primary)' }}><option>₹ INR — Indian Rupee</option><option>$ USD — US Dollar</option><option>€ EUR — Euro</option></select>) },
            { icon: <Bell size={18} />, title: 'Fraud Alerts', sub: 'Get notified when a suspicious receipt is detected', controls: (<label id="settings-fraud-toggle" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }} /><span style={{ fontSize: 13 }}>Enabled</span></label>) },
            { icon: <Moon size={18} />, title: 'Theme', sub: 'UI appearance mode (coming soon)', controls: (<span className="badge badge-other">Coming Soon</span>) },
            { icon: <Database size={18} />, title: 'Storage', sub: 'MongoDB / Firebase data storage backend', controls: (<select id="settings-storage-select" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-base)', fontSize: 13, color: 'var(--text-primary)' }}><option>MongoDB (Active)</option><option>Firebase Firestore</option></select>) },
            { icon: <Shield size={18} />, title: 'API Key', sub: 'OpenAI API key for AI features', controls: (<input id="settings-api-key" type="password" placeholder="sk-•••••••••••••" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-base)', fontSize: 13, width: 200 }} />) },
          ].map((item, i) => (
            <div key={i} className="card animate-fade-in-up" style={{ marginBottom: 12, animationDelay: `${i * 60}ms` }}>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                </div>
                {item.controls}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" id="settings-cancel-btn">Cancel</button>
            <button className="btn btn-primary" id="settings-save-btn">Save Settings</button>
          </div>
        </div>
      </div>
    </>
  );
}
