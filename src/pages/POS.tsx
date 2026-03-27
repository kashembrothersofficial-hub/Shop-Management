import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CartItem, Product, Sale } from '../utils/mockData';
import { extractBillData, ExtractedItem } from '../services/gemini';
import { Camera, Search, Plus, Trash2, CheckCircle, Loader2, ShoppingCart } from 'lucide-react';

export const POS: React.FC = () => {
  const { products, setProducts, sales, setSales, customers, setCustomers } = useAppContext();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
  const dueAmount = totalAmount - (Number(paidAmount) || 0);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      updateCartItem(existing.id, 'quantity', existing.quantity + 1);
    } else {
      setCart([...cart, {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.sellPrice,
        total: product.sellPrice
      }]);
    }
    setSearchQuery('');
  };

  const updateCartItem = (id: string, field: keyof CartItem, value: string | number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.price);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleScanBill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const extractedItems = await extractBillData(base64String, file.type);
        
        const newCartItems: CartItem[] = extractedItems.map((item, index) => ({
          id: `scanned-${Date.now()}-${index}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        }));

        setCart(prev => [...prev, ...newCartItems]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("বিল স্ক্যান করতে সমস্যা হয়েছে।");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("কার্টে কোনো পণ্য নেই!");
      return;
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      totalAmount,
      customerName: customerName || 'সাধারণ ক্রেতা',
      paidAmount: Number(paidAmount) || 0,
      dueAmount: dueAmount > 0 ? dueAmount : 0
    };

    // Update Inventory
    const updatedProducts = [...products];
    cart.forEach(cartItem => {
      if (cartItem.productId) {
        const productIndex = updatedProducts.findIndex(p => p.id === cartItem.productId);
        if (productIndex !== -1) {
          updatedProducts[productIndex].stock -= cartItem.quantity;
        }
      }
    });
    setProducts(updatedProducts);

    // Update Customer Dues if applicable
    if (dueAmount > 0 && customerName) {
      const existingCustomerIndex = customers.findIndex(c => c.name === customerName);
      if (existingCustomerIndex !== -1) {
        const updatedCustomers = [...customers];
        updatedCustomers[existingCustomerIndex].totalDue += dueAmount;
        setCustomers(updatedCustomers);
      } else {
        setCustomers([...customers, {
          id: `c-${Date.now()}`,
          name: customerName,
          phone: '',
          totalDue: dueAmount,
          payments: []
        }]);
      }
    }

    setSales([newSale, ...sales]);
    alert("বিক্রয় সফল হয়েছে!");
    
    // Reset
    setCart([]);
    setCustomerName('');
    setPaidAmount('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleScanBill}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} className="mr-2" />}
            <span className="hidden sm:inline">{isScanning ? 'স্ক্যান হচ্ছে...' : 'স্ক্যান বিল'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
              >
                <div className="aspect-square rounded-md bg-gray-200 dark:bg-gray-600 mb-2 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">৳{product.sellPrice}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">স্টক: {product.stock}</span>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                কোনো পণ্য পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">বর্তমান বিক্রয়</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>কার্ট খালি আছে</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                <div className="flex justify-between items-start">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateCartItem(item.id, 'name', e.target.value)}
                    className="font-medium text-gray-900 dark:text-gray-100 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 outline-none px-1 w-full"
                  />
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">পরিমাণ</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">মূল্য (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateCartItem(item.id, 'price', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">মোট</label>
                    <div className="font-bold text-gray-900 dark:text-gray-100 py-1">৳{item.total}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100">
            <span>সর্বমোট:</span>
            <span className="text-blue-600 dark:text-blue-400">৳{totalAmount}</span>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="ক্রেতার নাম (ঐচ্ছিক)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="প্রদত্ত টাকা"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value ? Number(e.target.value) : '')}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg flex flex-col justify-center items-end border border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">বকেয়া</span>
                <span className={`font-bold ${dueAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ৳{dueAmount > 0 ? dueAmount : 0}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full flex items-center justify-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="mr-2" size={24} />
            চেকআউট / প্রিন্ট বিল
          </button>
        </div>
      </div>
    </div>
  );
};
