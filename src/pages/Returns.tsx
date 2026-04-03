import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ReturnRecord } from '../utils/mockData';
import { format } from 'date-fns';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';

export const Returns: React.FC = () => {
  const { returns, setReturns, products, setProducts } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [type, setType] = useState<'return' | 'damage'>('return');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity || Number(quantity) <= 0) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const qty = Number(quantity);

    const newReturn: ReturnRecord = {
      id: `ret-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      type,
      date: new Date(date).toISOString(),
      note: note || (type === 'return' ? 'পণ্য ফেরত' : 'পণ্য নষ্ট/ড্যামেজ')
    };

    // Update stock
    setProducts(products.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          stock: type === 'return' ? p.stock + qty : Math.max(0, p.stock - qty)
        };
      }
      return p;
    }));

    setReturns([newReturn, ...returns]);
    setIsAddModalOpen(false);
    setSelectedProductId('');
    setQuantity('');
    setType('return');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <RotateCcw className="text-orange-600 dark:text-orange-400" />
            পণ্য ফেরত ও ড্যামেজ
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ফেরত এবং নষ্ট হওয়া পণ্যের হিসাব
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          নতুন এন্ট্রি যোগ করুন
        </button>
      </div>

      <div className="flex-1 overflow-x-auto whitespace-nowrap">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 font-medium">তারিখ</th>
              <th className="p-4 font-medium">প্রোডাক্টের নাম</th>
              <th className="p-4 font-medium">ধরন</th>
              <th className="p-4 font-medium text-right">পরিমাণ</th>
              <th className="p-4 font-medium">নোট</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {returns.map(record => (
              <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 text-gray-500 dark:text-gray-400">{format(new Date(record.date), 'dd MMM yyyy')}</td>
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{record.productName}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.type === 'return' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {record.type === 'return' ? 'ফেরত (স্টক +)' : 'ড্যামেজ (স্টক -)'}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-gray-900 dark:text-gray-100">
                  {record.quantity}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400">{record.note}</td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  কোনো রেকর্ড নেই
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Return Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">নতুন এন্ট্রি যোগ করুন</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddReturn} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রোডাক্ট নির্বাচন করুন</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">-- নির্বাচন করুন --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (স্টক: {p.stock})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ধরন</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="return"
                      checked={type === 'return'}
                      onChange={() => setType('return')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-900 dark:text-gray-100">ফেরত (স্টক বাড়বে)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="damage"
                      checked={type === 'damage'}
                      onChange={() => setType('damage')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-900 dark:text-gray-100">ড্যামেজ (স্টক কমবে)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিমাণ</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">তারিখ</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="কারণ লিখুন..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
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
                  disabled={!selectedProductId || !quantity || Number(quantity) <= 0}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
