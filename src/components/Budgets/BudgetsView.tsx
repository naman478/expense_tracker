import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import BudgetForm from './BudgetForm';

const BudgetsView: React.FC = () => {
  const { budgets, expenses } = useData();
  const [showForm, setShowForm] = useState(false);

  // Current month calculations
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const currentMonthExpenses = expenses.filter(expense => 
    expense.date >= monthStart && expense.date <= monthEnd
  );

  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const currentMonthBudgets = budgets.filter(budget => budget.month === currentMonth);

  const budgetAnalysis = currentMonthBudgets.map(budget => {
    const spent = categoryTotals[budget.category] || 0;
    const percentage = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;

    return {
      ...budget,
      spent,
      percentage,
      remaining,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
    };
  });

  const totalBudget = currentMonthBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = currentMonthBudgets.reduce((sum, budget) => sum + (categoryTotals[budget.category] || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <TrendingUp className="h-5 w-5 text-yellow-500" />;
      default:
        return <Target className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Set Budget
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalBudget.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{totalRemaining.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totalRemaining >= 0 ? 
                <TrendingUp className="h-6 w-6 text-green-600" /> : 
                <TrendingDown className="h-6 w-6 text-red-600" />
              }
            </div>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Budget Progress - {format(new Date(), 'MMMM yyyy')}
          </h2>
        </div>

        {budgetAnalysis.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No budgets set for this month</p>
            <p className="text-sm">Set your first budget to start tracking your spending goals.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {budgetAnalysis.map((budget) => (
              <div key={budget.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(budget.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                      <p className="text-sm text-gray-500">
                        ₹{budget.spent.toLocaleString()} of ₹{budget.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      budget.status === 'exceeded' ? 'text-red-600' :
                      budget.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {budget.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {budget.remaining >= 0 ? `₹${budget.remaining.toLocaleString()} left` : `₹${Math.abs(budget.remaining).toLocaleString()} over`}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(budget.percentage)}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>

                {budget.status === 'exceeded' && (
                  <p className="mt-2 text-sm text-red-600">
                    You've exceeded your budget by ₹{Math.abs(budget.remaining).toLocaleString()}
                  </p>
                )}
                {budget.status === 'warning' && (
                  <p className="mt-2 text-sm text-yellow-600">
                    You're approaching your budget limit. ₹{budget.remaining.toLocaleString()} remaining.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <BudgetForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default BudgetsView;