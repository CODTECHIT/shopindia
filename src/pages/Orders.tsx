import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { Package, LogIn, Loader2 } from 'lucide-react';
import type { CustomerUser } from '../lib/customerAuth';
import { getCustomerToken, getCustomerUser, fetchCustomerOrders } from '../lib/customerAuth';
import { DashboardInner } from './dashboard/DashboardPortal';

export const OrdersPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { navigateTo } = useApp();

  const [user] = useState<CustomerUser | null>(() => {
    const u = getCustomerUser();
    return u && getCustomerToken() ? u : null;
  });

  if (user) {
    return <DashboardInner initialTab="orders" />;
  }

  return (
    <div className={`mx-auto py-16 ${isMobile ? 'px-4' : 'max-w-7xl px-12'} text-left`}>
      <div className="bg-white border border-brand-border rounded-card p-8 shadow-premium text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
          <LogIn size={24} />
        </div>
        <h2 className="text-base font-extrabold font-heading text-brand-graphite">Track your orders</h2>
        <p className="text-[12px] text-brand-slate font-bold max-w-sm">
          Log in to your account to see your orders and delivery status in one place.
        </p>
        <button onClick={() => navigateTo('profile')} className="px-6 py-3 bg-brand-blue hover:bg-blue-650 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-soft transition-colors mt-2">
          Log In or Register
        </button>
      </div>
    </div>
  );
};