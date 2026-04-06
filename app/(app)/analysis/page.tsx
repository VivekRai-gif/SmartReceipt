'use client';
import PageHeader from '@/components/PageHeader';
import TransactionList from '@/components/TransactionList';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';
import { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

const CATEGORIES = ['All', 'Food', 'Travel', 'Shopping', 'Software', 'Health', 'Utilities'];

export default function AnalysisPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFlagged, setShowFlagged] = useState(false);

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    const catMatch = activeCategory === 'All' || tx.category === activeCategory.toLowerCase();
    const flagMatch = !showFlagged || tx.flagged;
    return catMatch && flagMatch;
  });

  return (
    <>
      <PageHeader title="Analysis" subtitle="All extracted receipts and transaction records" />
      <div className="page-content">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} id={`filter-${cat.toLowerCase()}`} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button id="toggle-flagged-btn" className={`btn btn-sm ${showFlagged ? 'btn-danger' : 'btn-ghost'}`} onClick={() => setShowFlagged((v) => !v)}>
              <Filter size={13} /> {showFlagged ? 'Showing Flagged' : 'Show Flagged'}
            </button>
            <button className="btn btn-ghost btn-sm" id="sort-btn"><ArrowUpDown size={13} /> Sort</button>
          </div>
        </div>
        <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
          {[
            { label: 'Total Receipts', value: MOCK_TRANSACTIONS.length, valueStr: '' },
            { label: 'Total Amount', value: 0, valueStr: `₹${MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}` },
            { label: 'Flagged', value: MOCK_TRANSACTIONS.filter((t) => t.flagged).length, valueStr: '' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 26 }}>{s.valueStr || s.value}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">All Receipts</div><div className="card-subtitle">{filtered.length} records</div></div>
          </div>
          <TransactionList transactions={filtered} showAll />
        </div>
        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Extracted Data — Sample</div></div>
            <div className="card-body">
              {[
                { label: 'Merchant', value: 'Swiggy — Dinner' },
                { label: 'Amount', value: '₹438.00' },
                { label: 'Date', value: 'April 3, 2026' },
                { label: 'Category', value: 'Food & Dining' },
                { label: 'Payment Method', value: 'UPI / GPay' },
                { label: 'AI Confidence', value: '97.4%' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">AI Pipeline Status</div></div>
            <div className="card-body">
              {[
                { step: 'OCR Extraction', status: 'done', time: '1.2s' },
                { step: 'Data Cleaning', status: 'done', time: '0.3s' },
                { step: 'Field Extraction', status: 'done', time: '2.1s' },
                { step: 'Categorization', status: 'done', time: '1.4s' },
                { step: 'Fraud Detection', status: 'flagged', time: '0.8s' },
                { step: 'Insight Generation', status: 'done', time: '3.2s' },
                { step: 'Storage', status: 'done', time: '0.2s' },
              ].map(({ step, status, time }) => (
                <div key={step} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{status === 'done' ? '✅' : status === 'flagged' ? '⚠️' : '⏳'}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{step}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
