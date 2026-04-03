import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Supplier, PaymentRecord } from '../utils/mockData';
import { format } from 'date-fns';
import { Search, DollarSign, History, X } from 'lucide-react';

export const SupplierPayments: React.FC = () => {
  const { suppliers, setSuppliers } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNote, setPaymentNote] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone.includes(searchQuery)
  );

  const totalDues = suppliers.reduce((sum, s) => sum + s.totalDue, 0);

  const handleOpenPaymentModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPaymentAmount('');
    setPaymentNote('');
    setIsPaymentModalOpen(true);
  };

  const handleOpenHistoryModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsHistoryModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !paymentAmount || Number(paymentAmount) <= 0) return;

    const amount = Number(paymentAmount);
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      amount,
      note: paymentNote || 'সাপ্লায়ার পেমেন্ট'
    };

    setSuppliers(suppliers.map(s => {
      if (s.id === selectedSupplier.id) {
        return {
          ...s,
          totalDue: Math.max(0, s.totalDue - amount),
          payments: [newPayment, ...s.payments]
        };
      }
      return s;
    }));

    setIsPaymentModalOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">সাপ্লায়ার পেমেন্ট</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            মোট প্রদেয়: <span className="font-bold text-red-600 dark:text-red-400 text-lg">৳{totalDues}</span>
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="সাপ্লায়ারের নাম বা ফোন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto whitespace-nowrap">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 font-medium">সাপ্লায়ারের নাম</th>
              <th className="p-4 font-medium hidden sm:table-cell">ফোন নম্বর</th>
              <th className="p-4 font-medium text-right">মোট প্রদেয়</th>
              <th className="p-4 font-medium text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{supplier.name}</td>
                <td className="p-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{supplier.phone || 'N/A'}</td>
                <td className="p-4 text-right">
                  <span className={`font-bold ${supplier.totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ৳{supplier.totalDue}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleOpenPaymentModal(supplier)}
                      disabled={supplier.totalDue <= 0}
                      className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors inline-flex items-center disabled:opacity-30 disabled:cursor-not-allowed"
                      title="পরিশোধ করুন"
                    >
                      <DollarSign size={18} />
                    </button>
                    <button 
                      onClick={() => handleOpenHistoryModal(supplier)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors inline-flex items-center"
                      title="হিসাব দেখুন"
                    >
                      <History size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  কোনো সাপ্লায়ার পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">সাপ্লায়ার পেমেন্ট</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSavePayment} className="p-4 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/30 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">সাপ্লায়ার: <span className="font-bold text-gray-900 dark:text-gray-100">{selectedSupplier.name}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">মোট প্রদেয়: <span className="font-bold text-red-600 dark:text-red-400">৳{selectedSupplier.totalDue}</span></p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রদানের পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedSupplier.totalDue}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  placeholder="যেমন: নগদ প্রদান"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!paymentAmount || Number(paymentAmount) <= 0}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  প্রদান করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">পেমেন্টের ইতিহাস</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSupplier.name}</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {selectedSupplier.payments.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  কোনো পেমেন্টের রেকর্ড নেই
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSupplier.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(payment.date), 'dd MMM yyyy, hh:mm a')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{payment.note}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">- ৳{payment.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
