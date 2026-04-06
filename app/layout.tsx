import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SmartReceipt — AI-Powered Expense Intelligence',
  description:
    'Automatically extract, categorize, and analyze receipts with cutting-edge multi-agent AI. Get instant insights, fraud alerts, and trend summaries.',
  keywords: 'receipt analyzer, expense tracker, AI finance, OCR, multi-agent, fintech',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
