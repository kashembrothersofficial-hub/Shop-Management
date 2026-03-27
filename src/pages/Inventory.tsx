import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../utils/mockData';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products, setProducts } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    image: ''
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        buyPrice: 0,
        sellPrice: 0,
        stock: 0,
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p));
    } else {
      const newProduct: Product = {
        ...(formData as Product),
        id: `p-${Date.now()}`,
        image: formData.image || `https://picsum.photos/seed/${Date.now()}/200`
      };
      setProducts([...products, newProduct]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">স্টক ম্যানেজমেন্ট</h1>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={20} className="mr-2" />
            নতুন পণ্য
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 font-medium">ছবি</th>
              <th className="p-4 font-medium">পণ্যের নাম</th>
              <th className="p-4 font-medium">ক্যাটাগরি</th>
              <th className="p-4 font-medium text-right">ক্রয় মূল্য</th>
              <th className="p-4 font-medium text-right">বিক্রয় মূল্য</th>
              <th className="p-4 font-medium text-right">স্টক</th>
              <th className="p-4 font-medium text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4">
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover bg-gray-200 dark:bg-gray-600" />
                </td>
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                <td className="p-4 text-gray-500 dark:text-gray-400">{product.category}</td>
                <td className="p-4 text-right text-gray-900 dark:text-gray-100">৳{product.buyPrice}</td>
                <td className="p-4 text-right text-gray-900 dark:text-gray-100">৳{product.sellPrice}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock < 10 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleOpenModal(product)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  কোনো পণ্য পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যুক্ত করুন'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পণ্যের নাম</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্যাটাগরি</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.buyPrice}
                    onChange={e => setFormData({...formData, buyPrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বিক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.sellPrice}
                    onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">স্টক পরিমাণ</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ছবির URL (ঐচ্ছিক)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
