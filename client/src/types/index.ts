export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  date: Date;
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
  createdAt: Date;
}

export interface MonthlyReport {
  id: string;
  userId: string;
  month: string;
  totalSpent: number;
  topCategory: string;
  overbudgetCategories: string[];
  createdAt: Date;
}

export interface SmartSuggestion {
  id: string;
  userId: string;
  suggestion: string;
  category?: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Utilities',
  'Travel',
  'Others'
] as const;

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Net Banking',
  'Wallet'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];