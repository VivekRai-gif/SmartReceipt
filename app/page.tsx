'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, ArrowRight, ScanLine, Brain, ShieldCheck,
  BarChart3, MessageSquare, CheckCircle2, Star, Menu, X,
  Plane, Laptop, AlertTriangle, Check
} from 'lucide-react';

const FEATURES = [
  { icon: <ScanLine size={20} />, color: '#6366F1', bg: 'rgba(99,102,241,0.08)', title: 'Intelligent OCR', desc: '99.2% accuracy across photos, PDFs, screenshots.' },
  { icon: <Brain size={20} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', title: 'LLM Extraction', desc: 'GPT-4o parses merchant, amount, date automatically.' },
  { icon: <ShieldCheck size={20} />, color: '#10B981', bg: 'rgba(16,185,129,0.08)', title: 'Fraud Guard', desc: 'Real-time duplicate & anomaly detection.' },
  { icon: <BarChart3 size={20} />, color: '#F97316', bg: 'rgba(249,115,22,0.08)', title: 'Spend Insights', desc: 'AI summaries, trends, and category breakdowns.' },
  { icon: <MessageSquare size={20} />, color: '#FACC15', bg: 'rgba(250,204,21,0.08)', title: 'Ask Anything', desc: 'Natural language queries on your expense data.' },
  { icon: <Zap size={20} />, color: '#F43F5E', bg: 'rgba(244,63,94,0.08)', title: '10-Agent Pipeline', desc: 'Fully automated n8n workflow, zero manual steps.' },
];

const AGENTS = [
  { num: '01', label: 'Upload',      sub: 'Webhook trigger' },
  { num: '02', label: 'OCR',         sub: 'Vision API' },
  { num: '03', label: 'Cleaning',    sub: 'Normalize text' },
  { num: '04', label: 'Extract',     sub: 'LLM parsing' },
  { num: '05', label: 'Categorize',  sub: 'Auto-classify' },
  { num: '06', label: 'Fraud Check', sub: 'Anomaly detect' },
  { num: '07', label: 'Insights',    sub: 'AI summary' },
  { num: '08', label: 'Storage',     sub: 'MongoDB save' },
  { num: '09', label: 'Chat',        sub: 'NL query' },
  { num: '10', label: 'Feedback',    sub: 'Self-improve' },
];

const STATS = [
  { val: '99.2%', label: 'OCR Accuracy' },
  { val: '< 4s',  label: 'Per Receipt' },
  { val: '10',    label: 'AI Agents' },
  { val: '0',     label: 'Manual Steps' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'CFO · TechNova India', text: 'Cut our expense processing time by 80%. Fraud detection alone saved ₹2L last quarter.' },
  { name: 'Arjun Mehta',  role: 'Founder · BuildStack',  text: 'I just ask "what was my software spend?" and get instant, detailed breakdowns. Game changer.' },
  { name: 'Sarah Kim',    role: 'Finance Lead · Groww',  text: 'We run 500+ receipts a month through it. Categorization accuracy is above 97%.' },
];

const PLANS = [
  { name: 'Starter', price: '₹0', period: 'forever', features: ['50 receipts/month', 'Basic categorization', 'Dashboard access', '7-day history'], cta: 'Get Started Free', highlight: false },
  { name: 'Pro', price: '₹999', period: '/month', features: ['Unlimited receipts', 'Fraud detection', 'AI chat assistant', 'All 10 agents', 'CSV export', 'Priority support'], cta: 'Start Free Trial', highlight: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Custom workflows', 'Dedicated instance', 'SLA guarantee', 'SSO / SAML', 'API access'], cta: 'Contact Sales', highlight: false },
];

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeAgent, setActiveAgent] = useState(0);
  const pipelineRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveAgent((a) => (a + 1) % AGENTS.length), 1100);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll to active agent
  useEffect(() => {
    if (pipelineRef.current) {
      const container = pipelineRef.current;
      const activeNode = container.querySelector('.lp-node-active');
      if (activeNode) {
        const containerWidth = container.offsetWidth;
        const nodeOffset = (activeNode as HTMLElement).offsetLeft;
        const nodeWidth = (activeNode as HTMLElement).offsetWidth;
        
        // Center the active node in the scroll view
        container.scrollTo({
          left: nodeOffset - (containerWidth / 2) + (nodeWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeAgent]);

  return (
    <div className="lp-root">

      {/* ── NAV ── */}
      <nav className={`lp-nav${scrolled ? ' lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon"><Zap size={16} color="#000" strokeWidth={2.5} /></div>
            <span className="lp-logo-text">SmartReceipt</span>
          </div>
          <div className="lp-nav-links">
            {[['#features','Features'],['#pipeline','Pipeline'],['#pricing','Pricing']].map(([h, l]) => (
              <a key={l} href={h} className="lp-nav-link">{l}</a>
            ))}
          </div>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" id="nav-login-btn" onClick={() => router.push('/login')}>Log in</button>
            <button className="lp-btn-primary" id="nav-start-btn" onClick={() => router.push('/login')}>
              Get Started <ArrowRight size={14} />
            </button>
          </div>
          <button className="lp-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            {[['#features','Features'],['#pipeline','Pipeline'],['#pricing','Pricing']].map(([h, l]) => (
              <a key={l} href={h} className="lp-mobile-link" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <button className="lp-btn-primary" style={{ marginTop: 8 }} onClick={() => router.push('/login')}>Get Started</button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg-grid" />
        <div className="lp-hero-glow lp-hero-glow-1" />
        <div className="lp-hero-glow lp-hero-glow-2" />

        <div className="lp-container">
          <div className="lp-hero-badge animate-fade-in">
            <Zap size={11} color="#000" /> Powered by 10 AI Agents · Built on n8n
          </div>

          <h1 className="lp-hero-headline animate-fade-in-up">
            Receipt intelligence,<br />
            <span className="lp-headline-highlight">on autopilot.</span>
          </h1>

          <p className="lp-hero-sub animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            Upload a receipt. Our 10-agent AI pipeline extracts, categorizes, audits,
            and surfaces insights — in under 4 seconds.
          </p>

          <div className="lp-hero-ctas animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <button className="lp-btn-primary lp-btn-lg" id="hero-start-btn" onClick={() => router.push('/dashboard')}>
              Try It Free <ArrowRight size={16} />
            </button>
            <button className="lp-btn-ghost lp-btn-lg" id="hero-demo-btn" onClick={() => router.push('/dashboard')}>
              Live Demo
            </button>
          </div>

          <div className="lp-hero-proof animate-fade-in" style={{ animationDelay: '220ms' }}>
            <div className="lp-proof-avatars">
              {['#6366F1','#F97316','#10B981','#F43F5E'].map((c, i) => (
                <div key={i} className="lp-proof-avatar" style={{ background: c }}>{String.fromCharCode(65 + i)}</div>
              ))}
            </div>
            <span className="lp-proof-text">Trusted by <strong>2,400+</strong> finance teams</span>
            <div className="lp-proof-stars">{Array(5).fill(null).map((_, i) => <Star key={i} size={12} fill="#FACC15" color="#FACC15" />)}</div>
            <span className="lp-proof-text" style={{ color: '#FACC15', fontWeight: 600 }}>4.9</span>
          </div>
        </div>

        {/* Mock UI */}
        <div className="lp-hero-visual animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="lp-fake-ui">
            <div className="lp-fake-header">
              <div style={{ display: 'flex', gap: 5 }}>
                {['#F43F5E','#FACC15','#10B981'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ fontSize: 10, color: '#475569', flex: 1, textAlign: 'center', fontFamily: 'monospace' }}>smartreceipt.ai</div>
            </div>
            <div className="lp-fake-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div className="lp-fake-card">
                  <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 3 }}>Total Month</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit' }}>₹7,600</div>
                </div>
                <div className="lp-fake-card" style={{ background: '#FACC15' }}>
                  <div style={{ fontSize: 9, color: '#78350F', marginBottom: 3 }}>Fraud Alerts</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#000', fontFamily: 'Outfit' }}>2</div>
                </div>
              </div>
              <div className="lp-fake-card" style={{ marginBottom: 10, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 9, color: '#EAB308', marginBottom: 5 }}>AI Insight</div>
                <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>Food spend up 28% — reducing dining by 2 meals keeps you on budget.</div>
              </div>
              {[
                { icon: <Zap size={10} />, text: 'Starbucks · Food · ₹340', safe: true },
                { icon: <Plane size={10} />, text: 'Uber Ride · Travel · ₹240', safe: false },
                { icon: <Laptop size={10} />, text: 'AWS · Software · ₹1,400', safe: true }
              ].map((t, i) => (
                <div key={i} className="lp-fake-row" style={{ marginBottom: 5 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                    {t.icon}
                  </div>
                  <span style={{ fontSize: 10, color: '#475569', flex: 1 }}>{t.text}</span>
                  <span className={`lp-fake-badge ${!t.safe ? 'lp-fake-badge-warn' : 'lp-fake-badge-safe'}`}>
                    {!t.safe ? <AlertTriangle size={8} /> : <Check size={8} />}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-float-tag lp-float-tag-1 animate-float">
            <CheckCircle2 size={12} color="#10B981" /> Analyzed in 3.4s
          </div>
          <div className="lp-float-tag lp-float-tag-2 animate-float-slow">
            <ShieldCheck size={12} color="#FACC15" /> Duplicate detected
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="lp-stats-bar">
        <div className="lp-container">
          <div className="lp-stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="lp-stat-item">
                <div className="lp-stat-val">{s.val}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section" id="features">
        <div className="lp-container">
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="lp-feature-card animate-fade-in-up" style={{ animationDelay: `${i * 55}ms` }}>
                <div className="lp-feature-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section className="lp-section lp-section-dark" id="pipeline">
        <div className="lp-container">
          <div className="lp-pipeline-header">
            <div>
              <div className="lp-eyebrow">n8n Multi-Agent Pipeline</div>
              <h2 className="lp-section-title" style={{ color: '#0F172A', marginBottom: 0 }}>
                10 agents.<br />One seamless flow.
              </h2>
            </div>
            <button className="lp-btn-primary" id="pipeline-cta-btn" onClick={() => router.push('/dashboard')}>
              See It Live <ArrowRight size={15} />
            </button>
          </div>
          <p style={{ color: '#475569', fontSize: 15, marginBottom: 40, maxWidth: 460, lineHeight: 1.7 }}>
            Every receipt passes through a chain of specialized AI agents — from raw image to structured insight — automatically.
          </p>
          <div className="lp-pipeline-container animate-fade-in-up" style={{ animationDelay: '200ms' }} ref={pipelineRef}>
            <div className="lp-pipeline-flow">
              {AGENTS.map((a, i) => (
                <React.Fragment key={a.num}>
                  <div className={`lp-pipeline-node${activeAgent === i ? ' lp-node-active' : ''}`}>
                    <div className="lp-node-circle">{a.num}</div>
                    <div className="lp-node-content">
                      <div className="lp-node-label">{a.label}</div>
                      <div className="lp-node-sub">{a.sub}</div>
                    </div>
                    {activeAgent === i && <div className="lp-node-pulse" />}
                  </div>
                  {i < AGENTS.length - 1 && (
                    <div className={`lp-pipeline-line${i < activeAgent ? ' lp-line-done' : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-eyebrow" style={{ marginBottom: 12 }}>What teams say</div>
          <h2 className="lp-section-title">Built for finance teams<br />that move fast.</h2>
          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="lp-testimonial-card animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="lp-testimonial-stars">
                  {Array(5).fill(null).map((_, j) => <Star key={j} size={12} fill="#FACC15" color="#FACC15" />)}
                </div>
                <p className="lp-testimonial-text">"{t.text}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="lp-section lp-section-soft" id="pricing">
        <div className="lp-container">
          <div className="lp-eyebrow" style={{ marginBottom: 12 }}>Pricing</div>
          <h2 className="lp-section-title">Simple pricing.<br />No surprises.</h2>
          <div className="lp-pricing-grid">
            {PLANS.map((plan, i) => (
              <div key={plan.name} className={`lp-pricing-card${plan.highlight ? ' lp-pricing-highlight' : ''} animate-fade-in-up`} style={{ animationDelay: `${i * 70}ms` }}>
                {plan.highlight && <div className="lp-pricing-popular">Most Popular</div>}
                <div className="lp-pricing-name">{plan.name}</div>
                <div className="lp-pricing-price">
                  {plan.price}<span className="lp-pricing-period">{plan.period}</span>
                </div>
                <ul className="lp-pricing-features">
                  {plan.features.map(f => (
                    <li key={f} className="lp-pricing-feature">
                      <CheckCircle2 size={13} color={plan.highlight ? '#000' : '#10B981'} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={plan.highlight ? 'lp-pricing-cta-dark' : 'lp-pricing-cta'}
                  id={`pricing-${plan.name.toLowerCase()}-btn`}
                  onClick={() => router.push('/dashboard')}
                >
                  {plan.cta} <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta-strip">
        <div className="lp-hero-glow lp-hero-glow-1" />
        <div className="lp-container lp-cta-inner">
          <h2 className="lp-cta-title">Stop entering data manually.<br />Let AI handle it.</h2>
          <p className="lp-cta-sub">Join 2,400+ teams. No credit card required.</p>
          <button className="lp-btn-primary lp-btn-lg" id="cta-bottom-btn" onClick={() => router.push('/dashboard')}>
            Launch Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div>
              <div className="lp-logo" style={{ marginBottom: 12 }}>
                <div className="lp-logo-icon"><Zap size={15} color="#000" strokeWidth={2.5} /></div>
                <span className="lp-logo-text">SmartReceipt</span>
              </div>
              <p className="lp-footer-tagline">AI-powered expense intelligence<br />for modern finance teams.</p>
            </div>
            {[
              { title: 'Product',  links: ['Features', 'Pipeline', 'Pricing', 'Changelog'] },
              { title: 'Company',  links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal',    links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
            ].map(col => (
              <div key={col.title}>
                <div className="lp-footer-col-title">{col.title}</div>
                {col.links.map(l => <a key={l} href="#" className="lp-footer-link">{l}</a>)}
              </div>
            ))}
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 SmartReceipt Technologies Pvt. Ltd.</span>
            <span>Made with ⚡ in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
