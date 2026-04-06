'use client';
import { CATEGORY_BREAKDOWN } from '@/lib/mockData';

export default function CategoryBreakdown() {
  const total = CATEGORY_BREAKDOWN.reduce((s, c) => s + c.amount, 0);

  return (
    <div>
      {CATEGORY_BREAKDOWN.map((cat) => (
        <div className="cat-bar-row" key={cat.key}>
          <div className="cat-bar-label-row">
            <span className="cat-bar-name">{cat.name}</span>
            <span className="cat-bar-amount">₹{cat.amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="cat-bar-track">
            <div
              className="cat-bar-fill"
              style={{ width: `${cat.pct}%`, background: cat.color }}
            />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
        Total: ₹{total.toLocaleString('en-IN')}
      </div>
    </div>
  );
}
