'use client';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/PageHeader';
import TransactionList from '@/components/TransactionList';
import FlowTimeline from '@/components/FlowTimeline';
import { useReceiptStore } from '@/lib/store';
import { TrendingUp, TrendingDown, Receipt, ShieldAlert, ArrowRight, Brain, Wallet, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SpendingChart = dynamic(() => import('@/components/SpendingChart'), { ssr: false });
const CategoryBreakdown = dynamic(() => import('@/components/CategoryBreakdown'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const { transactions, isLoaded, getDashboardStats } = useReceiptStore();
  const [showBudget, setShowBudget] = useState(false);

  const stats = getDashboardStats();
  const maxTx = transactions.length > 0 ? transactions.reduce((a, b) => a.amount > b.amount ? a : b) : null;

  const budgetPlan = useMemo(() => {
    if (transactions.length === 0) {
      return {
        recommendedMonthly: 0,
        strictMonthly: 0,
        spanDays: 0,
        receiptCount: 0,
        topCategory: null as null | [string, number],
      };
    }

    const parseDate = (value: string) => {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? null : new Date(parsed);
    };

    const dated = transactions
      .map((tx) => ({ tx, date: parseDate(tx.date) }))
      .filter((entry) => entry.date);

    const datedSorted = [...dated].sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());
    const earliest = datedSorted[0]?.date as Date | undefined;
    const latest = datedSorted[datedSorted.length - 1]?.date as Date | undefined;
    const spanDays = earliest && latest ? Math.max(1, Math.ceil((latest.getTime() - earliest.getTime()) / 86400000) + 1) : 30;
    const totalAmount = dated.reduce((sum, entry) => sum + entry.tx.amount, 0);
    const avgDaily = totalAmount / spanDays;
    const recommendedMonthly = Math.round(avgDaily * 30);
    const strictMonthly = Math.round(recommendedMonthly * 0.9);

    const byCategory = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] || null;

    return {
      recommendedMonthly,
      strictMonthly,
      spanDays,
      receiptCount: transactions.length,
      topCategory,
    };
  }, [transactions]);

  if (!isLoaded) return <div style={{ padding: 40 }}>Loading...</div>;

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
        <button className="btn btn-ghost btn-sm" id="budget-planner-btn" onClick={() => setShowBudget(true)}>
          <Wallet size={14} /> Budget Planner
        </button>
        <button className="btn btn-primary btn-sm" id="dash-upload-btn" onClick={() => router.push('/upload')}>
          + Upload Receipt
        </button>
      </PageHeader>

      <div className="page-content animate-fade-in-up">
        <div style={{ marginBottom: 20 }}>
          <FlowTimeline variant="compact" />
        </div>
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

      {showBudget && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <div className="modal-title">Budget Planning</div>
                <div className="modal-subtitle">Suggested targets based on your past records</div>
              </div>
              <button className="modal-close" onClick={() => setShowBudget(false)} aria-label="Close budget planner">
                <X size={16} />
              </button>
            </div>

            {budgetPlan.recommendedMonthly === 0 ? (
              <div className="modal-empty">
                Upload a few receipts to generate a budget plan.
              </div>
            ) : (
              <div className="modal-body">
                <div className="budget-hero">
                  <div className="budget-label">Recommended monthly budget</div>
                  <div className="budget-value">₹{budgetPlan.recommendedMonthly.toLocaleString('en-IN')}</div>
                  <div className="budget-strict">Strict budget: ₹{budgetPlan.strictMonthly.toLocaleString('en-IN')}</div>
                </div>
                <div className="budget-metrics">
                  <div>
                    <div className="budget-metric-label">Based on</div>
                    <div className="budget-metric-value">{budgetPlan.receiptCount} receipts · {budgetPlan.spanDays} days</div>
                  </div>
                  <div>
                    <div className="budget-metric-label">Top category</div>
                    <div className="budget-metric-value">
                      {budgetPlan.topCategory ? `${budgetPlan.topCategory[0]} · ₹${budgetPlan.topCategory[1].toLocaleString('en-IN')}` : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="budget-note">
                  Tip: Keep your strict budget for essential spend, and use the recommended budget for total monthly planning.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
