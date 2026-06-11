import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Product, Sale, Customer, Supplier, ShopSettings, HeldSale, Employee, AttendanceRecord, DayCloseRecord, User, Expense, ReturnRecord, Quotation, SalaryRecord, initialProducts, initialSales, initialCustomers, initialSuppliers, initialSettings, initialEmployees } from '../utils/mockData';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  authLoading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
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
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  returns: ReturnRecord[];
  setReturns: React.Dispatch<React.SetStateAction<ReturnRecord[]>>;
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  salaryRecords: SalaryRecord[];
  setSalaryRecords: React.Dispatch<React.SetStateAction<SalaryRecord[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Keep theme in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Use Supabase auth hook
  const { user: supabaseUser, loading: authLoading, error: authError, signOut: supabaseSignOut } = useAuth();

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Business Data - In-Memory Only (No localStorage)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [settings, setSettings] = useState<ShopSettings>(initialSettings);
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [dayCloseRecords, setDayCloseRecords] = useState<DayCloseRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);

  // Sync Supabase user with currentUser
  useEffect(() => {
    if (supabaseUser) {
      const user: User = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        role: supabaseUser.user_metadata?.role || 'cashier',
        pin: '', // Not used with Supabase
      };
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  }, [supabaseUser]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleSignOut = async () => {
    try {
      await supabaseSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      theme, toggleTheme, 
      currentUser, setCurrentUser,
      authLoading, 
      authError: authError?.message || null,
      signOut: handleSignOut,
      products, setProducts, 
      sales, setSales, 
      customers, setCustomers, 
      suppliers, setSuppliers, 
      settings, setSettings,
      heldSales, setHeldSales,
      employees, setEmployees,
      attendance, setAttendance,
      dayCloseRecords, setDayCloseRecords,
      expenses, setExpenses,
      returns, setReturns,
      quotations, setQuotations,
      salaryRecords, setSalaryRecords
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
