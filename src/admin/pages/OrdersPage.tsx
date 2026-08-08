import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, RefreshCw } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');

  const load = () => {
    setLoading(true);
    api.get<{ orders: any[] }>('/api/admin/orders')
      .then(d => setOrders(d.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const processRefund = async () => {
    if (!refundModal) return;
    try {
      await api.post(`/api/admin/orders/${refundModal._id || refundModal.id}/refund`, { refundAmount, refundReason });
      load();
      setRefundModal(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = orders.filter(o => !q ||
    o.orderNumber?.toLowerCase().includes(q.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(q.toLowerCase()) ||
    o.customerId?.name?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management &amp; Monitoring</h1>
        <p className="text-sm text-gray-500">Track marketplace orders, manage status, and process refunds</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search order # or customer..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Order ID</th>
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Type</th>
              <th className="px-5 py-3.5 font-semibold">Total</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found.</td></tr>
            ) : (
              filtered.map(o => {
                const customer = o.customer || o.customerId;
                return (
                  <tr key={o._id || o.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{customer?.name}</p>
                      <p className="text-xs text-gray-400">{customer?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {o.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-numbers font-medium text-gray-900">₹{o.total}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        o.status === 'delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        o.status === 'cancelled' || o.status === 'refunded' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{o.createdAt?.slice(0, 10)}</td>
                    <td className="px-5 py-4">
                      {o.status !== 'refunded' && o.status !== 'cancelled' && (
                        <button
                          onClick={() => { setRefundModal(o); setRefundAmount(o.total); }}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Refund
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {refundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Process Refund</h3>
            <p className="text-xs text-gray-500">Order: <span className="font-mono font-bold text-gray-700">{refundModal.orderNumber}</span></p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Refund Amount (₹)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={e => setRefundAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-sm font-numbers"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reason</label>
              <textarea
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                placeholder="Reason for refund..."
                className="w-full px-3 py-2 border rounded-xl text-sm resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRefundModal(null)} className="flex-1 py-2 border rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={processRefund} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Confirm Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
