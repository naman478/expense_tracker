import React from 'react';
import { useData } from '../../context/DataContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  Target
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DashboardView: React.FC = () => {
  const { expenses, budgets, suggestions } = useData();

  // Current month calculations
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date >= monthStart && expense.date <= monthEnd
  );

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Category analysis
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)[0];

  // Payment method analysis
  const paymentMethodTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.paymentMethod] = (acc[expense.paymentMethod] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topPaymentMethods = Object.entries(paymentMethodTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Pie chart data
  const pieChartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
    percentage: ((amount / totalSpent) * 100).toFixed(1)
  }));

  // Line chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const lineChartData = last7Days.map(date => {
    const dayExpenses = expenses.filter(expense => 
      expense.date.toDateString() === date.toDateString()
    );
    const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      date: format(date, 'MMM dd'),
      amount: dayTotal
    };
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Budget alerts
  const currentMonthBudgets = budgets.filter(budget => 
    budget.month === format(currentMonth, 'yyyy-MM')
  );

  const budgetAlerts = currentMonthBudgets.map(budget => {
    const spent = categoryTotals[budget.category] || 0;
    const percentage = (spent / budget.amount) * 100;
    return {
      category: budget.category,
      spent,
      budget: budget.amount,
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
    };
  }).filter(alert => alert.status !== 'good');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Category</p>
              <p className="text-2xl font-bold text-gray-900">{topCategory?.[0] || 'N/A'}</p>
              <p className="text-sm text-gray-500">₹{topCategory?.[1]?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{currentMonthExpenses.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{budgetAlerts.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            Budget Alerts
          </h2>
          <div className="space-y-3">
            {budgetAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-md border ${
                alert.status === 'exceeded' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{alert.category}</p>
                    <p className="text-sm text-gray-600">
                      ₹{alert.spent.toLocaleString()} of ₹{alert.budget.toLocaleString()} ({alert.percentage.toFixed(0)}%)
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.status === 'exceeded' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alert.status === 'exceeded' ? 'Exceeded' : 'Warning'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          {pieChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend (Last 7 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Payment Methods */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Payment Methods</h2>
        <div className="space-y-3">
          {topPaymentMethods.map(([method, amount], index) => (
            <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">{method}</span>
              </div>
              <span className="text-gray-600">₹{amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-blue-500 mr-2" />
            Smart Suggestions
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className={`p-3 rounded-md border ${
                suggestion.severity === 'high' ? 'bg-red-50 border-red-200' :
                suggestion.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-sm text-gray-800">{suggestion.suggestion}</p>
                {suggestion.category && (
                  <p className="text-xs text-gray-500 mt-1">Category: {suggestion.category}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;