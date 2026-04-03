import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Expense } from '../utils/mockData';
import { format } from 'date-fns';
import { Plus, Wallet, Trash2 } from 'lucide-react';

export const Expenses: React.FC = () => {
  const { expenses, setExpenses, settings } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !amount || Number(amount) <= 0) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      reason,
      amount: Number(amount),
      date: new Date(date).toISOString(),
    };

    setExpenses([newExpense, ...expenses]);
    setIsAddModalOpen(false);
    setReason('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই খরচটি মুছে ফেলতে চান?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Wallet className="text-blue-600 dark:text-blue-400" />
            দৈনন্দিন খরচের খাতা
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            মোট খরচ: <span className="font-bold text-red-600 dark:text-red-400 text-lg">{settings.currencySymbol}{totalExpenses}</span>
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          নতুন খরচ যোগ করুন
        </button>
      </div>

      <div className="flex-1 overflow-x-auto whitespace-nowrap">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 font-medium">তারিখ</th>
              <th className="p-4 font-medium">খরচের কারণ</th>
              <th className="p-4 font-medium text-right">পরিমাণ</th>
              <th className="p-4 font-medium text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map(expense => (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 text-gray-500 dark:text-gray-400">{format(new Date(expense.date), 'dd MMM yyyy')}</td>
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{expense.reason}</td>
                <td className="p-4 text-right font-bold text-red-600 dark:text-red-400">
                  {settings.currencySymbol}{expense.amount}
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors inline-flex items-center"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  কোনো খরচের রেকর্ড নেই
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">নতুন খরচ যোগ করুন</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Trash2 size={24} className="hidden" /> {/* Placeholder for alignment */}
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">খরচের কারণ</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="যেমন: চা-নাস্তা, যাতায়াত"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিমাণ ({settings.currencySymbol})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">তারিখ</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!reason || !amount || Number(amount) <= 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
