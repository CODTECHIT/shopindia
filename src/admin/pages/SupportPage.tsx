import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get<{ tickets: any[] }>('/api/admin/support/tickets')
      .then(d => setTickets(d.tickets))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/admin/support/tickets/${id}/status`, { status: newStatus });
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Team Dashboard</h1>
        <p className="text-sm text-gray-500">Manage customer tickets, issues, disputes, and resolution workflows (FR-05.7)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Ticket #</th>
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Subject</th>
              <th className="px-5 py-3.5 font-semibold">Priority</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Created</th>
              <th className="px-5 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              ))
            ) : tickets.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No support tickets found.</td></tr>
            ) : (
              tickets.map(t => (
                <tr key={t._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-mono font-bold text-gray-900">{t.ticketNumber}</td>
                  <td className="px-5 py-4 font-semibold text-gray-800">{t.customerId?.name}</td>
                  <td className="px-5 py-4 text-gray-900 font-medium">{t.subject}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      t.priority === 'urgent' || t.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      t.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' :
                      t.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{t.createdAt?.slice(0, 10)}</td>
                  <td className="px-5 py-4">
                    {t.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus(t._id, 'resolved')}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"
                      >
                        Mark Resolved
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
