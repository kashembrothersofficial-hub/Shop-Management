/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { SalesHistory } from './pages/SalesHistory';
import { CustomerDues } from './pages/CustomerDues';
import { SupplierPayments } from './pages/SupplierPayments';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { Attendance } from './pages/Attendance';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="sales-history" element={<SalesHistory />} />
            <Route path="customer-dues" element={<CustomerDues />} />
            <Route path="supplier-payments" element={<SupplierPayments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
