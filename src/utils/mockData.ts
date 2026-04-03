export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
}

export interface Expense {
  id: string;
  reason: string;
  amount: number;
  date: string;
}

export interface ReturnRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'return' | 'damage';
  date: string;
  note: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  image: string;
}

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  buyPrice?: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  vat: number;
  finalTotal: number;
  profit: number;
  customerName: string;
  paidAmount: number;
  dueAmount: number;
}

export interface HeldSale {
  id: string;
  date: string;
  items: CartItem[];
  customerName: string;
  note: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  joinDate: string;
  baseSalary: number;
  advancePayment: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
}

export interface DayCloseRecord {
  id: string;
  date: string;
  totalSales: number;
  totalCash: number;
  totalProfit: number;
  note: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  note: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalDue: number;
  payments: PaymentRecord[];
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  totalDue: number;
  payments: PaymentRecord[];
}

export interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  currencySymbol: string;
  taxRate: number;
}

export const initialSettings: ShopSettings = {
  shopName: 'স্মার্ট দোকান',
  address: 'ঢাকা, বাংলাদেশ',
  phone: '01700000000',
  currencySymbol: '৳',
  taxRate: 0,
};

export const initialProducts: Product[] = [
  { id: 'p1', name: 'মিনিকেট চাল (২৫ কেজি)', category: 'চাল', buyPrice: 1500, sellPrice: 1650, stock: 50, image: 'https://picsum.photos/seed/rice/200' },
  { id: 'p2', name: 'সয়াবিন তেল (৫ লিটার)', category: 'তেল', buyPrice: 750, sellPrice: 820, stock: 30, image: 'https://picsum.photos/seed/oil/200' },
  { id: 'p3', name: 'মসুর ডাল (১ কেজি)', category: 'ডাল', buyPrice: 110, sellPrice: 130, stock: 100, image: 'https://picsum.photos/seed/lentil/200' },
  { id: 'p4', name: 'চিনি (১ কেজি)', category: 'মুদি', buyPrice: 125, sellPrice: 140, stock: 80, image: 'https://picsum.photos/seed/sugar/200' },
  { id: 'p5', name: 'লবণ (১ কেজি)', category: 'মুদি', buyPrice: 35, sellPrice: 40, stock: 150, image: 'https://picsum.photos/seed/salt/200' },
];

export const initialCustomers: Customer[] = [
  { id: 'c1', name: 'রহিম মিয়া', phone: '01711000001', totalDue: 1500, payments: [{ id: 'cp1', date: new Date().toISOString(), amount: 500, note: 'প্রাথমিক জমা' }] },
  { id: 'c2', name: 'করিম শেখ', phone: '01711000002', totalDue: 0, payments: [] },
  { id: 'c3', name: 'আব্দুল জব্বার', phone: '01711000003', totalDue: 3200, payments: [] },
];

export const initialSuppliers: Supplier[] = [
  { id: 's1', name: 'মেসার্স ভাই ভাই এন্টারপ্রাইজ', phone: '01811000001', totalDue: 15000, payments: [{ id: 'sp1', date: new Date().toISOString(), amount: 5000, note: 'অগ্রিম প্রদান' }] },
  { id: 's2', name: 'রহমান ট্রেডার্স', phone: '01811000002', totalDue: 5000, payments: [] },
];

export const initialSales: Sale[] = [
  {
    id: 'sale1',
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    items: [
      { id: 'ci1', productId: 'p1', name: 'মিনিকেট চাল (২৫ কেজি)', quantity: 1, price: 1650, buyPrice: 1500, total: 1650 },
      { id: 'ci2', productId: 'p2', name: 'সয়াবিন তেল (৫ লিটার)', quantity: 2, price: 820, buyPrice: 750, total: 1640 },
    ],
    totalAmount: 3290,
    discount: 0,
    vat: 0,
    finalTotal: 3290,
    profit: 290,
    customerName: 'রহিম মিয়া',
    paidAmount: 3000,
    dueAmount: 290,
  }
];

export const initialEmployees: Employee[] = [
  { id: 'emp1', name: 'শফিক ইসলাম', phone: '01900000001', joinDate: new Date().toISOString(), baseSalary: 15000, advancePayment: 0 },
  { id: 'emp2', name: 'আরিফ হোসেন', phone: '01900000002', joinDate: new Date().toISOString(), baseSalary: 12000, advancePayment: 2000 },
];
