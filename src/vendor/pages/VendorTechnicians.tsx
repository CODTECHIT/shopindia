import React, { useEffect, useState } from 'react';
import { api, USE_MOCK } from '../../lib/api';
import { Wrench, Plus, UserCircle2, Calendar, CheckCircle, Ban } from 'lucide-react';

export const VendorTechnicians: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'technicians' | 'jobs'>('technicians');
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  
  // Tech Form
  const [showTechForm, setShowTechForm] = useState(false);
  const [techForm, setTechForm] = useState({ name: '', phone: '', email: '', skills: '' });

  const loadData = async () => {
    if (USE_MOCK) {
      setTechnicians([{ id: '1', name: 'John Doe', phone: '9876543210', skills: ['HVAC', 'Plumbing'], currentStatus: 'available', isActive: true }]);
      setJobs([{ id: 'j1', order: { orderNumber: 'ORD-123', status: 'confirmed' }, technician: { name: 'John Doe' }, status: 'scheduled', scheduledDate: new Date().toISOString() }]);
      return;
    }
    
    try {
      if (activeTab === 'technicians') {
        const res = await api.get<{ technicians: any[] }>('/api/vendor/technicians');
        setTechnicians(res.technicians);
      } else {
        const res = await api.get<{ serviceJobs: any[] }>('/api/vendor/service-jobs');
        setJobs(res.serviceJobs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, [activeTab]);

  const handleCreateTech = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (USE_MOCK) return alert("Mock create!");
      await api.post('/api/vendor/technicians', techForm);
      setShowTechForm(false);
      setTechForm({ name: '', phone: '', email: '', skills: '' });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const toggleTechStatus = async (id: string, currentIsActive: boolean) => {
    if (USE_MOCK) return;
    try {
      await api.patch(`/api/vendor/technicians/${id}/status`, { isActive: !currentIsActive });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const updateJobStatus = async (id: string, status: string) => {
    if (USE_MOCK) return;
    try {
      await api.patch(`/api/vendor/service-jobs/${id}`, { status });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technician Management</h1>
          <p className="text-sm text-gray-500">Manage field staff and schedule service jobs</p>
        </div>
        {activeTab === 'technicians' && (
          <button onClick={() => setShowTechForm(!showTechForm)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium text-sm transition-all shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4" /> Add Technician
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('technicians')} className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'technicians' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500'}`}><UserCircle2 className="w-4 h-4"/> Field Staff</button>
        <button onClick={() => setActiveTab('jobs')} className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'jobs' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500'}`}><Calendar className="w-4 h-4"/> Service Schedule</button>
      </div>

      {activeTab === 'technicians' && showTechForm && (
        <form onSubmit={handleCreateTech} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input required value={techForm.name} onChange={e => setTechForm({...techForm, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <input required value={techForm.phone} onChange={e => setTechForm({...techForm, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input value={techForm.skills} onChange={e => setTechForm({...techForm, skills: e.target.value})} placeholder="HVAC, Plumbing" className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-medium text-sm">Save Technician</button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'technicians' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Technician</th>
                <th className="px-5 py-3.5 font-semibold">Skills</th>
                <th className="px-5 py-3.5 font-semibold">Availability</th>
                <th className="px-5 py-3.5 font-semibold">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {technicians.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-gray-400">No technicians found.</td></tr> : technicians.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600">
                    {t.skills.join(', ') || 'General'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${t.currentStatus === 'available' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {t.currentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleTechStatus(t.id, t.isActive)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${t.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                      {t.isActive ? <><CheckCircle className="w-3.5 h-3.5"/> Active</> : <><Ban className="w-3.5 h-3.5"/> Inactive</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Job Details</th>
                <th className="px-5 py-3.5 font-semibold">Assigned Tech</th>
                <th className="px-5 py-3.5 font-semibold">Scheduled Date</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No scheduled jobs.</td></tr> : jobs.map(j => (
                <tr key={j.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-emerald-600"/> {j.order?.orderNumber}</p>
                    <p className="text-xs text-gray-500">Order Status: {j.order?.status}</p>
                  </td>
                  <td className="px-5 py-4">
                    {j.technician ? (
                      <p className="font-semibold text-gray-900">{j.technician.name}</p>
                    ) : <span className="text-gray-400 text-xs italic">Unassigned</span>}
                  </td>
                  <td className="px-5 py-4 text-gray-600 font-numbers">
                    {j.scheduledDate ? new Date(j.scheduledDate).toLocaleString() : 'Pending'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">
                      {j.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {j.status !== 'completed' && (
                      <button onClick={() => updateJobStatus(j.id, 'completed')} className="text-xs font-semibold text-emerald-600 hover:underline">
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
