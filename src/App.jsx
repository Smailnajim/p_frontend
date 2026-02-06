import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import Toast from './components/Toast';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage apiUrl={API_URL} />} />
          <Route path="invoices" element={<InvoicesPage showToast={showToast} apiUrl={API_URL} />} />
          <Route path="clients" element={<ClientsPage showToast={showToast} apiUrl={API_URL} />} />
          <Route path="products" element={<ProductsPage showToast={showToast} apiUrl={API_URL} />} />
        </Route>
      </Routes>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

export default App;
