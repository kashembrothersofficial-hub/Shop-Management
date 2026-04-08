import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Supplier, PaymentRecord } from '../utils/mockData';
import { downloadCSV } from '../utils/export';
import { format } from 'date-fns';
import { Search, DollarSign, History, X, Plus, PackagePlus, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SupplierPayments: React.FC = () => {
  const { suppliers, setSuppliers, products, setProducts } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNote, setPaymentNote] = useState('');

  const [purchaseProductId, setPurchaseProductId] = useState('');
  const [purchaseQuantity, setPurchaseQuantity] = useState<number | ''>('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [purchaseNote, setPurchaseNote] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone.includes(searchQuery)
  );

  const totalDues = suppliers.reduce((sum, s) => sum + s.totalDue, 0);

  const handleExportCSV = () => {
    const dataToExport = filteredSuppliers.map(s => ({
      'সাপ্লায়ারের নাম': s.name,
      'ফোন নম্বর': s.phone || 'N/A',
      'মোট প্রদেয়': s.totalDue
    }));
    downloadCSV(dataToExport, `supplier_dues_${new Date().toISOString().split('T')[0]}`);
  };

  const handleOpenPaymentModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPaymentAmount('');
    setPaymentNote('');
    setIsPaymentModalOpen(true);
  };

  const handleOpenPurchaseModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPurchaseProductId('');
    setPurchaseQuantity('');
    setPurchasePrice('');
    setPurchaseNote('');
    setIsPurchaseModalOpen(true);
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

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !purchaseProductId || !purchaseQuantity || !purchasePrice) return;

    const qty = Number(purchaseQuantity);
    const price = Number(purchasePrice);
    const totalCost = qty * price;

    const product = products.find(p => p.id === purchaseProductId);
    if (!product) return;

    const newPurchaseRecord: PaymentRecord = {
      id: `pur-${Date.now()}`,
      date: new Date().toISOString(),
      amount: -totalCost, // Negative amount in payments array represents adding to due
      note: purchaseNote || `${product.name} ক্রয় (${qty} x ৳${price})`
    };

    // Update supplier due
    setSuppliers(suppliers.map(s => {
      if (s.id === selectedSupplier.id) {
        return {
          ...s,
          totalDue: s.totalDue + totalCost,
          payments: [newPurchaseRecord, ...s.payments]
        };
      }
      return s;
    }));

    // Update product stock and buy price
    setProducts(products.map(p => {
      if (p.id === purchaseProductId) {
        return {
          ...p,
          stock: p.stock + qty,
          buyPrice: price // Update to latest buy price
        };
      }
      return p;
    }));

    setIsPurchaseModalOpen(false);
    setSelectedSupplier(null);
  };

  const getLedgerEntries = (supplier: Supplier) => {
    let currentBalance = supplier.totalDue;
    const sortedPayments = [...supplier.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const entries = sortedPayments.map(entry => {
      const balanceAfterTransaction = currentBalance;
      currentBalance = currentBalance + entry.amount;
      return {
        ...entry,
        balance: balanceAfterTransaction
      };
    });

    if (currentBalance > 0) {
      entries.unshift({
        id: 'initial-balance',
        date: sortedPayments.length > 0 ? new Date(new Date(sortedPayments[0].date).getTime() - 1000).toISOString() : new Date().toISOString(),
        amount: -currentBalance,
        note: 'পূর্বের বকেয়া (Initial Balance)',
        balance: currentBalance
      });
    }

    return entries.reverse();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">সাপ্লায়ার ও ক্রয়</h1>
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
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors whitespace-nowrap"
            title="ডাউনলোড এক্সেল (CSV)"
          >
            <Download size={18} className="mr-1" />
            <span className="hidden sm:inline">এক্সপোর্ট</span>
          </button>
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
                      onClick={() => handleOpenPurchaseModal(supplier)}
                      className="p-2 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-lg transition-colors inline-flex items-center"
                      title="নতুন ক্রয়"
                    >
                      <PackagePlus size={18} />
                    </button>
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
                      title="লেজার দেখুন"
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
      <AnimatePresence>
        {isPaymentModalOpen && selectedSupplier && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-md overflow-hidden flex flex-col"
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Modal */}
      <AnimatePresence>
        {isPurchaseModalOpen && selectedSupplier && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">নতুন ক্রয় (পারচেজ)</h2>
                <button onClick={() => setIsPurchaseModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSavePurchase} className="p-4 space-y-4 overflow-y-auto">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">সাপ্লায়ার: <span className="font-bold text-gray-900 dark:text-gray-100">{selectedSupplier.name}</span></p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রোডাক্ট নির্বাচন করুন</label>
                  <select
                    required
                    value={purchaseProductId}
                    onChange={e => {
                      setPurchaseProductId(e.target.value);
                      const prod = products.find(p => p.id === e.target.value);
                      if (prod) setPurchasePrice(prod.buyPrice);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- নির্বাচন করুন --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (বর্তমান স্টক: {p.stock})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিমাণ</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={purchaseQuantity}
                      onChange={e => setPurchaseQuantity(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্রয় মূল্য (প্রতিটি)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={purchasePrice}
                      onChange={e => setPurchasePrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {purchaseQuantity && purchasePrice && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">মোট খরচ:</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">৳{Number(purchaseQuantity) * Number(purchasePrice)}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নোট (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={purchaseNote}
                    onChange={e => setPurchaseNote(e.target.value)}
                    placeholder="যেমন: চালান নং ১২৩৪"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={!purchaseProductId || !purchaseQuantity || !purchasePrice}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    ক্রয় সম্পন্ন করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ledger Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedSupplier && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">সাপ্লায়ার লেজার (হিসাব)</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSupplier.name} • ফোন: {selectedSupplier.phone || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const ledgerData = getLedgerEntries(selectedSupplier).map(entry => ({
                        'তারিখ': format(new Date(entry.date), 'dd/MM/yyyy hh:mm a'),
                        'বিবরণ': entry.note,
                        'ক্রয়/বিল (৳)': entry.amount < 0 ? Math.abs(entry.amount) : 0,
                        'পরিশোধ (৳)': entry.amount > 0 ? entry.amount : 0,
                        'ব্যালেন্স (৳)': entry.balance
                      }));
                      downloadCSV(ledgerData, `ledger_${selectedSupplier.name}_${new Date().toISOString().split('T')[0]}`);
                    }}
                    className="flex items-center justify-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors text-sm"
                    title="লেজার ডাউনলোড করুন"
                  >
                    <Download size={16} className="mr-1" />
                    এক্সপোর্ট
                  </button>
                  <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-0">
                {getLedgerEntries(selectedSupplier).length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    কোনো লেনদেনের রেকর্ড নেই
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700/90 backdrop-blur-sm shadow-sm z-10">
                      <tr className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <th className="p-3 font-medium">তারিখ</th>
                        <th className="p-3 font-medium">বিবরণ</th>
                        <th className="p-3 font-medium text-right text-red-600 dark:text-red-400">ক্রয়/বিল (ডেবিট)</th>
                        <th className="p-3 font-medium text-right text-green-600 dark:text-green-400">পরিশোধ (ক্রেডিট)</th>
                        <th className="p-3 font-medium text-right text-blue-600 dark:text-blue-400">ব্যালেন্স</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getLedgerEntries(selectedSupplier).map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
                          <td className="p-3 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {format(new Date(entry.date), 'dd MMM yyyy, hh:mm a')}
                          </td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">
                            {entry.note}
                          </td>
                          <td className="p-3 text-right font-medium text-red-600 dark:text-red-400">
                            {entry.amount < 0 ? `৳${Math.abs(entry.amount)}` : '-'}
                          </td>
                          <td className="p-3 text-right font-medium text-green-600 dark:text-green-400">
                            {entry.amount > 0 ? `৳${entry.amount}` : '-'}
                          </td>
                          <td className="p-3 text-right font-bold text-gray-900 dark:text-gray-100">
                            ৳{entry.balance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                 <div className="text-right">
                   <p className="text-sm text-gray-500 dark:text-gray-400">বর্তমান বকেয়া</p>
                   <p className="text-xl font-bold text-red-600 dark:text-red-400">৳{selectedSupplier.totalDue}</p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
