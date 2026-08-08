import React from 'react';
import { useApp } from '../../context/AppContext';
import { DesktopHeader } from './DesktopHeader';
import { DesktopFooter } from './DesktopFooter';
import { VerticalShop } from './VerticalShop';
import { VerticalQuickCommerce } from './VerticalQuickCommerce';
import { VerticalServices } from './VerticalServices';
import { SearchPage } from '../../pages/Search';
import { ProductDetailPage } from '../../pages/ProductDetail';
import { CartPage } from '../../pages/Cart';
import { OrdersPage } from '../../pages/Orders';
import { ProfilePage } from '../../pages/Profile';
import { DashboardInner } from '../../pages/dashboard/DashboardPortal';

export const DesktopApp: React.FC = () => {
  const { currentVertical, currentPath } = useApp();

  const renderContent = () => {
    switch (currentPath) {
      case 'home':
        if (currentVertical === 'quick') return <VerticalQuickCommerce />;
        if (currentVertical === 'services') return <VerticalServices />;
        return <VerticalShop />;
      case 'search':
        return <SearchPage />;
      case 'detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'orders':
        return <OrdersPage />;
      case 'profile':
        return <ProfilePage />;
      case 'dashboard':
        return <DashboardInner />;
      default:
        return <VerticalShop />;
    }
  };

  const isServices = currentVertical === 'services';

  return (
    <div className={`min-h-screen flex flex-col w-full transition-colors duration-400 ${
      isServices ? 'bg-services-bg text-services-text' : 'bg-[#FAF9F6] text-gray-800'
    }`}>
      <DesktopHeader />
      <main className="flex-1 w-full">
        {renderContent()}
      </main>
      <DesktopFooter />
    </div>
  );
};
