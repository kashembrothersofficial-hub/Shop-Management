import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { CartItem, Product, Sale, HeldSale } from '../utils/mockData';
import { extractBillData, ExtractedItem } from '../services/gemini';
import { Camera, Search, Plus, Trash2, CheckCircle, Loader2, ShoppingCart, PauseCircle, PlayCircle, Printer, Share2, X } from 'lucide-react';
import { format } from 'date-fns';

export const POS: React.FC = () => {
  const { products, setProducts, sales, setSales, customers, setCustomers, settings, heldSales, setHeldSales } = useAppContext();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [vat, setVat] = useState<number | ''>('');
  const [isScanning, setIsScanning] = useState(false);
  const [showHeldSales, setShowHeldSales] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = Number(discount) || 0;
  const vatAmount = (totalAmount * (Number(vat) || 0)) / 100;
  const finalTotal = totalAmount - discountAmount + vatAmount;
  const dueAmount = finalTotal - (Number(paidAmount) || 0);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        // Focus paid amount or trigger checkout
        const paidInput = document.getElementById('paid-amount-input');
        if (paidInput) paidInput.focus();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customerName, paidAmount, discount, vat]);

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
        buyPrice: product.buyPrice,
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

  const handleHoldSale = () => {
    if (cart.length === 0) {
      alert("কার্টে কোনো পণ্য নেই!");
      return;
    }
    
    const note = prompt("হোল্ড সেলের জন্য একটি নোট লিখুন (ঐচ্ছিক):", customerName || "সাধারণ ক্রেতা");
    if (note === null) return; // Cancelled

    const newHeldSale: HeldSale = {
      id: `held-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      customerName: customerName,
      note: note || "কোনো নোট নেই"
    };

    setHeldSales([newHeldSale, ...heldSales]);
    
    // Reset cart
    setCart([]);
    setCustomerName('');
    setPaidAmount('');
    setDiscount('');
    setVat('');
    alert("সেল হোল্ড করা হয়েছে!");
  };

  const restoreHeldSale = (heldSale: HeldSale) => {
    if (cart.length > 0) {
      if (!window.confirm("বর্তমান কার্টের আইটেম মুছে যাবে। আপনি কি নিশ্চিত?")) {
        return;
      }
    }
    setCart(heldSale.items);
    setCustomerName(heldSale.customerName);
    setHeldSales(heldSales.filter(h => h.id !== heldSale.id));
    setShowHeldSales(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("কার্টে কোনো পণ্য নেই!");
      return;
    }

    const totalProfit = cart.reduce((sum, item) => {
      const itemProfit = (item.price - (item.buyPrice || 0)) * item.quantity;
      return sum + itemProfit;
    }, 0) - discountAmount;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      totalAmount,
      discount: discountAmount,
      vat: vatAmount,
      finalTotal,
      profit: totalProfit,
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
    setCompletedSale(newSale);
    
    // Reset
    setCart([]);
    setCustomerName('');
    setPaidAmount('');
    setDiscount('');
    setVat('');
    setIsMobileCartOpen(false);
  };

  const shareOnWhatsApp = (sale: Sale) => {
    let text = `*${settings.shopName}*\n`;
    text += `ইনভয়েস: ${sale.id}\n`;
    text += `তারিখ: ${format(new Date(sale.date), 'dd/MM/yyyy hh:mm a')}\n`;
    text += `ক্রেতা: ${sale.customerName}\n\n`;
    
    sale.items.forEach(item => {
      text += `${item.name} x ${item.quantity} = ৳${item.total}\n`;
    });
    
    text += `\nমোট: ৳${sale.totalAmount}\n`;
    if (sale.discount > 0) text += `ডিসকাউন্ট: -৳${sale.discount}\n`;
    if (sale.vat > 0) text += `ভ্যাট: +৳${sale.vat}\n`;
    text += `*সর্বমোট: ৳${sale.finalTotal}*\n`;
    text += `প্রদত্ত: ৳${sale.paidAmount}\n`;
    if (sale.dueAmount > 0) text += `*বকেয়া: ৳${sale.dueAmount}*\n`;
    
    text += `\nধন্যবাদ!`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full relative">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="পণ্য খুঁজুন (F1)..."
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

        <div className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
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
      <div className={`w-full lg:w-[400px] flex flex-col bg-white dark:bg-gray-800 lg:rounded-xl shadow-sm border-l lg:border border-gray-200 dark:border-gray-700 overflow-hidden fixed lg:static inset-0 z-40 lg:z-auto transition-transform duration-300 ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">বর্তমান বিক্রয়</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHeldSales(true)}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors relative"
              title="হোল্ড সেলস দেখুন"
            >
              <PlayCircle size={20} />
              {heldSales.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {heldSales.length}
                </span>
              )}
            </button>
            <button
              onClick={handleHoldSale}
              disabled={cart.length === 0}
              className="p-2 text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-lg transition-colors disabled:opacity-50"
              title="সেল হোল্ড করুন"
            >
              <PauseCircle size={20} />
            </button>
          </div>
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
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>মোট:</span>
            <span>৳{totalAmount}</span>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">ডিসকাউন্ট (৳)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">ভ্যাট (%)</label>
              <input
                type="number"
                min="0"
                value={vat}
                onChange={(e) => setVat(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>সর্বমোট:</span>
            <span className="text-blue-600 dark:text-blue-400">৳{finalTotal}</span>
          </div>
          
          <div className="space-y-2 pt-2">
            <input
              type="text"
              placeholder="ক্রেতার নাম (ঐচ্ছিক)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <input
                id="paid-amount-input"
                type="number"
                placeholder="প্রদত্ত টাকা (F2)"
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
            চেকআউট (Ctrl+Enter)
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {!isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors shadow-md"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={24} />
              <span>কার্ট দেখুন ({cart.length})</span>
            </div>
            <span>৳{finalTotal}</span>
          </button>
        </div>
      )}

      {/* Held Sales Modal */}
      {showHeldSales && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">হোল্ড সেলস</h2>
              <button onClick={() => setShowHeldSales(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {heldSales.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">কোনো হোল্ড সেল নেই</p>
              ) : (
                heldSales.map(hs => (
                  <div key={hs.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{hs.note}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(hs.date), 'dd/MM/yyyy hh:mm a')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{hs.items.length} টি আইটেম</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => restoreHeldSale(hs)} className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg">
                        <PlayCircle size={20} />
                      </button>
                      <button onClick={() => setHeldSales(heldSales.filter(h => h.id !== hs.id))} className="p-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 rounded-lg">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="mr-2" size={24} />
                <h2 className="text-xl font-bold">বিক্রয় সফল!</h2>
              </div>
              <button onClick={() => setCompletedSale(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            
            <div id="receipt-content" className="p-6 overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <div className="text-center mb-6 border-b border-dashed border-gray-300 dark:border-gray-600 pb-4">
                <h3 className="text-2xl font-bold mb-1">{settings.shopName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{settings.address}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">ফোন: {settings.phone}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">তারিখ: {format(new Date(completedSale.date), 'dd/MM/yyyy hh:mm a')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">ইনভয়েস: {completedSale.id}</p>
              </div>

              <div className="mb-4">
                <p><span className="font-medium">ক্রেতার নাম:</span> {completedSale.customerName}</p>
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
                  {completedSale.items.map((item, idx) => (
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
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>মোট:</span>
                  <span>৳{completedSale.totalAmount}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>ডিসকাউন্ট:</span>
                    <span>-৳{completedSale.discount}</span>
                  </div>
                )}
                {completedSale.vat > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>ভ্যাট:</span>
                    <span>+৳{completedSale.vat}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>সর্বমোট:</span>
                  <span>৳{completedSale.finalTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 pt-2">
                  <span>প্রদত্ত:</span>
                  <span>৳{completedSale.paidAmount}</span>
                </div>
                {completedSale.dueAmount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                    <span>বকেয়া:</span>
                    <span>৳{completedSale.dueAmount}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => shareOnWhatsApp(completedSale)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Share2 size={18} className="mr-2" />
                WhatsApp-এ পাঠান
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Printer size={18} className="mr-2" />
                প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
