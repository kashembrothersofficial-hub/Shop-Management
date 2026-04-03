import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserCheck, UserPlus, Trash2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export const Attendance: React.FC = () => {
  const { employees, setEmployees, attendance, setAttendance } = useAppContext();
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const newEmployee = {
      id: Date.now().toString(),
      name: newEmpName,
      phone: newEmpPhone,
      joinDate: new Date().toISOString()
    };

    setEmployees([...employees, newEmployee]);
    setNewEmpName('');
    setNewEmpPhone('');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <UserCheck className="mr-3 text-blue-600" size={28} />
          স্টাফ হাজিরা
        </h1>
        
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              যোগ করুন
            </button>
          </form>
        </div>

        {/* Attendance List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              হাজিরা খাতা - {new Date(selectedDate).toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
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
                    <th className="px-4 py-3 hidden sm:table-cell">ফোন</th>
                    <th className="px-4 py-3 text-center">হাজিরা স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const status = getAttendanceStatus(emp.id);
                    return (
                      <tr key={emp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                          {emp.name}
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">{emp.phone || '-'}</td>
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
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={18} />
                          </button>
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
    </div>
  );
};
