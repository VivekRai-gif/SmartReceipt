'use client';
import PageHeader from '@/components/PageHeader';
import TransactionList from '@/components/TransactionList';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import SpendingChart from '@/components/SpendingChart';
import { AI_INSIGHTS } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Receipt, ShieldAlert, ArrowRight, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATS = [
  {
    label: 'Total This Month',
    value: '₹7,600',
    change: '+12.4%',
    dir: 'up',
    icon: <Receipt size={20} color="#F97316" />,
    iconBg: 'rgba(249,115,22,0.1)',
    highlight: false,
  },
  {
    label: 'Largest Expense',
    value: '₹4,250',
    change: 'MakeMyTrip',
    dir: 'neutral',
    icon: <TrendingUp size={20} color="#6366F1" />,
    iconBg: 'rgba(99,102,241,0.1)',
    highlight: false,
  },
  {
    label: 'Receipts Scanned',
    value: '32',
    change: '+8 this week',
    dir: 'up',
    icon: <TrendingDown size={20} color="#10B981" />,
    iconBg: 'rgba(16,185,129,0.1)',
    highlight: false,
  },
  {
    label: 'Fraud Alerts',
    value: '2',
    change: 'Review required',
    dir: 'down',
    icon: <ShieldAlert size={20} color="#000" />,
    iconBg: 'transparent',
    highlight: true,
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <>
      <PageHeader title="Dashboard" subtitle="April 2026 — Financial Overview">
        <button className="btn btn-primary btn-sm" id="dash-upload-btn" onClick={() => router.push('/upload')}>
          + Upload Receipt
        </button>
      </PageHeader>

      <div className="page-content animate-fade-in-up">
        {/* Stat Cards */}
        <div className="stat-cards-grid stagger-children">
          {STATS.map((s) => (
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
                <div className="card-title">Monthly Spending</div>
                <div className="card-subtitle">Last 6 months overview</div>
              </div>
            </div>
            <div className="card-body"><SpendingChart /></div>
          </div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Category Breakdown</div>
                <div className="card-subtitle">April 2026</div>
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
                <Brain size={17} color="var(--color-primary)" /> AI Insights
              </div>
              <button className="btn btn-ghost btn-sm" id="insights-view-all-btn" onClick={() => router.push('/insights')}>
                View All <ArrowRight size={13} />
              </button>
            </div>
            {AI_INSIGHTS.map((ins, i) => (
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
            <TransactionList limit={5} />
          </div>
        </div>
      </div>
    </>
  );
}
