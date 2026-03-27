import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Package, History, Users, Truck, Sun, Moon, Menu, X } from 'lucide-react';

export const Layout: React.FC = () => {
  const { theme, toggleTheme } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <ShoppingCart size={20} />, label: 'বিক্রয় কেন্দ্র' },
    { to: '/inventory', icon: <Package size={20} />, label: 'স্টক ম্যানেজমেন্ট' },
    { to: '/sales-history', icon: <History size={20} />, label: 'বিক্রয়ের ইতিহাস' },
    { to: '/customer-dues', icon: <Users size={20} />, label: 'বকেয়া খাতা' },
    { to: '/supplier-payments', icon: <Truck size={20} />, label: 'সাপ্লায়ার পেমেন্ট' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">স্মার্ট দোকান</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon size={20} className="mr-3" />
                ডার্ক মোড
              </>
            ) : (
              <>
                <Sun size={20} className="mr-3" />
                লাইট মোড
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <Menu size={24} />
          </button>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">স্মার্ট দোকান</span>
          <div className="w-6" /> {/* Spacer for centering */}
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
