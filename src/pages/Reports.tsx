import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, TrendingUp, Package } from 'lucide-react';

export const Reports: React.FC = () => {
  const { sales, products, dayCloseRecords, setDayCloseRecords } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profit' | 'best-sellers' | 'day-close'>('profit');
  const [dayCloseNote, setDayCloseNote] = useState('');

  // Profit Calculation
  const totalProfit = useMemo(() => {
    return sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  }, [sales]);

  const totalSalesAmount = useMemo(() => {
    return sales.reduce((sum, sale) => sum + sale.finalTotal, 0);
  }, [sales]);

  // Best Sellers
  const bestSellers = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId || item.name]) {
          productSales[item.productId || item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId || item.name].quantity += item.quantity;
        productSales[item.productId || item.name].revenue += item.total;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [sales]);

  // Day Close
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = useMemo(() => {
    return sales.filter(s => s.date.startsWith(today));
  }, [sales, today]);

  const todaysTotalSales = todaysSales.reduce((sum, s) => sum + s.finalTotal, 0);
  const todaysTotalCash = todaysSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const todaysTotalProfit = todaysSales.reduce((sum, s) => sum + (s.profit || 0), 0);

  const isDayClosed = dayCloseRecords.some(r => r.date.startsWith(today));

  const handleCloseDay = () => {
    if (isDayClosed) {
      alert('আজকের দিন ইতিমধ্যে শেষ করা হয়েছে।');
      return;
    }
    
    if (window.confirm('আপনি কি নিশ্চিত যে আজকের হিসাব বন্ধ করতে চান?')) {
      const newRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        totalSales: todaysTotalSales,
        totalCash: todaysTotalCash,
        totalProfit: todaysTotalProfit,
        note: dayCloseNote
      };
      setDayCloseRecords([...dayCloseRecords, newRecord]);
      setDayCloseNote('');
      alert('আজকের হিসাব সফলভাবে বন্ধ করা হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">রিপোর্ট ও অ্যানালিটিক্স</h1>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('profit')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'profit'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          লাভ-ক্ষতির হিসাব
        </button>
        <button
          onClick={() => setActiveTab('best-sellers')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'best-sellers'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          বেস্ট সেলার
        </button>
        <button
          onClick={() => setActiveTab('day-close')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'day-close'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          ডেইলি ক্যাশ রেজিস্টার
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        
        {/* Profit Report */}
        {activeTab === 'profit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg text-green-600 dark:text-green-300">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">মোট লাভ</h3>
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">৳ {totalProfit.toLocaleString()}</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">মোট বিক্রয়</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">৳ {totalSalesAmount.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              * লাভ হিসাব করা হয়েছে: (বিক্রয় মূল্য - ক্রয় মূল্য) × পরিমাণ
            </p>
          </div>
        )}

        {/* Best Sellers */}
        {activeTab === 'best-sellers' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">সর্বোচ্চ বিক্রিত পণ্য (টপ ১০)</h3>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestSellers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickFormatter={(value) => value.substring(0, 10) + '...'} />
                  <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                    itemStyle={{ color: '#F9FAFB' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="quantity" name="পরিমাণ (টি)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" name="বিক্রয় (৳)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">পণ্যের নাম</th>
                    <th className="px-4 py-3 text-right">মোট বিক্রিত পরিমাণ</th>
                    <th className="px-4 py-3 text-right">মোট আয়</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellers.map((item, index) => (
                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">৳ {item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Day Close */}
        {activeTab === 'day-close' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">আজকের হিসাব ({new Date().toLocaleDateString('bn-BD')})</h3>
              {isDayClosed && (
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                  হিসাব বন্ধ করা হয়েছে
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">আজকের মোট বিক্রয়</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">৳ {todaysTotalSales.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">আজকের নগদ গ্রহণ</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">৳ {todaysTotalCash.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">আজকের লাভ</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">৳ {todaysTotalProfit.toLocaleString()}</p>
              </div>
            </div>

            {!isDayClosed && (
              <div className="mt-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    নোট / মন্তব্য (ঐচ্ছিক)
                  </label>
                  <textarea
                    value={dayCloseNote}
                    onChange={(e) => setDayCloseNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="আজকের হিসাব সম্পর্কে কোনো নোট থাকলে লিখুন..."
                  />
                </div>
                <button
                  onClick={handleCloseDay}
                  className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar size={20} />
                  <span>দিন শেষ করুন (Close Register)</span>
                </button>
              </div>
            )}

            {/* Past Day Close Records */}
            {dayCloseRecords.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">পূর্বের হিসাবসমূহ</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-3">তারিখ</th>
                        <th className="px-4 py-3 text-right">মোট বিক্রয়</th>
                        <th className="px-4 py-3 text-right">নগদ গ্রহণ</th>
                        <th className="px-4 py-3 text-right">লাভ</th>
                        <th className="px-4 py-3">নোট</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayCloseRecords.slice().reverse().map((record) => (
                        <tr key={record.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3">{new Date(record.date).toLocaleDateString('bn-BD')}</td>
                          <td className="px-4 py-3 text-right">৳ {record.totalSales.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-green-600">৳ {record.totalCash.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-blue-600">৳ {record.totalProfit.toLocaleString()}</td>
                          <td className="px-4 py-3 truncate max-w-xs">{record.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
