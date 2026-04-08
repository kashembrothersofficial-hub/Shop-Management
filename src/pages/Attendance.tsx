import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { downloadCSV } from '../utils/export';
import { UserCheck, UserPlus, Trash2, Calendar, CheckCircle, XCircle, Clock, DollarSign, HandCoins, CreditCard, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Attendance: React.FC = () => {
  const { employees, setEmployees, attendance, setAttendance, settings, salaryRecords, setSalaryRecords } = useAppContext();
  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll'>('attendance');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>('');
  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const newEmployee = {
      id: Date.now().toString(),
      name: newEmpName,
      phone: newEmpPhone,
      joinDate: new Date().toISOString(),
      baseSalary: Number(newEmpSalary) || 0,
      advancePayment: 0
    };

    setEmployees([...employees, newEmployee]);
    setNewEmpName('');
    setNewEmpPhone('');
    setNewEmpSalary('');
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই স্টাফকে মুছে ফেলতে চান?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleMarkAttendance = (employeeId: string, status: 'present' | 'absent' | 'leave') => {
    const existingRecordIndex = attendance.findIndex(
      a => a.employeeId === employeeId && a.date === selectedDate
    );

    let newAttendance = [...attendance];
    
    if (existingRecordIndex >= 0) {
      newAttendance[existingRecordIndex].status = status;
    } else {
      newAttendance.push({
        id: Date.now().toString(),
        employeeId,
        date: selectedDate,
        status
      });
    }

    setAttendance(newAttendance);
  };

  const getAttendanceStatus = (employeeId: string) => {
    const record = attendance.find(a => a.employeeId === employeeId && a.date === selectedDate);
    return record ? record.status : null;
  };

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !advanceAmount || Number(advanceAmount) <= 0) return;

    setEmployees(employees.map(emp => {
      if (emp.id === selectedEmpId) {
        return {
          ...emp,
          advancePayment: (emp.advancePayment || 0) + Number(advanceAmount)
        };
      }
      return emp;
    }));

    setIsAdvanceModalOpen(false);
    setSelectedEmpId('');
    setAdvanceAmount('');
  };

  const openAdvanceModal = (empId: string) => {
    setSelectedEmpId(empId);
    setIsAdvanceModalOpen(true);
  };

  const handlePaySalary = (empId: string, netSalary: number) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে ৳${netSalary} বেতন পরিশোধ করতে চান?`)) {
      const newRecord = {
        id: `sal-${Date.now()}`,
        employeeId: empId,
        month: payrollMonth,
        amountPaid: netSalary,
        date: new Date().toISOString()
      };
      setSalaryRecords([...salaryRecords, newRecord]);

      // Reset advance payment after salary is paid
      setEmployees(employees.map(emp => {
        if (emp.id === empId) {
          return { ...emp, advancePayment: 0 };
        }
        return emp;
      }));
    }
  };

  const getPayrollData = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return null;

    const monthAttendance = attendance.filter(a => a.employeeId === empId && a.date.startsWith(payrollMonth));
    const presentDays = monthAttendance.filter(a => a.status === 'present').length;
    const absentDays = monthAttendance.filter(a => a.status === 'absent').length;
    
    // Assuming 30 days a month for simple calculation
    const perDaySalary = emp.baseSalary / 30;
    const absenceDeduction = absentDays * perDaySalary;
    const advance = emp.advancePayment || 0;
    const netSalary = emp.baseSalary - absenceDeduction - advance;

    const isPaid = salaryRecords.some(r => r.employeeId === empId && r.month === payrollMonth);

    return {
      presentDays,
      absentDays,
      absenceDeduction: Math.round(absenceDeduction),
      advance,
      netSalary: Math.max(0, Math.round(netSalary)),
      isPaid
    };
  };

  const handleExportCSV = () => {
    if (activeTab === 'attendance') {
      const dataToExport = employees.map(emp => {
        const status = getAttendanceStatus(emp.id);
        const statusText = status === 'present' ? 'উপস্থিত' : status === 'absent' ? 'অনুপস্থিত' : status === 'leave' ? 'ছুটি' : 'চিহ্নিত করা হয়নি';
        return {
          'তারিখ': selectedDate,
          'স্টাফের নাম': emp.name,
          'ফোন নম্বর': emp.phone || 'N/A',
          'হাজিরা স্ট্যাটাস': statusText,
          'নির্ধারিত বেতন': emp.baseSalary,
          'অগ্রিম': emp.advancePayment || 0
        };
      });
      downloadCSV(dataToExport, `attendance_${selectedDate}`);
    } else {
      const dataToExport = employees.map(emp => {
        const data = getPayrollData(emp.id);
        if (!data) return null;
        return {
          'মাস': payrollMonth,
          'স্টাফের নাম': emp.name,
          'উপস্থিতি (দিন)': data.presentDays,
          'অনুপস্থিতি (দিন)': data.absentDays,
          'নির্ধারিত বেতন': emp.baseSalary,
          'কর্তন (অনুপস্থিতি + অগ্রিম)': data.absenceDeduction + data.advance,
          'প্রদেয় বেতন': data.netSalary,
          'স্ট্যাটাস': data.isPaid ? 'পরিশোধিত' : 'বকেয়া'
        };
      }).filter(Boolean);
      downloadCSV(dataToExport, `payroll_${payrollMonth}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <UserCheck className="mr-3 text-blue-600" size={28} />
          স্টাফ ও পেরোল ম্যানেজমেন্ট
        </h1>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors whitespace-nowrap"
            title="ডাউনলোড এক্সেল (CSV)"
          >
            <Download size={18} className="mr-1" />
            <span className="hidden sm:inline">এক্সপোর্ট</span>
          </button>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              হাজিরা
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'payroll'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              পেরোল (বেতন)
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'attendance' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Add Employee Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <UserPlus size={20} className="mr-2 text-blue-600" />
            নতুন স্টাফ যোগ করুন
          </h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                স্টাফের নাম *
              </label>
              <input
                type="text"
                required
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="নাম লিখুন"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ফোন নম্বর
              </label>
              <input
                type="tel"
                value={newEmpPhone}
                onChange={(e) => setNewEmpPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                নির্ধারিত বেতন ({settings.currencySymbol})
              </label>
              <input
                type="number"
                value={newEmpSalary}
                onChange={(e) => setNewEmpSalary(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="বেতন"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              যোগ করুন
            </button>
          </form>
        </div>

        {/* Attendance & Salary List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-3 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              স্টাফ তালিকা ও হাজিরা
            </h2>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 font-medium text-sm p-0"
              />
            </div>
          </div>
          
          {employees.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
              <p>কোনো স্টাফ যোগ করা হয়নি।</p>
            </div>
          ) : (
            <div className="overflow-x-auto whitespace-nowrap">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">স্টাফের নাম</th>
                    <th className="px-4 py-3 text-center">হাজিরা স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">বেতন</th>
                    <th className="px-4 py-3 text-right">অগ্রিম</th>
                    <th className="px-4 py-3 text-right">বকেয়া বেতন</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const status = getAttendanceStatus(emp.id);
                    const baseSalary = emp.baseSalary || 0;
                    const advance = emp.advancePayment || 0;
                    const dueSalary = baseSalary - advance;

                    return (
                      <tr key={emp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                          <div>{emp.name}</div>
                          <div className="text-xs text-gray-500">{emp.phone || '-'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleMarkAttendance(emp.id, 'present')}
                              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                status === 'present'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              <CheckCircle size={14} className="mr-1" /> উপস্থিত
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(emp.id, 'absent')}
                              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                status === 'absent'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              <XCircle size={14} className="mr-1" /> অনুপস্থিত
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(emp.id, 'leave')}
                              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                status === 'leave'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                                  : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              <Clock size={14} className="mr-1" /> ছুটি
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                          {settings.currencySymbol}{baseSalary}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-orange-600 dark:text-orange-400">
                          {settings.currencySymbol}{advance}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-blue-600 dark:text-blue-400">
                          {settings.currencySymbol}{dueSalary}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openAdvanceModal(emp.id)}
                              className="text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              title="অগ্রিম প্রদান"
                            >
                              <HandCoins size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <DollarSign size={20} className="mr-2 text-green-600" />
              মাসিক বেতন হিসাব
            </h2>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
              <input
                type="month"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto whitespace-nowrap">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">স্টাফের নাম</th>
                  <th className="px-4 py-3 text-center">উপস্থিতি (দিন)</th>
                  <th className="px-4 py-3 text-center">অনুপস্থিতি (দিন)</th>
                  <th className="px-4 py-3 text-right">নির্ধারিত বেতন</th>
                  <th className="px-4 py-3 text-right">কর্তন (অনুপস্থিতি + অগ্রিম)</th>
                  <th className="px-4 py-3 text-right">প্রদেয় বেতন</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const data = getPayrollData(emp.id);
                  if (!data) return null;

                  return (
                    <tr key={emp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                        {emp.name}
                      </td>
                      <td className="px-4 py-4 text-center text-green-600 dark:text-green-400 font-medium">
                        {data.presentDays}
                      </td>
                      <td className="px-4 py-4 text-center text-red-600 dark:text-red-400 font-medium">
                        {data.absentDays}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                        {settings.currencySymbol}{emp.baseSalary}
                      </td>
                      <td className="px-4 py-4 text-right text-orange-600 dark:text-orange-400">
                        {settings.currencySymbol}{data.absenceDeduction + data.advance}
                        <div className="text-[10px] text-gray-500">
                          (ছুটি: {data.absenceDeduction}, অগ্রিম: {data.advance})
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-blue-600 dark:text-blue-400 text-base">
                        {settings.currencySymbol}{data.netSalary}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {data.isPaid ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                            পরিশোধিত
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                            বকেয়া
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handlePaySalary(emp.id, data.netSalary)}
                          disabled={data.isPaid || data.netSalary <= 0}
                          className="flex items-center justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                        >
                          <CreditCard size={16} className="mr-1" />
                          পরিশোধ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advance Payment Modal */}
      <AnimatePresence>
        {isAdvanceModalOpen && (
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-sm overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">অগ্রিম প্রদান</h2>
                <button onClick={() => setIsAdvanceModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddAdvance} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পরিমাণ ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={advanceAmount}
                    onChange={e => setAdvanceAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdvanceModalOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={!advanceAmount || Number(advanceAmount) <= 0}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    প্রদান করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
