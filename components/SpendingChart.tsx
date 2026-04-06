'use client';
import { MONTHLY_TREND } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-sidebar)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        color: 'white',
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
  const max = Math.max(...MONTHLY_TREND.map((d) => d.amount));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={MONTHLY_TREND} barSize={28} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 8 }} />
        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
          {MONTHLY_TREND.map((entry) => (
            <Cell
              key={entry.month}
              fill={entry.amount === max ? 'var(--color-primary)' : '#E5E7EB'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
