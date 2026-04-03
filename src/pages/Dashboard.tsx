import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, Users, Truck, Package, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { sales, customers, suppliers, products, settings } = useAppContext();

  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales
    .filter(s => s.date.startsWith(today))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const totalCustomerDues = customers.reduce((sum, c) => sum + c.totalDue, 0);
  const totalSupplierDues = suppliers.reduce((sum, s) => sum + s.totalDue, 0);
  const totalProducts = products.length;

  const lowStockProducts = products.filter(p => p.stock < 5);
  const recentSales = sales.slice(0, 5);

  const StatCard = ({ title, value, icon, colorClass }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
      <div className={`p-4 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ড্যাশবোর্ড</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="আজকের সেলস" 
          value={`${settings.currencySymbol}${todaysSales}`} 
          icon={<TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />} 
          colorClass="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatCard 
          title="মোট কাস্টমার বকেয়া" 
          value={`${settings.currencySymbol}${totalCustomerDues}`} 
          icon={<Users size={24} className="text-orange-600 dark:text-orange-400" />} 
          colorClass="bg-orange-50 dark:bg-orange-900/30"
        />
        <StatCard 
          title="সাপ্লায়ার বকেয়া" 
          value={`${settings.currencySymbol}${totalSupplierDues}`} 
          icon={<Truck size={24} className="text-red-600 dark:text-red-400" />} 
          colorClass="bg-red-50 dark:bg-red-900/30"
        />
        <StatCard 
          title="মোট প্রোডাক্ট" 
          value={totalProducts} 
          icon={<Package size={24} className="text-green-600 dark:text-green-400" />} 
          colorClass="bg-green-50 dark:bg-green-900/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-red-50 dark:bg-red-900/10">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">লো স্টক এলার্ট</h2>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">কোনো লো স্টক প্রোডাক্ট নেই</p>
            ) : (
              <div className="overflow-x-auto whitespace-nowrap">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2">প্রোডাক্ট</th>
                      <th className="pb-2 text-right">স্টক</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {lowStockProducts.map(p => (
                      <tr key={p.id}>
                        <td className="py-2 text-gray-900 dark:text-gray-100">{p.name}</td>
                        <td className="py-2 text-right font-bold text-red-600 dark:text-red-400">{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <Clock size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">সাম্প্রতিক সেলস</h2>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {recentSales.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">কোনো সেলস রেকর্ড নেই</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map(sale => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sale.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(sale.date), 'dd MMM, hh:mm a')}</p>
                    </div>
                    <div className="text-right font-bold text-blue-600 dark:text-blue-400">
                      {settings.currencySymbol}{sale.totalAmount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
