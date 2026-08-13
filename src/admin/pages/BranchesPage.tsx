import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Building2, Plus, MapPin, User, Edit2 } from 'lucide-react';

export const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [managerId, setManagerId] = useState('');

  const load = () => {
    setLoading(true);
    api.get<any[]>('/api/admin/branches')
      .then(d => setBranches(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadManagers = () => {
    api.get<{ users: any[] }>('/api/admin/users?role=branch_manager&limit=100')
      .then(d => setManagers(d.users || []))
      .catch(console.error);
  };

  useEffect(() => {
    load();
    loadManagers();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setCity('');
    setPincode('');
    setManagerId('');
    setModal(true);
  };

  const openEdit = (b: any) => {
    setEditingId(b.id || b._id);
    setName(b.name || '');
    setCode(b.code || '');
    setCity(b.city || '');
    setPincode(b.pincode || '');
    setManagerId(b.managerId || b.manager?.id || '');
    setModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        name, 
        code, 
        city, 
        pincode,
        managerId: managerId || null 
      };

      if (editingId) {
        await api.put(`/api/admin/branches/${editingId}`, payload);
      } else {
        await api.post('/api/admin/branches', payload);
      }

      load();
      setModal(false);
      setName('');
      setCode('');
      setCity('');
      setPincode('');
      setManagerId('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management System</h1>
          <p className="text-sm text-gray-500">Manage multiple operational branches, branch managers, and localized hubs (FR-05.4)</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-[#0F2C59] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#1a3d73] shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-40 skeleton-shimmer" />
          ))
        ) : (
          branches.map(b => (
            <div key={b.id || b._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-premium space-y-3 relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{b.name}</h3>
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{b.code}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(b)}
                    className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                    title="Edit Branch"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>City: <strong className="text-gray-800">{b.city || 'Bengaluru'} {b.pincode && `(${b.pincode})`}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Manager: <strong className="text-gray-800">{b.manager?.name || 'Unassigned'}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">
              {editingId ? 'Edit Branch details' : 'Create New Branch'}
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Branch Name</label>
              <input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. North Delhi Hub" 
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Branch Code</label>
              <input 
                required 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                placeholder="e.g. DEL-02" 
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
              <input 
                required 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                placeholder="e.g. New Delhi" 
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Pincode</label>
              <input 
                value={pincode} 
                onChange={e => setPincode(e.target.value)} 
                placeholder="e.g. 110001" 
                maxLength={6}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Assign Branch Manager</label>
              <select
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 text-gray-700 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {managers.map(m => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setModal(false)} 
                className="flex-1 py-2 border rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 bg-[#0F2C59] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3d73] shadow-md transition-colors"
              >
                {editingId ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
