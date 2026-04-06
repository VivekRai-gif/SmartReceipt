'use client';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useReceiptStore } from '@/lib/store';
import { Send, Sparkles, BarChart3, Receipt, TrendingUp, X } from 'lucide-react';
import SpendingChart from '@/components/SpendingChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';

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
    { role: 'ai', content: "Hello! I'm your SmartReceipt AI Assistant. I have analyzed all your active receipt data. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChart, setActiveChart] = useState<string | null>(null);

  if (!isLoaded) return <div style={{ padding: 40 }}>Loading...</div>;

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);

    try {
      const stats = getDashboardStats();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          transactions: transactions.slice(0, 50),
          stats 
        }),
      });

      const data = await res.json();
      let aiContent = data.content || "I'm sorry, I'm having trouble connecting to my brain right now.";

      // Parse Command if exists
      const chartMatch = aiContent.match(/\[COMMAND:SHOW_CHART:(.*?)\]/);
      if (chartMatch) {
         setActiveChart(chartMatch[1]);
         aiContent = aiContent.replace(/\[COMMAND:SHOW_CHART:.*?\]/, "").trim();
      }

      setMessages((prev) => [...prev, { role: 'ai', content: aiContent }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: "I encountered an error. Please ensure your OPENAI_API_KEY is set in the environment variables." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <PageHeader title="AI Assistant" subtitle="Natural language queries on your expenses" />
      <div className="page-content" style={{ padding: 0, display: 'flex', flexDirection: 'row', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        
        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid var(--border-light)' }}>
          <div className="chat-messages" style={{ padding: '20px 32px', flex: 1, overflowY: 'auto' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-wrap${msg.role === 'user' ? ' user' : ''} animate-fade-in`}>
                <div className={`chat-avatar-small ${msg.role === 'ai' ? 'chat-avatar-ai' : 'chat-avatar-user'}`}>{msg.role === 'ai' ? '🤖' : 'VR'}</div>
                <div className={`chat-bubble ${msg.role}`}>{msg.content}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble-wrap animate-fade-in">
                <div className="chat-avatar-small chat-avatar-ai">🤖</div>
                <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1s infinite' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1s 0.2s infinite' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1s 0.4s infinite' }} />
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '0 32px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map((p) => (
              <button key={p.label} className="btn btn-ghost btn-sm" onClick={() => sendMessage(p.label)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
          <div className="chat-input-area" style={{ padding: '12px 32px 20px' }}>
            <div className="chat-input-row">
              <input className="chat-input" placeholder="Ask about spending trend, top categories, or fraud alerts..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)} />
              <button className="chat-send-btn" onClick={() => sendMessage(input)} disabled={isTyping}><Send size={16} /></button>
            </div>
          </div>
        </div>

        {/* Dynamic Visualization Area */}
        {activeChart && (
          <div className="chat-visuals-panel animate-fade-in-right" style={{ width: 400, background: 'var(--bg-card)', padding: 24, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>AI Generated Visualization</div>
              <button onClick={() => setActiveChart(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            
            <div className="card" style={{ padding: 20 }}>
              <div className="card-title" style={{ marginBottom: 16 }}>
                {activeChart === 'pie' || activeChart === 'donut' ? 'Category Breakdown' : 'Spending Trend'}
              </div>
              {['bar', 'line', 'area'].includes(activeChart) && <SpendingChart />}
              {['pie', 'donut'].includes(activeChart) && <CategoryBreakdown />}
            </div>

            <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, background: 'var(--bg-base)', padding: 16, borderRadius: 'var(--radius-md)' }}>
              <Sparkles size={14} style={{ marginBottom: 4, color: 'var(--color-primary-dark)' }} />
              <strong>Assistant Context:</strong> This data is generated based on your ${transactions.length} active receipts. Categories are auto-assigned by the AI Pipeline.
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }`}</style>
    </>
  );
}
