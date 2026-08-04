import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AdminLogin } from './pages/AdminLogin';
import { AdminSidebar } from './AdminSidebar';
import { Dashboard } from './pages/Dashboard';
import { VendorsPage } from './pages/VendorsPage';
import { UsersPage } from './pages/UsersPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { BranchesPage } from './pages/BranchesPage';
import { RBACPage } from './pages/RBACPage';
import { ServiceAreasPage } from './pages/ServiceAreasPage';
import { SupportPage } from './pages/SupportPage';
import { CommissionsPage } from './pages/CommissionsPage';
import { RidersPage } from './pages/RidersPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { OffersPage } from './pages/OffersPage';

const AdminContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderTab = () => {
    switch (tab) {
      case 'dashboard':     return <Dashboard />;
      case 'vendors':       return <VendorsPage />;
      case 'users':         return <UsersPage />;
      case 'products':      return <ProductsPage />;
      case 'orders':        return <OrdersPage />;
      case 'branches':      return <BranchesPage />;
      case 'rbac':          return <RBACPage />;
      case 'service-areas': return <ServiceAreasPage />;
      case 'support':       return <SupportPage />;
      case 'commissions':   return <CommissionsPage />;
      case 'riders':        return <RidersPage />;
      case 'reports':       return <ReportsPage />;
      case 'notifications': return <NotificationsPage />;
      case 'offers':        return <OffersPage />;
      default:              return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6]">
      <AdminSidebar currentTab={tab} onTabChange={setTab} />
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {renderTab()}
      </main>
    </div>
  );
};

export const AdminPortal: React.FC = () => (
  <AuthProvider>
    <AdminContent />
  </AuthProvider>
);
