import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { Edit, Trash2, Search, Filter } from 'lucide-react';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../types';

const ExpenseList: React.FC = () => {
  const { expenses, deleteExpense } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || expense.category === filterCategory;
    const matchesPaymentMethod = !filterPaymentMethod || expense.paymentMethod === filterPaymentMethod;
    const matchesDate = !filterDate || format(expense.date, 'yyyy-MM-dd') === filterDate;
    
    return matchesSearch && matchesCategory && matchesPaymentMethod && matchesDate;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterPaymentMethod('');
    setFilterDate('');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Food': 'bg-orange-100 text-orange-800',
      'Rent': 'bg-purple-100 text-purple-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Entertainment': 'bg-green-100 text-green-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Utilities': 'bg-gray-100 text-gray-800',
      'Travel': 'bg-yellow-100 text-yellow-800',
      'Others': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search expenses..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {(searchTerm || filterCategory || filterPaymentMethod || filterDate) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredExpenses.length} of {expenses.length} expenses shown
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {expenses.length === 0 ? 'No expenses found. Add your first expense!' : 'No expenses match your filters.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                      <span className="text-sm text-gray-500">{expense.paymentMethod}</span>
                      <span className="text-sm text-gray-500">{format(expense.date, 'MMM dd, yyyy')}</span>
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-gray-600 mb-2">{expense.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{expense.amount.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {/* TODO: Add edit functionality */}}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;