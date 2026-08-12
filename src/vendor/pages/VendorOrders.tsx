import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search } from 'lucide-react';

export const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = () => {
    setLoading(true);
    api.get<{ orders: any[] }>('/api/vendor/orders')
      .then(d => setOrders(d.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/vendor/orders/${id}/status`, { status });
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = orders.filter(o => !q ||
    o.orderNumber?.toLowerCase().includes(q.toLowerCase()) ||
    o.id?.toLowerCase().includes(q.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(q.toLowerCase()) ||
    o.items?.some((item: any) => item.name?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Order Fulfillment</h1>
        <p className="text-sm text-gray-500">Receive orders, pack items, and update shipping pipeline status (FR-02.3)</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search order #, ID, or customer..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Order ID</th>
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Items</th>
              <th className="px-5 py-3.5 font-semibold">Total Amount</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Fulfillment Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No matching orders found.</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4 font-mono font-bold text-gray-900">{o.orderNumber} ({o.items?.map((item: any) => item.name).join(', ')})</td>
                <td className="px-5 py-4 font-semibold text-gray-800">{o.customer?.name || 'Walk-in Customer'}</td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    {o.items?.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">{item.name}</span> x {item.quantity}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 font-numbers font-medium text-gray-900">₹{o.total}</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    {o.status === 'placed' && (
                      <button onClick={() => updateStatus(o.id, 'confirmed')} className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold">
                        Confirm Order
                      </button>
                    )}
                    {o.status === 'confirmed' && (
                      <button onClick={() => updateStatus(o.id, 'packing')} className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold">
                        Start Packing
                      </button>
                    )}
                    {o.status === 'packing' && (
                      <button onClick={() => updateStatus(o.id, 'ready_to_ship')} className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold">
                        Mark Ready to Ship
                      </button>
                    )}
                     {o.status === 'ready_to_ship' && (
                      <button onClick={() => updateStatus(o.id, 'shipped')} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold">
                        Dispatch / Ship
                      </button>
                    )}
                    {o.status === 'shipped' && (
                      <button onClick={() => updateStatus(o.id, 'delivered')} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-xs font-semibold">
                        Mark Delivered
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
