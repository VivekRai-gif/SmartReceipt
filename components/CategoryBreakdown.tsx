import React, { useState } from 'react';
import { useReceiptStore } from '@/lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LayoutList, PieChart as PieIcon, Disc } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  food: '#FACC15', // yellow
  travel: '#06B6D4', // cyan
  bills: '#F97316', // orange
  grocery: '#22C55E', // green
  software: '#3B82F6', // blue
  shopping: '#8B5CF6', // purple
  health: '#EF4444', // red
  hospital: '#EF4444', 
  other: '#6B7280' // grey
};

export default function CategoryBreakdown() {
  const { getCategoryData } = useReceiptStore();
  const [viewType, setViewType] = useState<'bars' | 'pie' | 'donut'>('bars');
  
  const rawData = getCategoryData();
  const total = rawData.reduce((s, c) => s + c.value, 0);

  if (rawData.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '20px 0' }}>No data available yet.</div>;
  }

  const chartData = rawData.map((d) => ({
    name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
    value: d.value,
    pct: total > 0 ? Math.round((d.value / total) * 100) : 0,
    color: CATEGORY_COLORS[d.name.toLowerCase()] || CATEGORY_COLORS['other']
  }));

  const renderView = () => {
    if (viewType === 'bars') {
      return (
        <div className="stagger-children">
          {chartData.map((cat) => (
            <div className="cat-bar-row" key={cat.name}>
              <div className="cat-bar-label-row">
                <span className="cat-bar-name">{cat.name} ({cat.pct}%)</span>
                <span className="cat-bar-amount">₹{cat.value.toLocaleString('en-IN')}</span>
              </div>
              <div className="cat-bar-track">
                <div className="cat-bar-fill" style={{ width: `${cat.pct}%`, background: cat.color }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={viewType === 'donut' ? 60 : 0}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'bars', icon: LayoutList },
          { id: 'pie', icon: PieIcon },
          { id: 'donut', icon: Disc },
        ].map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setViewType(id as any)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid var(--border-light)',
              background: viewType === id ? 'var(--bg-base)' : 'transparent',
              color: viewType === id ? 'var(--color-primary-dark)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              transition: 'all 0.2s'
            }}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
      
      {renderView()}

      <div style={{ marginTop: 20, padding: '12px 0', borderTop: '1px solid var(--border-light)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>
        Total Category Spend: ₹{total.toLocaleString('en-IN')}
      </div>
    </div>
  );
}
