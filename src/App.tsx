/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { SalesHistory } from './pages/SalesHistory';
import { CustomerDues } from './pages/CustomerDues';
import { SupplierPayments } from './pages/SupplierPayments';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<POS />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales-history" element={<SalesHistory />} />
            <Route path="customer-dues" element={<CustomerDues />} />
            <Route path="supplier-payments" element={<SupplierPayments />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
