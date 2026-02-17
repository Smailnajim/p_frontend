import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import DevisPage from './pages/DevisPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Toast from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';

const API_URL = 'http://localhost:3000/api';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--gray-50)' }}>
      <div className="spinner"></div>
    </div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function AppContent() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage apiUrl={API_URL} />} />
            <Route path="devis" element={<DevisPage showToast={showToast} apiUrl={API_URL} />} />
            <Route path="invoices" element={<InvoicesPage showToast={showToast} apiUrl={API_URL} />} />
            <Route path="clients" element={<ClientsPage showToast={showToast} apiUrl={API_URL} />} />
            <Route path="products" element={<ProductsPage showToast={showToast} apiUrl={API_URL} />} />
            <Route path="users" element={<UsersPage showToast={showToast} apiUrl={API_URL} />} />
          </Route>
        </Route>
      </Routes>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
