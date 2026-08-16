import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { CheckCircle, XCircle, Ban, Search, LayoutDashboard } from 'lucide-react';
import type { ManagedVendor } from '../AdminPortal';

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'suspended'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending:   'bg-amber-50  text-amber-700  border-amber-200',
    approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected:  'bg-red-50    text-red-700    border-red-200',
    suspended: 'bg-gray-100  text-gray-600   border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface Props {
  onManage?: (vendor: ManagedVendor) => void;
}

export const VendorsPage: React.FC<Props> = ({ onManage }) => {
  const [vendors, setVendors]   = useState<any[]>([]);
  const [filter, setFilter]     = useState('all');
  const [q, setQ]               = useState('');
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [note, setNote]         = useState('');
  const [modal, setModal]       = useState<{ id: string; action: string } | null>(null);

  const load = () => {
    setLoading(true);
    const qs = [filter !== 'all' ? `status=${filter}` : '', q ? `q=${q}` : ''].filter(Boolean).join('&');
    api.get<{ vendors: any[] }>(`/api/admin/vendors?${qs}`)
      .then(d => setVendors(d.vendors))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const approve = async (id: string, approvalStatus: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/admin/vendors/${id}/approval`, { approvalStatus, approvalNote: note });
      load();
    } catch (err: any) { alert(err.message); }
    finally { setActionId(null); setModal(null); setNote(''); }
  };

  const filtered = vendors.filter(v => !q || v.businessName.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500">Approve, reject or suspend vendor accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-full max-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search vendors…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Business</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Contact</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Commission</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Joined</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No vendors found.</td></tr>
              ) : filtered.map(v => (
                <tr key={v.id || v._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{v.businessName}</p>
                    <p className="text-gray-400 text-xs">{v.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{v.phone}</td>
                  <td className="px-5 py-4 text-gray-600">{v.commissionRate}%</td>
                  <td className="px-5 py-4"><StatusBadge status={v.approvalStatus} /></td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{v.createdAt?.slice(0, 10)}</td>

                  {/* Approve / Reject / Suspend */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {v.approvalStatus === 'pending' && (
                        <>
                          <button onClick={() => approve(v.id || v._id, 'approved')} disabled={actionId === (v.id || v._id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setModal({ id: v.id || v._id, action: 'rejected' }); }}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {v.approvalStatus === 'approved' && (
                        <button onClick={() => approve(v.id || v._id, 'suspended')} disabled={actionId === (v.id || v._id)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Suspend">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {v.approvalStatus === 'suspended' && (
                        <button onClick={() => approve(v.id || v._id, 'approved')} disabled={actionId === (v.id || v._id)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Reinstate">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Manage Panel */}
                  <td className="px-5 py-4">
                    {onManage && (
                      <button
                        onClick={() => onManage({ id: v.id || v._id, name: v.businessName })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F2C59] text-white text-xs font-semibold hover:bg-[#0F2C59]/90 transition-colors shadow-sm"
                        title={`Manage ${v.businessName}'s panel`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Manage Panel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Reject Vendor</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason (optional).</p>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Rejection reason…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => approve(modal.id, modal.action)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
