'use client';
import { Transaction } from '@/lib/store';

import { 
  Utensils, Plane, ShoppingBag, Laptop, HeartPulse, 
  Zap, Receipt, AlertTriangle, ChevronRight, Check, X 
} from 'lucide-react';

const CATEGORY_MAP: Record<string, { icon: any, color: string, bg: string }> = {
  food: { icon: Utensils, color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  travel: { icon: Plane, color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  shopping: { icon: ShoppingBag, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  utilities: { icon: Zap, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  health: { icon: HeartPulse, color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
  software: { icon: Laptop, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  other: { icon: Receipt, color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
};

interface TransactionListProps {
  transactions: Transaction[];
  showAll?: boolean;
  limit?: number;
}

export default function TransactionList({ transactions, showAll = false, limit = 5 }: TransactionListProps) {
  const displayed = showAll ? transactions : transactions.slice(0, limit);

  if (transactions.length === 0) {
    return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No receipts stored yet. Upload one!</div>;
  }

  return (
    <div className="transaction-list">
      {displayed.map((tx) => {
        const cat = CATEGORY_MAP[tx.category.toLowerCase()] || CATEGORY_MAP.other;
        const Icon = cat.icon;
        return (
          <div key={tx.id} className={`transaction-row${tx.flagged ? ' flagged' : ''}`} id={`tx-row-${tx.id}`}>
            <div className="tx-icon" style={{ background: tx.flagged ? 'rgba(250,204,21,0.12)' : cat.bg, color: tx.flagged ? 'var(--color-primary-dark)' : cat.color }}>
              <Icon size={18} />
            </div>
            <div>
              <div className="tx-name">{tx.merchant}</div>
              <div className="tx-date">{tx.date}</div>
            </div>
            <span className={`badge badge-${tx.category.toLowerCase()}`} style={{ textTransform: 'capitalize' }}>
              {tx.category}
            </span>
            {tx.flagged && <span className="badge badge-flagged"><AlertTriangle size={10} /> Flagged</span>}
            {!tx.flagged && <span style={{ width: 64 }} />}
            <div className="tx-amount negative">
              −₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
