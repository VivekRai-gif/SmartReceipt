'use client';
import { useState, useEffect } from 'react';

export type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  status: 'Complete' | 'Pending' | 'Flagged';
  flagged: boolean;
  flagReason?: string;
  location?: string;
};

// Initial realistic data reflecting daily bills, groceries, hospital, shopping
const INITIAL_DATA: Transaction[] = [
  { id: 'tx-1', merchant: 'Apollo Pharmacy', amount: 1450, date: 'April 5, 2026', category: 'hospital', status: 'Complete', flagged: false, location: 'Mumbai, India' },
  { id: 'tx-2', merchant: 'Reliance Smart', amount: 4320, date: 'April 4, 2026', category: 'grocery', status: 'Complete', flagged: false, location: 'Pune, India' },
  { id: 'tx-3', merchant: 'Zara', amount: 8990, date: 'April 2, 2026', category: 'shopping', status: 'Complete', flagged: true, flagReason: 'Unusually high shopping expense comparing to typical 30-day average.', location: 'Delhi, India' },
  { id: 'tx-4', merchant: 'Swiggy', amount: 450, date: 'April 2, 2026', category: 'food', status: 'Complete', flagged: false, location: 'Online' },
  { id: 'tx-5', merchant: 'Swiggy', amount: 450, date: 'April 2, 2026', category: 'food', status: 'Complete', flagged: true, flagReason: 'Duplicate transaction detected of exact amount and timestamp.', location: 'Online' },
  { id: 'tx-6', merchant: 'Airtel Broadband', amount: 1180, date: 'April 1, 2026', category: 'bills', status: 'Complete', flagged: false, location: 'Online' },
  { id: 'tx-7', merchant: 'Fortis Hospital', amount: 12500, date: 'March 28, 2026', category: 'hospital', status: 'Complete', flagged: false, location: 'Bangalore, India' },
  { id: 'tx-8', merchant: 'Blinkit', amount: 890, date: 'March 25, 2026', category: 'grocery', status: 'Complete', flagged: false, location: 'Online' },
];

export function useReceiptStore() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('smartreceipt_data_v2');
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      setTransactions(INITIAL_DATA);
    }
    setIsLoaded(true);
  }, []);

  const isDuplicateTransaction = (t: Omit<Transaction, 'id'>) => {
    return transactions.some((tx) =>
      tx.merchant.toLowerCase() === t.merchant.toLowerCase() &&
      tx.amount === t.amount &&
      tx.date === t.date
    );
  };

  // Save to local storage on change
  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx = { ...t, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('smartreceipt_data_v2', JSON.stringify(updated));
    return newTx;
  };

  const clearData = () => {
    setTransactions([]);
    localStorage.removeItem('smartreceipt_data_v2');
  };

  const getDashboardStats = () => {
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const flaggedCount = transactions.filter(tx => tx.flagged).length;
    return {
      totalAmount,
      receiptCount: transactions.length,
      flaggedCount,
      completionRate: transactions.length > 0 ? 100 : 0
    };
  };

  // Group by category for charts
  const getCategoryData = () => {
    const groups = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  return {
    transactions,
    isLoaded,
    addTransaction,
    isDuplicateTransaction,
    clearData,
    getDashboardStats,
    getCategoryData
  };
}
