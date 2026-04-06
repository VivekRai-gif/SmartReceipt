import React, { useState } from 'react';
import { useReceiptStore } from '@/lib/store';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, LineChart, Line, CartesianGrid 
} from 'recharts';
import { BarChart3, LineChart as LineIcon, AreaChart as AreaIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-sidebar)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        color: 'var(--text-primary)',
        fontSize: 13,
      }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div>₹{payload[0].value.toLocaleString('en-IN')}</div>
      </div>
    );
  }
  return null;
};

export default function SpendingChart() {
  const { transactions } = useReceiptStore();
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  // Group transactions by month
  const monthlyData = transactions.reduce((acc, tx) => {
    const month = tx.date.split(' ')[0] || 'Unknown';
    acc[month] = (acc[month] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const trendData = Object.entries(monthlyData).map(([name, amount]) => ({ name, amount }));
  
  if (trendData.length === 0) {
    ['Jan', 'Feb', 'Mar', 'Apr'].forEach(m => trendData.push({ name: m, amount: 0 }));
  }

  const renderChart = () => {
    const commonProps = {
      data: trendData,
      margin: { top: 20, right: 20, left: 0, bottom: 20 }
    };

    const axes = [
      <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />,
      <XAxis 
        key="x"
        dataKey="name" 
        axisLine={false} 
        tickLine={false} 
        label={{ value: 'Timeline', position: 'bottom', offset: 0, fontSize: 10, fill: 'var(--text-faint)' }}
        tick={{ fontSize: 11, fill: 'var(--text-muted)' }} 
      />,
      <YAxis 
        key="y"
        axisLine={false} 
        tickLine={false} 
        label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: 'var(--text-faint)' }}
        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
        tickFormatter={(val) => `₹${val > 999 ? (val/1000).toFixed(0)+'k' : val}`}
      />,
      <Tooltip key="tooltip" content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
    ];

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          {axes}
          <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
        </AreaChart>
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          {axes}
          <Line type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
        </LineChart>
      );
    }

    return (
      <BarChart {...commonProps} barSize={32}>
        {axes}
        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
          {trendData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === trendData.length - 1 ? 'var(--color-primary)' : 'var(--border-medium)'} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'bar', icon: BarChart3 },
          { id: 'line', icon: LineIcon },
          { id: 'area', icon: AreaIcon },
        ].map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setChartType(id as any)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid var(--border-light)',
              background: chartType === id ? 'var(--bg-base)' : 'transparent',
              color: chartType === id ? 'var(--color-primary-dark)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              transition: 'all 0.2s'
            }}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
