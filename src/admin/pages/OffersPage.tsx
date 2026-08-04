import React, { useEffect, useState } from 'react';
import { api, USE_MOCK } from '../../lib/api';
import { Tag, Plus, CheckCircle, Ban } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '',
    minOrderValue: '', maxDiscount: '', validUntil: '', usageLimit: ''
  });

  const load = () => {
    setLoading(true);
    if (USE_MOCK) {
      setCoupons([
        { id: '1', code: 'WELCOME50', discountType: 'PERCENTAGE', discountValue: 50, maxDiscount: 100, minOrderValue: 200, validUntil: '2026-12-31', usedCount: 15, usageLimit: 100, isActive: true }
      ]);
      setLoading(false);
    } else {
      api.get<{ coupons: any[] }>('/api/admin/offers')
        .then(d => setCoupons(d.coupons))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (USE_MOCK) return alert("Mock create!");
      await api.post('/api/admin/offers', form);
      setShowForm(false);
      load();
    } catch (err: any) { alert(err.message); }
  };

  const toggleStatus = async (id: string) => {
    if (USE_MOCK) return alert("Mock toggle!");
    try {
      await api.patch(`/api/admin/offers/${id}/toggle`, {});
      load();
    } catch (err: any) { alert(err.message); }
  };

  const filtered = coupons;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Coupons</h1>
          <p className="text-sm text-gray-500">Create discount campaigns and promotional codes (FR-13)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#0F2C59] text-white rounded-xl hover:bg-[#0F2C59]/90 font-medium text-sm transition-all shadow-lg shadow-[#0F2C59]/20">
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Create Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Coupon Code</label>
              <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. DIWALI20" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Value</label>
              <input required type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} placeholder="e.g. 20" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valid Until</label>
              <input required type="date" value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
              <input type="number" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})} placeholder="0" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Discount (₹)</label>
              <input type="number" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: e.target.value})} placeholder="Optional" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} placeholder="0 = Unlimited" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm">Save Coupon</button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Code</th>
              <th className="px-5 py-3.5 font-semibold">Discount</th>
              <th className="px-5 py-3.5 font-semibold">Conditions</th>
              <th className="px-5 py-3.5 font-semibold">Usage</th>
              <th className="px-5 py-3.5 font-semibold">Valid Until</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading Offers...</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100">
                    <Tag className="w-3.5 h-3.5" /> {c.code}
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-900">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">
                  Min: ₹{c.minOrderValue} <br/>
                  {c.maxDiscount && `Max: ₹${c.maxDiscount}`}
                </td>
                <td className="px-5 py-4 font-numbers text-gray-900">
                  {c.usedCount} / {c.usageLimit === 0 ? '∞' : c.usageLimit}
                </td>
                <td className="px-5 py-4 text-gray-500 font-numbers">{new Date(c.validUntil).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleStatus(c.id)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                    {c.isActive ? <><CheckCircle className="w-3.5 h-3.5"/> Active</> : <><Ban className="w-3.5 h-3.5"/> Inactive</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
