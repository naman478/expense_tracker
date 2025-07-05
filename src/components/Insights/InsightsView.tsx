import React from 'react';
import { useData } from '../../context/DataContext';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  DollarSign,
  Calendar,
  CreditCard,
  ShoppingCart
} from 'lucide-react';

const InsightsView: React.FC = () => {
  const { expenses, budgets, suggestions } = useData();

  // Current month calculations
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const lastMonth = subMonths(currentMonth, 1);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);

  const currentMonthExpenses = expenses.filter(expense => 
    expense.date >= monthStart && expense.date <= monthEnd
  );
  
  const lastMonthExpenses = expenses.filter(expense => 
    expense.date >= lastMonthStart && expense.date <= lastMonthEnd
  );

  // Generate insights
  const generateInsights = () => {
    const insights = [];
    
    // Monthly comparison
    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;
    
    if (monthlyChange > 10) {
      insights.push({
        type: 'warning',
        title: 'Spending Increased',
        description: `Your spending increased by ${monthlyChange.toFixed(1)}% compared to last month (₹${Math.abs(currentTotal - lastTotal).toLocaleString()} more).`,
        icon: TrendingUp,
        color: 'orange'
      });
    } else if (monthlyChange < -10) {
      insights.push({
        type: 'positive',
        title: 'Great Savings!',
        description: `You saved ₹${Math.abs(currentTotal - lastTotal).toLocaleString()} this month compared to last month (${Math.abs(monthlyChange).toFixed(1)}% decrease).`,
        icon: TrendingDown,
        color: 'green'
      });
    }

    // Category analysis
    const currentCategoryTotals = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const lastCategoryTotals = lastMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Find categories with significant changes
    Object.entries(currentCategoryTotals).forEach(([category, currentAmount]) => {
      const lastAmount = lastCategoryTotals[category] || 0;
      if (lastAmount > 0) {
        const change = ((currentAmount - lastAmount) / lastAmount) * 100;
        if (change > 25) {
          insights.push({
            type: 'info',
            title: `${category} Spending Up`,
            description: `Your ${category} expenses increased by ${change.toFixed(1)}% this month.`,
            icon: ShoppingCart,
            color: 'blue'
          });
        }
      }
    });

    // Payment method analysis
    const paymentMethods = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.paymentMethod] = (acc[expense.paymentMethod] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topPaymentMethod = Object.entries(paymentMethods)
      .sort(([,a], [,b]) => b - a)[0];

    if (topPaymentMethod) {
      const percentage = (topPaymentMethod[1] / currentTotal) * 100;
      if (percentage > 50) {
        insights.push({
          type: 'info',
          title: 'Payment Method Preference',
          description: `You used ${topPaymentMethod[0]} for ${percentage.toFixed(1)}% of your expenses this month.`,
          icon: CreditCard,
          color: 'purple'
        });
      }
    }

    // Weekend vs weekday spending
    const weekendExpenses = currentMonthExpenses.filter(expense => {
      const day = expense.date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    
    const weekdayExpenses = currentMonthExpenses.filter(expense => {
      const day = expense.date.getDay();
      return day !== 0 && day !== 6;
    });

    const weekendTotal = weekendExpenses.reduce((sum, e) => sum + e.amount, 0);
    const weekdayTotal = weekdayExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (weekendTotal > weekdayTotal && weekendExpenses.length > 0) {
      insights.push({
        type: 'info',
        title: 'Weekend Spending Pattern',
        description: `You tend to spend more on weekends (₹${weekendTotal.toLocaleString()}) than weekdays (₹${weekdayTotal.toLocaleString()}).`,
        icon: Calendar,
        color: 'indigo'
      });
    }

    // Large expense detection
    const largeExpenses = currentMonthExpenses.filter(expense => expense.amount > 5000);
    if (largeExpenses.length > 0) {
      const largeTotal = largeExpenses.reduce((sum, e) => sum + e.amount, 0);
      const largePercentage = (largeTotal / currentTotal) * 100;
      insights.push({
        type: 'info',
        title: 'Large Expenses',
        description: `You had ${largeExpenses.length} large expenses (>₹5,000) this month, totaling ₹${largeTotal.toLocaleString()} (${largePercentage.toFixed(1)}% of total spending).`,
        icon: DollarSign,
        color: 'red'
      });
    }

    // Budget performance
    const currentMonthBudgets = budgets.filter(budget => 
      budget.month === format(currentMonth, 'yyyy-MM')
    );

    const performingBudgets = currentMonthBudgets.filter(budget => {
      const spent = currentCategoryTotals[budget.category] || 0;
      return spent <= budget.amount * 0.8; // Under 80% of budget
    });

    if (performingBudgets.length > 0) {
      insights.push({
        type: 'positive',
        title: 'Budget Performance',
        description: `You're staying within budget for ${performingBudgets.length} categories. Great financial discipline!`,
        icon: Target,
        color: 'green'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getIconColor = (color: string) => {
    const colors = {
      orange: 'text-orange-600 bg-orange-100',
      green: 'text-green-600 bg-green-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      red: 'text-red-600 bg-red-100'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getBorderColor = (type: string) => {
    const colors = {
      warning: 'border-orange-200',
      positive: 'border-green-200',
      info: 'border-blue-200'
    };
    return colors[type as keyof typeof colors] || 'border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Smart Insights</h1>
        <div className="text-sm text-gray-500">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-blue-500 mr-2" />
            AI-Powered Recommendations
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className={`p-4 rounded-md border ${
                suggestion.severity === 'high' ? 'bg-red-50 border-red-200' :
                suggestion.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    suggestion.severity === 'high' ? 'bg-red-100' :
                    suggestion.severity === 'medium' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      suggestion.severity === 'high' ? 'text-red-600' :
                      suggestion.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{suggestion.suggestion}</p>
                    {suggestion.category && (
                      <p className="text-xs text-gray-500 mt-1">Category: {suggestion.category}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          Spending Insights
        </h2>
        
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No insights available yet</p>
            <p className="text-sm">Add more expenses to get personalized insights about your spending patterns.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className={`p-4 rounded-md border ${getBorderColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getIconColor(insight.color)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-600 mb-1">Current Month Total</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">{currentMonthExpenses.length} transactions</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-600 mb-1">Last Month Total</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">{lastMonthExpenses.length} transactions</p>
          </div>
        </div>
      </div>

      {/* Tips for Better Financial Health */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 text-blue-500 mr-2" />
          Financial Health Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">Review your expenses weekly to stay on track with your budget.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">Set up automatic transfers to your savings account.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">Track every expense, no matter how small.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">Plan for unexpected expenses with an emergency fund.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">Compare prices before making large purchases.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsView;