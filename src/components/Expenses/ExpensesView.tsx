import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';

const ExpensesView: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <ExpenseList />

      {showForm && (
        <ExpenseForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default ExpensesView;