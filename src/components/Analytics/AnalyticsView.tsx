import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

const AnalyticsView: React.FC = () => {
  const { expenses } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const getPeriodData = () => {
    const now = new Date();
    const months = selectedPeriod === '6months' ? 6 : 12;
    
    return Array.from({ length: months }, (_, i) => {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthExpenses = expenses.filter(expense => 
        expense.date >= monthStart && expense.date <= monthEnd
      );
      
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const categoryTotals = monthExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        month: format(date, 'MMM yyyy'),
        total,
        ...categoryTotals
      };
    }).reverse();
  };

  const getCategoryAnalysis = () => {
    const now = new Date();
    const months = selectedPeriod === '6months' ? 6 : 12;
    const startDate = subMonths(now, months);
    
    const periodExpenses = expenses.filter(expense => expense.date >= startDate);
    
    const categoryTotals = periodExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / periodExpenses.reduce((sum, e) => sum + e.amount, 0)) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getMonthlyTrends = () => {
    const data = getPeriodData();
    return data.map((month, index) => ({
      ...month,
      growth: index > 0 ? ((month.total - data[index - 1].total) / data[index - 1].total) * 100 : 0
    }));
  };

  const periodData = getPeriodData();
  const categoryAnalysis = getCategoryAnalysis();
  const monthlyTrends = getMonthlyTrends();
  
  const totalSpent = periodData.reduce((sum, month) => sum + month.total, 0);
  const averageMonthly = totalSpent / periodData.length;
  const currentMonthTotal = periodData[periodData.length - 1]?.total || 0;
  const previousMonthTotal = periodData[periodData.length - 2]?.total || 0;
  const monthlyGrowth = previousMonthTotal > 0 ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Last {selectedPeriod === '6months' ? '6' : '12'} months</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Average</p>
              <p className="text-2xl font-bold text-gray-900">₹{averageMonthly.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Per month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
              <p className={`text-2xl font-bold ${monthlyGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">From last month</p>
            </div>
            <div className={`p-3 rounded-full ${monthlyGrowth >= 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <TrendingUp className={`h-6 w-6 ${monthlyGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Spending Trend */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} name="Total Spending" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category-wise Monthly Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category-wise Monthly Breakdown</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={periodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              {categoryAnalysis.slice(0, 5).map((category, index) => (
                <Bar 
                  key={category.category} 
                  dataKey={category.category} 
                  fill={COLORS[index % COLORS.length]}
                  name={category.category}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Categories ({selectedPeriod === '6months' ? 'Last 6 Months' : 'Last 12 Months'})
        </h2>
        <div className="space-y-4">
          {categoryAnalysis.slice(0, 8).map((category, index) => (
            <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-gray-900">{category.category}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{category.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;