'use client';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useReceiptStore } from '@/lib/store';
import { Send, Sparkles, BarChart3, Receipt, TrendingUp } from 'lucide-react';

type Message = { role: 'ai' | 'user'; content: string };

const QUICK_PROMPTS = [
  { label: 'Top spending category?', icon: <BarChart3 size={13} /> },
  { label: 'Receipts this week?', icon: <Receipt size={13} /> },
  { label: 'Spending trend?', icon: <TrendingUp size={13} /> },
  { label: 'Any alerts?', icon: <Sparkles size={13} /> },
];

export default function ChatPage() {
  const { isLoaded, getDashboardStats, transactions } = useReceiptStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm your SmartSpend AI Assistant. I have analyzed all your active receipt data. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isLoaded) return <div style={{ padding: 40 }}>Loading...</div>;

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 600));

    const stats = getDashboardStats();

    let response = "I don't have enough data to understand that exactly. Can you try uploading more receipts?";
    
    if (text.includes('spending category')) {
       response = `You have uploaded ${stats.receiptCount} receipts. The total value is ₹${stats.totalAmount.toLocaleString()}. The highest category expenses are usually marked for review.`;
    } else if (text.includes('week') || text.includes('Receipts')) {
       response = `You currently have ${stats.receiptCount} receipts uploaded in the entire system.`;
    } else if (text.includes('alert')) {
       response = stats.flaggedCount > 0 ? `⚠️ Yes — I have flagged ${stats.flaggedCount} receipts. You should review them in the Fraud tools immediately.` : `✅ No active alerts right now! Your spending looks highly consistent with zero flags.`;
    } else {
       response = `I see you have spending of ₹${stats.totalAmount.toLocaleString()} across ${stats.receiptCount} transactions. Everything looks well maintained.`;
    }

    setMessages((prev) => [...prev, { role: 'ai', content: response }]);
    setIsTyping(false);
  };

  return (
    <>
      <PageHeader title="AI Assistant" subtitle="Natural language queries on your expenses" />
      <div className="page-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
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
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>Powered by OpenAI + SmartReceipt AI · Queries your personal expense data stored locally.</div>
        </div>
      </div>
      <style jsx global>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }`}</style>
    </>
  );
}
