import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus } from 'lucide-react';

export const ServiceAreasPage: React.FC = () => {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [pincodes, setPincodes] = useState('');
  const [deliveryType, setDeliveryType] = useState('both');

  const load = () => {
    setLoading(true);
    api.get<any[]>('/api/admin/service-areas')
      .then(d => setAreas(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/api/admin/service-areas/${id}/toggle`, {});
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const createArea = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinArr = pincodes.split(',').map(s => s.trim()).filter(Boolean);
    try {
      await api.post('/api/admin/service-areas', { name, city, pincodes: pinArr, deliveryType });
      load();
      setModal(false); setName(''); setCity(''); setPincodes('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Area & Pincode Management</h1>
          <p className="text-sm text-gray-500">Configure delivery zones, serviceable pincodes, and fulfillment modes (FR-05.6)</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 bg-[#0F2C59] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#1a3d73]"
        >
          <Plus className="w-4 h-4" /> Add Zone
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-44 skeleton-shimmer" />
          ))
        ) : (
          areas.map(a => (
            <div key={a._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-premium space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{a.name}</h3>
                  <p className="text-xs text-gray-400">{a.city}</p>
                </div>
                <button
                  onClick={() => toggleStatus(a._id)}
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${a.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
                >
                  {a.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="pt-2 border-t border-gray-50 space-y-2">
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 capitalize">
                  {a.deliveryType?.replace('_', ' ')}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Covered Pincodes</p>
                  <div className="flex flex-wrap gap-1">
                    {a.pincodes?.map((pin: string) => (
                      <span key={pin} className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        {pin}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={createArea} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Add Service Zone</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Zone Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Indiranagar Zone" className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
              <input required value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bengaluru" className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pincodes (comma separated)</label>
              <input required value={pincodes} onChange={e => setPincodes(e.target.value)} placeholder="560038, 560008" className="w-full px-3 py-2 border rounded-xl text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fulfillment Mode</label>
              <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm">
                <option value="both">Both (Instant + Traditional)</option>
                <option value="quick_commerce">Quick Commerce (Instant)</option>
                <option value="traditional">Traditional Shipping</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 border rounded-xl text-sm">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-[#0F2C59] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3d73]">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
