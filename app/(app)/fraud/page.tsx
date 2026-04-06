'use client';
import PageHeader from '@/components/PageHeader';
import { useReceiptStore } from '@/lib/store';
import { ShieldAlert, ShieldCheck, Clock, ChevronRight, XCircle, Search, Lock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function FraudPage() {
  const { transactions, isLoaded } = useReceiptStore();
  const [resolved, setResolved] = useState<string[]>([]);

  if (!isLoaded) return <div style={{ padding: 40 }}>Loading...</div>;

  const flaggedTxs = transactions.filter(t => t.flagged);
  
  const fraudFlags = flaggedTxs.map(t => ({
    id: t.id,
    type: t.status === 'Complete' ? 'Unusual Spending' : 'Unknown Pattern',
    severity: t.amount >= 1000 ? 'high' : 'medium',
    merchant: t.merchant,
    amount: t.amount,
    desc: t.flagReason || 'AI flagged this transaction due to budget deviations.',
    dates: [t.date]
  }));

  const activeFlags = fraudFlags.filter((f) => !resolved.includes(f.id));
  const total = transactions.length;
  const safe = total - flaggedTxs.length;

  return (
    <>
      <PageHeader title="Fraud Detection" subtitle="AI-monitored flags and duplicate receipt alerts" />
      <div className="page-content">
        <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          {[
            { label: 'Total Analyzed', value: total, icon: <Search size={22} color="var(--color-accent-blue)" />, highlight: false },
            { label: 'Safe Receipts', value: safe, icon: <ShieldCheck size={22} color="var(--color-accent-emerald)" />, highlight: false },
            { label: 'Active Flags', value: activeFlags.length, icon: <ShieldAlert size={22} color="var(--color-accent-rose)" />, highlight: activeFlags.length > 0 },
            { label: 'Resolved', value: resolved.length, icon: <Lock size={22} color="var(--text-muted)" />, highlight: false },
          ].map((s) => (
            <div key={s.label} className={`stat-card${s.highlight ? ' highlight' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="stat-card-icon" style={{ background: 'var(--bg-base)', marginBottom: 0 }}>{s.icon}</div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 28, margin: '4px 0 0' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} color="var(--color-accent-rose)" /> Active Flags ({activeFlags.length})
          </div>
          {activeFlags.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <ShieldCheck size={48} color="var(--color-accent-emerald)" style={{ margin: '0 auto 16px' }} />
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>All Clear!</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>No active fraud flags.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeFlags.map((flag) => (
                <div key={flag.id} className="card animate-fade-in-up" style={{ border: '1px solid rgba(250,204,21,0.3)' }}>
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="fraud-icon-wrap"><ShieldAlert size={20} /></div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="card-title">{flag.type}</div>
                          <span className={`badge ${flag.severity === 'high' ? 'badge-flagged' : 'badge-other'}`}>{flag.severity === 'high' ? '🔴 High Risk' : '🟡 Medium Risk'}</span>
                        </div>
                        <div className="card-subtitle">{flag.merchant} · ₹{flag.amount.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-danger btn-sm" id={`flag-reject-${flag.id}`} onClick={() => setResolved((p) => [...p, flag.id])}><XCircle size={13} /> Reject</button>
                      <button className="btn btn-ghost btn-sm" id={`flag-approve-${flag.id}`} onClick={() => setResolved((p) => [...p, flag.id])}><ShieldCheck size={13} /> Approve</button>
                    </div>
                  </div>
                  <div className="card-body">
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{flag.desc}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {flag.dates.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)' }}>
                          <Clock size={12} /> Receipt Date: {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Flagged Transaction Records</div></div>
          <div className="transaction-list">
            {flaggedTxs.length === 0 ? (
               <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No flagged records found.</div>
            ) : (
              flaggedTxs.map((tx) => (
                <div key={tx.id} className="transaction-row flagged">
                  <div className="tx-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-accent-rose)' }}>
                    <AlertTriangle size={18} />
                  </div>
                  <div><div className="tx-name">{tx.merchant}</div><div className="tx-date">{tx.date}</div></div>
                  <span className="badge badge-flagged">⚠ Flagged</span>
                  <div className="tx-amount negative">−₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
