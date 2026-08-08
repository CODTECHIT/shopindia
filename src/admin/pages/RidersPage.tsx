import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Search, CheckCircle, Ban, Truck } from 'lucide-react';

export const RidersPage: React.FC = () => {
  const [riders, setRiders] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get<{ riders: any[] }>('/api/admin/riders')
      .then(d => setRiders(d.riders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/admin/riders/${id}`, { status: newStatus });
      load();
    } catch (err: any) { alert(err.message); }
  };

  const processPayout = async (id: string, amount: number) => {
    if (!amount || amount <= 0) return;
    try {
      await api.patch(`/api/admin/riders/${id}`, { payoutAmount: amount });
      load();
    } catch (err: any) { alert(err.message); }
  };

  const filtered = riders.filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rider Operations</h1>
        <p className="text-sm text-gray-500">Track active deliveries, vehicle assignments, and rider payouts (FR-04)</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q} onChange={e => setQ(e.target.value)} placeholder="Search riders..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Rider Details</th>
              <th className="px-5 py-3.5 font-semibold">Vehicle</th>
              <th className="px-5 py-3.5 font-semibold">Deliveries</th>
              <th className="px-5 py-3.5 font-semibold">Wallet / Payout</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No riders found.</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id || r._id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-500"/> {r.name}</p>
                  <p className="text-xs text-gray-500">{r.phone}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {r.riderProfile?.vehicleType || 'Unassigned'} <br/>
                  <span className="text-xs text-gray-400">{r.riderProfile?.licenseNumber || '—'}</span>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-900">
                  {r.riderProfile?.deliveries?.length || 0} Total
                </td>
                <td className="px-5 py-4">
                  <p className="font-numbers font-semibold text-gray-900">₹{r.riderProfile?.walletBalance || 0}</p>
                  {r.riderProfile?.walletBalance > 0 && (
                    <button onClick={() => processPayout(r.id, r.riderProfile.walletBalance)} className="text-[10px] text-blue-600 font-semibold hover:underline mt-1">
                      Clear Dues
                    </button>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {r.status !== 'active' && <button onClick={() => updateStatus(r.id, 'active')} className="p-1.5 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"><CheckCircle className="w-4 h-4"/></button>}
                    {r.status !== 'suspended' && <button onClick={() => updateStatus(r.id, 'suspended')} className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100"><Ban className="w-4 h-4"/></button>}
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
