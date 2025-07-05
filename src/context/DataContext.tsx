import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Budget, SmartSuggestion } from '../types';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface DataContextType {
  expenses: Expense[];
  budgets: Budget[];
  suggestions: SmartSuggestion[];
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  generateSmartSuggestions: () => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Clear data when user logs out
      setExpenses([]);
      setBudgets([]);
      setSuggestions([]);
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('Refreshing data for user:', user.email);
      
      const [expensesData, budgetsData] = await Promise.all([
        apiService.getExpenses(),
        apiService.getBudgets()
      ]);

      console.log('Received expenses:', expensesData.length);
      console.log('Received budgets:', budgetsData.length);

      // Convert date strings to Date objects and handle MongoDB _id
      const processedExpenses = expensesData.map(expense => ({
        ...expense,
        id: expense._id || expense.id,
        userId: expense.userId,
        date: new Date(expense.date),
        createdAt: new Date(expense.createdAt)
      }));

      const processedBudgets = budgetsData.map(budget => ({
        ...budget,
        id: budget._id || budget.id,
        userId: budget.userId,
        createdAt: new Date(budget.createdAt)
      }));

      setExpenses(processedExpenses);
      setBudgets(processedBudgets);
      
      // Generate suggestions after data is loaded
      setTimeout(() => {
        generateSmartSuggestions();
      }, 100);
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
      // Don't throw error, just log it
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    try {
      console.log('Adding expense:', expense);
      const response = await apiService.createExpense({
        amount: expense.amount,
        category: expense.category,
        date: expense.date.toISOString(),
        paymentMethod: expense.paymentMethod,
        notes: expense.notes
      });

      console.log('Expense created:', response);

      const newExpense = {
        ...response,
        id: response._id || response.id,
        userId: response.userId,
        date: new Date(response.date),
        createdAt: new Date(response.createdAt)
      };

      setExpenses(prev => [newExpense, ...prev]);
      generateSmartSuggestions();
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    try {
      const updateData: any = { ...expense };
      if (expense.date) {
        updateData.date = expense.date.toISOString();
      }

      const response = await apiService.updateExpense(id, updateData);
      
      const updatedExpense = {
        ...response,
        id: response._id || response.id,
        userId: response.userId,
        date: new Date(response.date),
        createdAt: new Date(response.createdAt)
      };

      setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));
      generateSmartSuggestions();
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      console.log('Deleting expense:', id);
      await apiService.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      generateSmartSuggestions();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'userId' | 'createdAt'>) => {
    try {
      console.log('Adding budget:', budget);
      const response = await apiService.createBudget(budget);
      
      const newBudget = {
        ...response,
        id: response._id || response.id,
        userId: response.userId,
        createdAt: new Date(response.createdAt)
      };

      setBudgets(prev => {
        // Remove existing budget for same category and month, then add new one
        const filtered = prev.filter(b => !(b.category === budget.category && b.month === budget.month));
        return [...filtered, newBudget];
      });
      generateSmartSuggestions();
    } catch (error) {
      console.error('Failed to add budget:', error);
      throw error;
    }
  };

  const updateBudget = async (id: string, budget: Partial<Budget>) => {
    try {
      const response = await apiService.updateBudget(id, budget);
      
      const updatedBudget = {
        ...response,
        id: response._id || response.id,
        userId: response.userId,
        createdAt: new Date(response.createdAt)
      };

      setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b));
      generateSmartSuggestions();
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await apiService.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      generateSmartSuggestions();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      throw error;
    }
  };

  const generateSmartSuggestions = () => {
    if (!user || expenses.length === 0) {
      setSuggestions([]);
      return;
    }

    console.log('Generating suggestions with', expenses.length, 'expenses and', budgets.length, 'budgets');

    const currentMonth = format(new Date(), 'yyyy-MM');
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    
    const monthlyExpenses = expenses.filter(expense => 
      expense.date >= monthStart && expense.date <= monthEnd
    );

    console.log('Monthly expenses:', monthlyExpenses.length);

    const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const newSuggestions: SmartSuggestion[] = [];

    // Check for overspending categories
    budgets.forEach(budget => {
      if (budget.month === currentMonth) {
        const spent = categoryTotals[budget.category] || 0;
        const percentage = (spent / budget.amount) * 100;

        if (percentage > 100) {
          newSuggestions.push({
            id: Date.now().toString() + budget.category,
            userId: user.id,
            suggestion: `You've exceeded your ${budget.category} budget by ₹${(spent - budget.amount).toFixed(0)}. Consider reducing expenses in this category.`,
            category: budget.category,
            severity: 'high',
            createdAt: new Date()
          });
        } else if (percentage > 80) {
          newSuggestions.push({
            id: Date.now().toString() + budget.category,
            userId: user.id,
            suggestion: `You're at ${percentage.toFixed(0)}% of your ${budget.category} budget. Try to limit further spending.`,
            category: budget.category,
            severity: 'medium',
            createdAt: new Date()
          });
        }
      }
    });

    // Find highest spending category
    const highestCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    if (highestCategory && highestCategory[1] > 0) {
      newSuggestions.push({
        id: Date.now().toString() + 'highest',
        userId: user.id,
        suggestion: `${highestCategory[0]} is your highest spending category this month at ₹${highestCategory[1].toFixed(0)}. Consider if this aligns with your financial goals.`,
        category: highestCategory[0],
        severity: 'low',
        createdAt: new Date()
      });
    }

    console.log('Generated suggestions:', newSuggestions.length);
    setSuggestions(newSuggestions);
  };

  return (
    <DataContext.Provider value={{
      expenses,
      budgets,
      suggestions,
      addExpense,
      updateExpense,
      deleteExpense,
      addBudget,
      updateBudget,
      deleteBudget,
      generateSmartSuggestions,
      isLoading,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};