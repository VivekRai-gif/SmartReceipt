'use client';
import PageHeader from '@/components/PageHeader';
import { AI_INSIGHTS } from '@/lib/mockData';
import SpendingChart from '@/components/SpendingChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';

const ALERTS = [
  { type: 'warning', icon: '⚠️', title: 'Food Spending Up 28%', desc: 'April food expenses are significantly higher than your 3-month average. Consider meal planning to reduce costs.' },
  { type: 'warning', icon: '🔁', title: 'Duplicate Receipt Detected', desc: 'Two identical Swiggy receipts for ₹438 were found on April 3rd. Review before final approval.' },
  { type: 'info', icon: '✈️', title: 'Travel Budget Alert', desc: 'MakeMyTrip booking used 85% of your monthly travel budget. Only ₹750 remaining.' },
];

export default function InsightsPage() {
  return (
    <>
      <PageHeader title="Insights" subtitle="AI-powered spending analysis and trend summaries" />
      <div className="page-content">
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Brain size={18} color="var(--color-primary)" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>AI-Generated Summaries</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {AI_INSIGHTS.map((ins, i) => (
              <div key={i} className="insight-card animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="insight-card-label">Smart Insight · #{i + 1}</div>
                <div className="insight-card-text">{ins}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <div><div className="card-title">Spending Trends</div><div className="card-subtitle">6-month historical view</div></div>
              <TrendingUp size={18} color="var(--color-primary)" />
            </div>
            <div className="card-body">
              <SpendingChart />
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Mar → Apr', val: '−21%' },
                  { label: 'Peak Month', val: 'Mar (₹9,500)' },
                  { label: 'Avg / Month', val: '₹7,333' },
                ].map((m) => (
                  <div key={m.label} style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'Outfit' }}>{m.val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Category Breakdown</div></div>
            <div className="card-body"><CategoryBreakdown /></div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={17} color="var(--color-primary)" /> Alerts & Unusual Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ALERTS.map((a, i) => (
              <div key={i} className="fraud-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="fraud-icon-wrap"><span style={{ fontSize: 20 }}>{a.icon}</span></div>
                <div style={{ flex: 1 }}>
                  <div className="fraud-title">{a.title}</div>
                  <div className="fraud-desc">{a.desc}</div>
                </div>
                <button className="btn btn-ghost btn-sm" id={`alert-resolve-${i}`}>Resolve</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
