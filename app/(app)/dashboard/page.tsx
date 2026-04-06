'use client';
import PageHeader from '@/components/PageHeader';
import TransactionList from '@/components/TransactionList';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import SpendingChart from '@/components/SpendingChart';
import { useReceiptStore } from '@/lib/store';
import { TrendingUp, TrendingDown, Receipt, ShieldAlert, ArrowRight, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { transactions, isLoaded, getDashboardStats } = useReceiptStore();

  if (!isLoaded) return <div style={{ padding: 40 }}>Loading...</div>;

  const stats = getDashboardStats();
  const maxTx = transactions.length > 0 ? transactions.reduce((a, b) => a.amount > b.amount ? a : b) : null;

  const STATS_DATA = [
    {
      label: 'Total Spend',
      value: `₹${stats.totalAmount.toLocaleString('en-IN')}`,
      change: 'Lifetime tracking',
      dir: 'up',
      icon: <Receipt size={20} color="#F97316" />,
      iconBg: 'rgba(249,115,22,0.1)',
      highlight: false,
    },
    {
      label: 'Largest Expense',
      value: maxTx ? `₹${maxTx.amount.toLocaleString()}` : '₹0',
      change: maxTx ? maxTx.merchant : 'No data',
      dir: 'neutral',
      icon: <TrendingUp size={20} color="#6366F1" />,
      iconBg: 'rgba(99,102,241,0.1)',
      highlight: false,
    },
    {
      label: 'Receipts Scanned',
      value: stats.receiptCount.toString(),
      change: 'Dynamic store',
      dir: 'up',
      icon: <TrendingDown size={20} color="#10B981" />,
      iconBg: 'rgba(16,185,129,0.1)',
      highlight: false,
    },
    {
      label: 'Fraud Alerts',
      value: stats.flaggedCount.toString(),
      change: stats.flaggedCount > 0 ? 'Review required' : 'No alerts',
      dir: 'down',
      icon: <ShieldAlert size={20} color="#000" />,
      iconBg: 'transparent',
      highlight: stats.flaggedCount > 0,
    },
  ];

  let aiInsights = [];
  if (transactions.length === 0) {
    aiInsights = ["No data yet! Try uploading a receipt to generate automatic financial insights."];
  } else {
    if (stats.flaggedCount > 0) aiInsights.push(`You have ${stats.flaggedCount} flagged receipts require your review. Please verify them immediately.`);
    if (maxTx) aiInsights.push(`Your largest expense overall is ${maxTx.merchant} at ₹${maxTx.amount.toLocaleString()}.`);
    aiInsights.push(`You have scanned ${stats.receiptCount} receipts into the system, totaling ₹${stats.totalAmount.toLocaleString('en-IN')}.`);
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Real-time Financial Overview">
        <button className="btn btn-primary btn-sm" id="dash-upload-btn" onClick={() => router.push('/upload')}>
          + Upload Receipt
        </button>
      </PageHeader>

      <div className="page-content animate-fade-in-up">
        {/* Stat Cards */}
        <div className="stat-cards-grid stagger-children">
          {STATS_DATA.map((s) => (
            <div key={s.label} className={`stat-card animate-fade-in-up${s.highlight ? ' highlight' : ''}`}>
              <div className="stat-card-icon" style={{ background: s.highlight ? 'rgba(0,0,0,0.12)' : s.iconBg }}>
                {s.icon}
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className={`stat-change${s.dir === 'up' ? ' up' : s.dir === 'down' ? ' down' : ''}`}>
                {s.dir === 'up' && <TrendingUp size={12} />}
                {s.dir === 'down' && <TrendingDown size={12} />}
                {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Trend Overview</div>
                <div className="card-subtitle">Spending trends over time</div>
              </div>
            </div>
            <div className="card-body"><SpendingChart /></div>
          </div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Category Breakdown</div>
                <div className="card-subtitle">Current Data</div>
              </div>
            </div>
            <div className="card-body"><CategoryBreakdown /></div>
          </div>
        </div>

        {/* AI Insights + Transactions */}
        <div className="grid-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={17} color="var(--color-primary)" /> Dynamic Insights
              </div>
              <button className="btn btn-ghost btn-sm" id="insights-view-all-btn" onClick={() => router.push('/insights')}>
                View All <ArrowRight size={13} />
              </button>
            </div>
            {aiInsights.map((ins, i) => (
              <div key={i} className="insight-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="insight-card-label">AI · Insight #{i + 1}</div>
                <div className="insight-card-text">{ins}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Transactions</div>
                <div className="card-subtitle">Last 5 entries</div>
              </div>
              <button className="btn btn-ghost btn-sm" id="txn-view-all-btn" onClick={() => router.push('/analysis')}>
                View All <ArrowRight size={13} />
              </button>
            </div>
            <TransactionList transactions={transactions} limit={5} />
          </div>
        </div>
      </div>
    </>
  );
}
