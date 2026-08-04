import React, { useEffect, useState } from 'react';
import { api, MOCK, USE_MOCK } from '../../lib/api';

export const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    if (USE_MOCK) {
      setOrders(MOCK.vendorDashboard.recentOrders);
      setLoading(false);
    } else {
      api.get<{ orders: any[] }>('/api/vendor/orders')
        .then(d => setOrders(d.orders))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      if (USE_MOCK) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      } else {
        await api.patch(`/api/vendor/orders/${id}/status`, { status });
        load();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Order Fulfillment</h1>
        <p className="text-sm text-gray-500">Receive orders, pack items, and update shipping pipeline status (FR-02.3)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Order ID</th>
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Total Amount</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Fulfillment Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              ))
            ) : orders.map(o => (
              <tr key={o._id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                <td className="px-5 py-4 font-semibold text-gray-800">{o.customerId?.name}</td>
                <td className="px-5 py-4 font-numbers font-medium text-gray-900">₹{o.total}</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    {o.status === 'placed' && (
                      <button onClick={() => updateStatus(o._id, 'confirmed')} className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold">
                        Confirm Order
                      </button>
                    )}
                    {o.status === 'confirmed' && (
                      <button onClick={() => updateStatus(o._id, 'packing')} className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold">
                        Start Packing
                      </button>
                    )}
                    {o.status === 'packing' && (
                      <button onClick={() => updateStatus(o._id, 'ready_to_ship')} className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold">
                        Mark Ready to Ship
                      </button>
                    )}
                    {o.status === 'ready_to_ship' && (
                      <button onClick={() => updateStatus(o._id, 'shipped')} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold">
                        Dispatch / Ship
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
