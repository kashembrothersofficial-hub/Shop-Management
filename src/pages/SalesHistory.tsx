import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Sale } from '../utils/mockData';
import { format } from 'date-fns';
import { Search, Calendar, Eye, X, Receipt } from 'lucide-react';

export const SalesHistory: React.FC = () => {
  const { sales, settings } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || sale.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = dateFilter ? sale.date.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">বিক্রয়ের ইতিহাস</h1>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ক্রেতা বা ইনভয়েস..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="relative flex-1 sm:w-40">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 font-medium">তারিখ</th>
              <th className="p-4 font-medium">ইনভয়েস নং</th>
              <th className="p-4 font-medium">ক্রেতার নাম</th>
              <th className="p-4 font-medium text-right">মোট মূল্য</th>
              <th className="p-4 font-medium text-right">প্রদত্ত</th>
              <th className="p-4 font-medium text-right">বকেয়া</th>
              <th className="p-4 font-medium text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSales.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 text-gray-900 dark:text-gray-100">{format(new Date(sale.date), 'dd MMM, yyyy')}</td>
                <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{sale.id}</td>
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{sale.customerName}</td>
                <td className="p-4 text-right font-bold text-gray-900 dark:text-gray-100">৳{sale.totalAmount}</td>
                <td className="p-4 text-right text-green-600 dark:text-green-400">৳{sale.paidAmount}</td>
                <td className="p-4 text-right text-red-600 dark:text-red-400">৳{sale.dueAmount}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => setSelectedSale(sale)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors inline-flex items-center"
                  >
                    <Eye size={18} className="mr-1" /> রসিদ
                  </button>
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  কোনো বিক্রয়ের রেকর্ড পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center text-gray-900 dark:text-gray-100">
                <Receipt className="mr-2" size={24} />
                <h2 className="text-xl font-bold">ক্যাশ মেমো</h2>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <div className="text-center mb-6 border-b border-dashed border-gray-300 dark:border-gray-600 pb-4">
                <h3 className="text-2xl font-bold mb-1">{settings.shopName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{settings.address}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">ফোন: {settings.phone}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">তারিখ: {format(new Date(selectedSale.date), 'dd/MM/yyyy hh:mm a')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">ইনভয়েস: {selectedSale.id}</p>
              </div>

              <div className="mb-4">
                <p><span className="font-medium">ক্রেতার নাম:</span> {selectedSale.customerName}</p>
              </div>

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">বিবরণ</th>
                    <th className="text-center py-2">পরিমাণ</th>
                    <th className="text-right py-2">দর</th>
                    <th className="text-right py-2">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {selectedSale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2">{item.name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">৳{item.price}</td>
                      <td className="text-right py-2 font-medium">৳{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>সর্বমোট:</span>
                  <span>৳{selectedSale.totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>প্রদত্ত:</span>
                  <span>৳{selectedSale.paidAmount}</span>
                </div>
                {selectedSale.dueAmount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                    <span>বকেয়া:</span>
                    <span>৳{selectedSale.dueAmount}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
