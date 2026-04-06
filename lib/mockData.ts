// Shared mock data for all pages

export const MOCK_TRANSACTIONS = [
  { id: 't1', merchant: 'Starbucks Coffee', amount: 12.50, date: '2026-04-05', category: 'food', icon: '☕', flagged: false, status: 'safe' },
  { id: 't2', merchant: 'Uber Ride', amount: 24.80, date: '2026-04-05', category: 'travel', icon: '🚗', flagged: false, status: 'safe' },
  { id: 't3', merchant: 'Amazon Prime', amount: 14.99, date: '2026-04-04', category: 'software', icon: '📦', flagged: false, status: 'safe' },
  { id: 't4', merchant: 'Netflix India', amount: 649.00, date: '2026-04-03', category: 'software', icon: '🎬', flagged: false, status: 'safe' },
  { id: 't5', merchant: 'Swiggy — Dinner', amount: 438.00, date: '2026-04-03', category: 'food', icon: '🍔', flagged: true, status: 'flagged' },
  { id: 't6', merchant: 'MakeMyTrip', amount: 4250.00, date: '2026-04-02', category: 'travel', icon: '✈️', flagged: false, status: 'safe' },
  { id: 't7', merchant: 'Apollo Pharmacy', amount: 780.00, date: '2026-04-01', category: 'health', icon: '💊', flagged: false, status: 'safe' },
  { id: 't8', merchant: 'H&M Clothing', amount: 2199.00, date: '2026-03-31', category: 'shopping', icon: '🛍️', flagged: false, status: 'safe' },
  { id: 't9', merchant: 'Swiggy — Lunch', amount: 438.00, date: '2026-04-03', category: 'food', icon: '🍔', flagged: true, status: 'duplicate' },
  { id: 't10', merchant: 'Electricity Bill', amount: 1200.00, date: '2026-03-30', category: 'utilities', icon: '⚡', flagged: false, status: 'safe' },
];

export const CATEGORY_BREAKDOWN = [
  { name: 'Food & Dining', amount: 2840, pct: 38, color: '#F97316', key: 'food' },
  { name: 'Travel', amount: 2140, pct: 28, color: '#6366F1', key: 'travel' },
  { name: 'Shopping', amount: 1380, pct: 18, color: '#8B5CF6', key: 'shopping' },
  { name: 'Software/SaaS', amount: 760, pct: 10, color: '#3B82F6', key: 'software' },
  { name: 'Health', amount: 380, pct: 5, color: '#F43F5E', key: 'health' },
  { name: 'Utilities', amount: 100, pct: 1, color: '#10B981', key: 'utilities' },
];

export const MONTHLY_TREND = [
  { month: 'Nov', amount: 5200 },
  { month: 'Dec', amount: 8100 },
  { month: 'Jan', amount: 6400 },
  { month: 'Feb', amount: 7200 },
  { month: 'Mar', amount: 9500 },
  { month: 'Apr', amount: 7600 },
];

export const FRAUD_FLAGS = [
  {
    id: 'f1',
    type: 'Duplicate Receipt',
    merchant: 'Swiggy — Dinner',
    amount: 438.00,
    dates: ['Apr 3, 2026', 'Apr 3, 2026'],
    severity: 'high',
    desc: 'Two identical receipts detected from the same merchant, same amount, on the same date. This may indicate a duplicate submission.',
    receiptIds: ['t5', 't9'],
  },
  {
    id: 'f2',
    type: 'Unusual Spending',
    merchant: 'H&M Clothing',
    amount: 2199.00,
    dates: ['Mar 31, 2026'],
    severity: 'medium',
    desc: 'This shopping expense is 340% higher than your monthly shopping average of ₹500. Review before approving.',
    receiptIds: ['t8'],
  },
];

export const AI_INSIGHTS = [
  'You spent 28% more on Food this month compared to March. Mostly driven by restaurant orders.',
  'Travel costs peaked in April due to the MakeMyTrip booking. Budget remaining: ₹3,250.',
  '2 flagged receipts require your review — potential duplicate detected for Swiggy.',
  `You're on track to finish April within budget if you reduce dining out by 2 meals.`,
];

export const CHAT_HISTORY = [
  {
    role: 'ai' as const,
    content: 'Hi! I\'m your AI expense assistant. Ask me anything about your spending — categories, trends, or specific merchants.'
  },
  {
    role: 'user' as const,
    content: 'How much did I spend on food this month?'
  },
  {
    role: 'ai' as const,
    content: '🍔 You\'ve spent **₹2,840** on Food & Dining in April so far, across 6 transactions. That\'s **38%** of your total expenses — and 28% more than March. Your top restaurants are Swiggy (₹876), Starbucks (₹62), and others.'
  },
];

export type TransactionStatus = 'safe' | 'flagged' | 'duplicate';
export type Transaction = typeof MOCK_TRANSACTIONS[0];
