'use client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-brand">SmartReceipt</div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to continue managing your receipts.</div>

        <button className="auth-google" type="button" onClick={() => router.push('/dashboard')}>
          <span className="auth-google-icon">G</span>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or use email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <div className="auth-input">
              <Mail size={16} />
              <input name="email" type="email" placeholder="you@company.com" required />
            </div>
          </label>

          <label className="auth-field">
            <span>Password</span>
            <div className="auth-input">
              <Lock size={16} />
              <input name="password" type="password" placeholder="Enter your password" required />
            </div>
          </label>

          <button className="auth-submit" type="submit">
            Log in
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">By signing in, you agree to our Terms and Privacy Policy.</div>
      </div>

      <div className="auth-side">
        <div className="auth-side-title">AI Expense Intelligence</div>
        <div className="auth-side-text">
          Upload receipts, trigger n8n automations, and get instant financial insights with SmartReceipt.
        </div>
        <div className="auth-side-metric">
          <div className="auth-metric-value">99.2%</div>
          <div className="auth-metric-label">Extraction accuracy</div>
        </div>
        <div className="auth-side-metric">
          <div className="auth-metric-value">&lt; 4s</div>
          <div className="auth-metric-label">End-to-end processing</div>
        </div>
      </div>
    </div>
  );
}
