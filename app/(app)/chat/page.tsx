'use client';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FlowTimeline from '@/components/FlowTimeline';
import { useReceiptStore, Transaction } from '@/lib/store';
import { Send, Sparkles, BarChart3, Receipt, TrendingUp } from 'lucide-react';

type Message = { role: 'ai' | 'user'; content: string };


const QUICK_PROMPTS = [
  { label: 'Top spending category?', icon: <BarChart3 size={13} /> },
  { label: 'Receipts this week?', icon: <Receipt size={13} /> },
  { label: 'Spending trend?', icon: <TrendingUp size={13} /> },
  { label: 'Any alerts?', icon: <Sparkles size={13} /> },
];

const buildLocalResponse = (question: string, transactions: Transaction[]) => {
  const normalized = question.toLowerCase();

  if (!transactions || transactions.length === 0) {
    return 'You do not have any receipts yet. Upload a receipt to get started.';
  }

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const flagged = transactions.filter((tx) => tx.flagged);
  const byCategory = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);
  const byMerchant = transactions.reduce((acc, tx) => {
    acc[tx.merchant] = (acc[tx.merchant] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const parseDate = (value: string) => {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : new Date(parsed);
  };

  if (normalized.includes('category') || normalized.includes('top spending')) {
    if (!topCategory) {
      return 'No category data found yet.';
    }
    return `Top spending category is ${topCategory[0]} with ₹${topCategory[1].toLocaleString()}.`;
  }

  if (normalized.includes('alert') || normalized.includes('flag')) {
    return flagged.length > 0
      ? `You have ${flagged.length} flagged receipts. Review them in Fraud Detection.`
      : 'No active alerts. All receipts look normal.';
  }

  if (normalized.includes('merchant') || normalized.includes('store') || normalized.includes('spent at')) {
    const topMerchant = Object.entries(byMerchant).sort((a, b) => b[1] - a[1])[0];
    if (!topMerchant) {
      return 'No merchant data found yet.';
    }
    return `Top merchant is ${topMerchant[0]} with ₹${topMerchant[1].toLocaleString()}.`;
  }

  if (normalized.includes('latest') || normalized.includes('recent')) {
    const latest = [...transactions]
      .map((tx) => ({ tx, date: parseDate(tx.date) }))
      .filter((entry) => entry.date)
      .sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime())[0];
    if (!latest) {
      return 'No recent receipts found.';
    }
    return `Latest receipt: ${latest.tx.merchant} on ${latest.tx.date} for ₹${latest.tx.amount.toLocaleString()} (${latest.tx.category}).`;
  }

  if (normalized.includes('week')) {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const recent = transactions.filter((tx) => {
      const date = parseDate(tx.date);
      return date ? date >= weekAgo && date <= now : false;
    });
    const recentTotal = recent.reduce((sum, tx) => sum + tx.amount, 0);
    return `Last 7 days: ${recent.length} receipts totaling ₹${recentTotal.toLocaleString()}.`;
  }

  if (normalized.includes('trend')) {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    const lastWeek = transactions.filter((tx) => {
      const date = parseDate(tx.date);
      return date ? date >= weekAgo && date <= now : false;
    });
    const prevWeek = transactions.filter((tx) => {
      const date = parseDate(tx.date);
      return date ? date >= twoWeeksAgo && date < weekAgo : false;
    });

    const lastTotal = lastWeek.reduce((sum, tx) => sum + tx.amount, 0);
    const prevTotal = prevWeek.reduce((sum, tx) => sum + tx.amount, 0);

    if (prevTotal === 0) {
      return `Current 7-day spend is ₹${lastTotal.toLocaleString()}. Not enough data for a trend yet.`;
    }

    const delta = lastTotal - prevTotal;
    const direction = delta >= 0 ? 'up' : 'down';
    return `Spending is ${direction} ₹${Math.abs(delta).toLocaleString()} compared to the previous week.`;
  }

  const topCategoryLabel = topCategory ? `${topCategory[0]} (₹${topCategory[1].toLocaleString()})` : 'none';
  return `You have ${transactions.length} receipts totaling ₹${totalAmount.toLocaleString()}. Top category: ${topCategoryLabel}. Ask about categories, alerts, weekly trends, merchants, or recent receipts.`;
};

export default function ChatPage() {
  const { isLoaded, transactions } = useReceiptStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm your SmartSpend AI Assistant. I have analyzed all your active receipt data. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isLoaded) return <div style={{ padding: 40 }}>Loading...</div>;

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = { role: 'user', content: text };
    const nextMessages = [...messages, newMessage];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const reply = buildLocalResponse(text, transactions);
      const aiMessage: Message = { role: 'ai', content: reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const messageText = error instanceof Error ? error.message : 'Sorry, something went wrong.';
      const errorMessage: Message = { role: 'ai', content: messageText };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <PageHeader title="AI Assistant" subtitle="Natural language queries on your expenses" />
      <div className="page-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        <div style={{ padding: '20px 32px 0' }}>
          <FlowTimeline />
        </div>
        <div className="chat-messages" style={{ padding: '20px 32px' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-wrap${msg.role === 'user' ? ' user' : ''} animate-fade-in`}>
              <div className={`chat-avatar-small ${msg.role === 'ai' ? 'chat-avatar-ai' : 'chat-avatar-user'}`}>{msg.role === 'ai' ? '🤖' : 'SA'}</div>
              <div className={`chat-bubble ${msg.role}`}>{msg.content}</div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble-wrap animate-fade-in">
              <div className="chat-avatar-small chat-avatar-ai">🤖</div>
              <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 14, paddingBottom: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1s ease infinite' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1s ease 0.15s infinite' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1s ease 0.3s infinite' }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '0 32px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map((p) => (
            <button key={p.label} id={`quick-${p.label.toLowerCase().replace(/\s+/g, '-')}`} className="btn btn-ghost btn-sm" onClick={() => sendMessage(p.label)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        <div className="chat-input-area" style={{ padding: '12px 32px 20px' }}>
          <div className="chat-input-row">
            <input id="chat-input" className="chat-input" placeholder="Ask anything about your expenses based on your Live Uploads…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)} />
            <button id="chat-send-btn" className="chat-send-btn" onClick={() => sendMessage(input)} disabled={isTyping} aria-label="Send message"><Send size={16} /></button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>SmartReceipt AI · Queries your personal expense data stored locally.</div>
        </div>
      </div>
      <style jsx global>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }`}</style>
    </>
  );
}
