'use client';
import PageHeader from '@/components/PageHeader';
import { useReceiptStore } from '@/lib/store';
import SpendingChart from '@/components/SpendingChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';

export default function InsightsPage() {
  const { transactions, isLoaded, getDashboardStats } = useReceiptStore();

  if (!isLoaded) return <div style={{ padding: 40 }}>Loading...</div>;

  const stats = getDashboardStats();

  let dynamicInsights = [];
  let dynamicAlerts = [];

  if (transactions.length === 0) {
    dynamicInsights.push("Upload receipts to start generating automatic insights.");
  } else {
    dynamicInsights.push(`You spend the most on ${transactions[0].category.toUpperCase()}.`);
    dynamicInsights.push(`Out of ${stats.receiptCount} receipts uploaded, ${stats.flaggedCount} were flagged as potential risks.`);
    
    if (stats.flaggedCount > 0) {
      dynamicAlerts.push({
        type: 'warning',
        icon: '⚠️',
        title: `${stats.flaggedCount} Flagged Items DETECTED`,
        desc: `AI identified abnormalities in your spending habits representing ${stats.flaggedCount} transaction(s).`
      });
    } else {
      dynamicAlerts.push({
        type: 'info',
        icon: '✅',
        title: 'Clean Spending Profile',
        desc: `Everything looks good! Your past ${stats.receiptCount} receipts pass all automated fraud checks.`
      });
    }
  }

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
            {dynamicInsights.map((ins, i) => (
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
              <div><div className="card-title">Spending Trends</div><div className="card-subtitle">Lifetime view</div></div>
              <TrendingUp size={18} color="var(--color-primary)" />
            </div>
            <div className="card-body">
              <SpendingChart />
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Trend', val: 'Active' },
                  { label: 'Total Value', val: `₹${stats.totalAmount.toLocaleString()}` },
                  { label: 'Avg / Tx', val: stats.receiptCount > 0 ? `₹${Math.round(stats.totalAmount / stats.receiptCount).toLocaleString()}` : '0' },
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
            {dynamicAlerts.map((a, i) => (
              <div key={i} className="fraud-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="fraud-icon-wrap"><span style={{ fontSize: 20 }}>{a.icon}</span></div>
                <div style={{ flex: 1 }}>
                  <div className="fraud-title">{a.title}</div>
                  <div className="fraud-desc">{a.desc}</div>
                </div>
                {a.type !== 'info' && <button className="btn btn-ghost btn-sm" id={`alert-resolve-${i}`}>Resolve</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
