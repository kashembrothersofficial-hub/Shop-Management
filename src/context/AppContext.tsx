import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, Customer, Supplier, ShopSettings, HeldSale, Employee, AttendanceRecord, DayCloseRecord, initialProducts, initialSales, initialCustomers, initialSuppliers, initialSettings, initialEmployees } from '../utils/mockData';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  settings: ShopSettings;
  setSettings: React.Dispatch<React.SetStateAction<ShopSettings>>;
  heldSales: HeldSale[];
  setHeldSales: React.Dispatch<React.SetStateAction<HeldSale[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  dayCloseRecords: DayCloseRecord[];
  setDayCloseRecords: React.Dispatch<React.SetStateAction<DayCloseRecord[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [heldSales, setHeldSales] = useState<HeldSale[]>(() => {
    const saved = localStorage.getItem('heldSales');
    return saved ? JSON.parse(saved) : [];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [dayCloseRecords, setDayCloseRecords] = useState<DayCloseRecord[]>(() => {
    const saved = localStorage.getItem('dayCloseRecords');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('heldSales', JSON.stringify(heldSales));
  }, [heldSales]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('dayCloseRecords', JSON.stringify(dayCloseRecords));
  }, [dayCloseRecords]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <AppContext.Provider value={{ 
      theme, toggleTheme, 
      products, setProducts, 
      sales, setSales, 
      customers, setCustomers, 
      suppliers, setSuppliers, 
      settings, setSettings,
      heldSales, setHeldSales,
      employees, setEmployees,
      attendance, setAttendance,
      dayCloseRecords, setDayCloseRecords
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
