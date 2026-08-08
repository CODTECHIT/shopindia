import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Save } from 'lucide-react';

export const CommissionsPage: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(10);

  const load = () => {
    setLoading(true);
    api.get<any[]>('/api/admin/commissions')
      .then(d => setVendors(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveRate = async (id: string) => {
    try {
      await api.patch(`/api/admin/commissions/${id}`, { commissionRate: rate });
      load();
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Offers & Commission Management</h1>
        <p className="text-sm text-gray-500">Configure vendor platform commission rates and promotional structures (FR-05.10)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Vendor Business</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Commission Rate (%)</th>
              <th className="px-5 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={4} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              ))
            ) : vendors.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">No active vendors found.</td></tr>
            ) : (
              vendors.map((v, i) => (
                <tr key={v._id || v.id || i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-semibold text-gray-900">{v.businessName}</td>
                  <td className="px-5 py-4 text-xs font-semibold capitalize text-emerald-700">{v.approvalStatus}</td>
                  <td className="px-5 py-4 font-numbers">
                    {editingId === v._id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={rate}
                          onChange={e => setRate(Number(e.target.value))}
                          className="w-20 px-2 py-1 border rounded-lg text-sm font-bold"
                          min={0} max={100}
                        />
                        <span className="text-sm font-bold">%</span>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-900 text-base">{v.commissionRate}%</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editingId === v._id ? (
                      <button
                        onClick={() => saveRate(v._id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-emerald-700"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEditingId(v._id); setRate(v.commissionRate); }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold"
                      >
                        Edit Rate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
