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

export interface Quotation {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  vat: number;
  finalTotal: number;
  customerName: string;
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

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  amountPaid: number;
  date: string;
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
  points?: number;
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
  { id: 'p1', name: 'সাদা সেলাই সুতো (১টি)', category: 'সুতো', buyPrice: 15, sellPrice: 20, stock: 100, image: 'https://picsum.photos/seed/thread1/200' },
  { id: 'p2', name: 'কালো সেলাই সুতো (১টি)', category: 'সুতো', buyPrice: 15, sellPrice: 20, stock: 100, image: 'https://picsum.photos/seed/thread2/200' },
  { id: 'p3', name: 'শার্টের বুতাম (১ প্যাকেট)', category: 'বুতাম', buyPrice: 40, sellPrice: 60, stock: 50, image: 'https://picsum.photos/seed/button1/200' },
  { id: 'p4', name: 'ডিজাইনার গোল্ডেন লেস (গজ)', category: 'লেস', buyPrice: 25, sellPrice: 40, stock: 200, image: 'https://picsum.photos/seed/lace1/200' },
  { id: 'p5', name: 'ভারী দর্জি আয়রন', category: 'যন্ত্রপাতি', buyPrice: 1200, sellPrice: 1500, stock: 5, image: 'https://picsum.photos/seed/iron1/200' },
  { id: 'p6', name: 'বক্রম / ফিউজিং (গজ)', category: 'বক্রম ও ফিউজিং', buyPrice: 30, sellPrice: 50, stock: 100, image: 'https://picsum.photos/seed/fusing1/200' },
  { id: 'p7', name: 'মেশিনের সুই (১ প্যাকেট)', category: 'মেশিনের যন্ত্রাংশ', buyPrice: 50, sellPrice: 80, stock: 30, image: 'https://picsum.photos/seed/needle1/200' },
  { id: 'p8', name: 'ইঞ্চি ফিতা (টেপ)', category: 'যন্ত্রপাতি', buyPrice: 10, sellPrice: 20, stock: 50, image: 'https://picsum.photos/seed/tape1/200' },
  { id: 'p9', name: 'সুতো কাটার কেঁচি (Cutter)', category: 'যন্ত্রপাতি', buyPrice: 25, sellPrice: 40, stock: 40, image: 'https://picsum.photos/seed/cutter1/200' },
  { id: 'p10', name: 'মেশিনের তেল (১ বোতল)', category: 'মেশিনের যন্ত্রাংশ', buyPrice: 30, sellPrice: 50, stock: 20, image: 'https://picsum.photos/seed/oil1/200' },
];

export const initialCustomers: Customer[] = [
  { id: 'c1', name: 'রহিম মিয়া', phone: '01711000001', totalDue: 1500, points: 50, payments: [{ id: 'cp1', date: new Date().toISOString(), amount: 500, note: 'প্রাথমিক জমা' }] },
  { id: 'c2', name: 'করিম শেখ', phone: '01711000002', totalDue: 0, points: 120, payments: [] },
  { id: 'c3', name: 'আব্দুল জব্বার', phone: '01711000003', totalDue: 3200, points: 0, payments: [] },
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
