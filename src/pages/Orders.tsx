import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { Package, CheckCircle2, Clock, LogIn, Loader2 } from 'lucide-react';
import type { CustomerUser } from '../lib/customerAuth';
import { getCustomerToken, getCustomerUser, fetchCustomerOrders } from '../lib/customerAuth';

const StatusIcon = ({ status }: { status: string }) => {
  const done = ['delivered', 'refunded'].includes(status);
  return done
    ? <CheckCircle2 size={16} className="text-brand-green" />
    : <Package size={16} className="text-brand-blue" />;
};

export const OrdersPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { navigateTo } = useApp();

  const [user] = useState<CustomerUser | null>(() => {
    const u = getCustomerUser();
    return u && getCustomerToken() ? u : null;
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError('');
    fetchCustomerOrders(user.email)
      .then((data) => { if (active) setOrders(data || []); })
      .catch((e: any) => { if (active) setError(e.message || 'Failed to load orders.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  if (!user) {
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
          <button onClick={() => navigateTo('profile')}
            className="px-6 py-2.5 bg-brand-blue text-white text-xs font-black uppercase tracking-wider rounded-button shadow">
            Log in / Sign up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto py-8 ${isMobile ? 'px-4' : 'max-w-7xl px-12'} text-left text-brand-graphite font-sans`}>
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2.5 font-heading uppercase tracking-wider">
        <Package size={20} className="text-brand-blue" />
        <span>My Orders</span>
      </h1>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-brand-slate font-bold">
          <Loader2 size={16} className="animate-spin" /> Loading your orders...
        </div>
      )}
      {error && !loading && <p className="text-sm text-red-500 font-bold">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-white border border-brand-border rounded-card p-8 text-center shadow-premium">
          <Package size={28} className="text-brand-blue mx-auto mb-3" />
          <p className="text-sm font-extrabold text-brand-graphite">No orders yet</p>
          <p className="text-[11px] text-brand-slate font-bold mt-1">Orders you place will appear here.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((o: any) => (
          <div key={o.orderNumber} className="bg-white border border-brand-border rounded-card p-5 shadow-premium">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-brand-border/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <StatusIcon status={o.status} />
                <span className="font-black text-xs font-numbers text-brand-graphite">{o.orderNumber}</span>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-brand-slate bg-slate-100 px-3 py-1 rounded-full">
                {o.status}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {o.items?.map((it: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-graphite line-clamp-1 pr-4">{it.name}</span>
                  <span className="text-[11px] text-brand-slate font-bold font-numbers shrink-0">
                    {it.quantity} × ₹{Number(it.price).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-border/10">
              <span className="text-[10px] text-brand-slate font-bold flex items-center gap-1">
                <Clock size={12} /> {new Date(o.createdAt).toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-black font-numbers text-brand-graphite">₹{Number(o.total).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};