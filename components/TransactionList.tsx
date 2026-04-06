'use client';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';

const CATEGORY_BADGE: Record<string, string> = {
  food: 'badge-food',
  travel: 'badge-travel',
  shopping: 'badge-shopping',
  utilities: 'badge-utilities',
  health: 'badge-health',
  software: 'badge-software',
  other: 'badge-other',
};

interface TransactionListProps {
  transactions?: typeof MOCK_TRANSACTIONS;
  showAll?: boolean;
  limit?: number;
}

export default function TransactionList({ transactions, showAll = false, limit = 5 }: TransactionListProps) {
  const data = transactions ?? MOCK_TRANSACTIONS;
  const displayed = showAll ? data : data.slice(0, limit);

  return (
    <div className="transaction-list">
      {displayed.map((tx) => (
        <div key={tx.id} className={`transaction-row${tx.flagged ? ' flagged' : ''}`} id={`tx-row-${tx.id}`}>
          <div className="tx-icon" style={{ background: tx.flagged ? 'rgba(250,204,21,0.12)' : 'var(--bg-base)' }}>
            {tx.icon}
          </div>
          <div>
            <div className="tx-name">{tx.merchant}</div>
            <div className="tx-date">{tx.date}</div>
          </div>
          <span className={`badge ${CATEGORY_BADGE[tx.category] ?? 'badge-other'}`}>
            {tx.category}
          </span>
          {tx.flagged && <span className="badge badge-flagged">⚠ Flagged</span>}
          {!tx.flagged && <span style={{ width: 64 }} />}
          <div className="tx-amount negative">
            −₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      ))}
    </div>
  );
}
