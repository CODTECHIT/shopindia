import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { 
  CheckCircle2, Send, X, Filter
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = () => {
    setLoading(true);
    api.get<{ tickets: any[] }>('/api/admin/support/tickets')
      .then(d => setTickets(d.tickets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Live polling for table
  useEffect(() => {
    const timer = setInterval(() => {
      api.get<{ tickets: any[] }>('/api/admin/support/tickets')
        .then(d => {
          if (d.tickets) setTickets(d.tickets);
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Live polling for open modal thread
  useEffect(() => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket.id || selectedTicket._id;
    const timer = setInterval(() => {
      api.get<any>(`/api/admin/support/tickets/${ticketId}`)
        .then(updated => {
          if (updated) setSelectedTicket(updated);
        })
        .catch(() => {});
    }, 2000);
    return () => clearInterval(timer);
  }, [selectedTicket?.id, selectedTicket?._id]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/admin/support/tickets/${id}/status`, { status: newStatus });
      if (selectedTicket && (selectedTicket.id === id || selectedTicket._id === id)) {
        setSelectedTicket((prev: any) => ({ ...prev, status: newStatus }));
      }
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    const ticketId = selectedTicket.id || selectedTicket._id;
    const text = replyText.trim();
    setReplyText('');

    // Optimistic UI update for admin
    const optimisticMsg = {
      senderRole: 'support',
      text,
      sentAt: new Date().toISOString()
    };
    setSelectedTicket((prev: any) => ({
      ...prev,
      messages: [...(prev?.messages || []), optimisticMsg]
    }));

    setReplying(true);
    try {
      await api.post(`/api/admin/support/tickets/${ticketId}/reply`, { text });
      const updated = await api.get<any>(`/api/admin/support/tickets/${ticketId}`);
      if (updated) setSelectedTicket(updated);
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReplying(false);
    }
  };

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-heading">Support & Ticket Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Resolve customer inquiries, technician issues, and booking support requests
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
          <Filter size={14} className="text-gray-400 ml-2" />
          {['all', 'open', 'in_progress', 'resolved'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                filterStatus === st 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-5 py-3.5">Ticket #</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Subject & Category</th>
              <th className="px-5 py-3.5">Priority</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td></tr>
              ))
            ) : filteredTickets.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 font-medium">No tickets found for this filter.</td></tr>
            ) : (
              filteredTickets.map(t => {
                const id = t.id || t._id;
                const customerName = t.customer?.name || t.customerId?.name || 'Guest User';
                const customerContact = t.customer?.phone || t.customer?.email || t.customerId?.phone || '';
                
                return (
                  <tr key={id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-600">#{t.ticketNumber}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{customerName}</div>
                      {customerContact && <div className="text-[11px] text-gray-400">{customerContact}</div>}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-gray-800 line-clamp-1">{t.subject}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        t.priority === 'urgent' || t.priority === 'high' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        t.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        t.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 font-mono">
                      {new Date(t.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        View & Reply
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Ticket Details & Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setSelectedTicket(null)} />

          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-elevated border border-gray-100 relative z-10 max-h-[90vh] flex flex-col">
            {/* Modal Top */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-blue-600">#{selectedTicket.ticketNumber}</span>
                  <span className={`text-[10.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                    selectedTicket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-bold text-base text-gray-900 mt-1">{selectedTicket.subject}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X size={15} />
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Customer Name</span>
                <span className="font-bold text-gray-800">{selectedTicket.customer?.name || selectedTicket.customerId?.name || 'Guest User'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Email / Phone</span>
                <span className="font-bold text-gray-800">{selectedTicket.customer?.phone || selectedTicket.customer?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Category</span>
                <span className="font-bold text-amber-700 uppercase">{selectedTicket.category}</span>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Conversation History</span>
              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((m: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl text-xs ${
                      m.senderRole === 'customer' 
                        ? 'bg-slate-100 border border-slate-200 text-gray-800' 
                        : 'bg-blue-600 text-white ml-auto max-w-[85%]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1 text-[10px] opacity-75 font-bold uppercase">
                      <span>{m.senderRole === 'customer' ? 'Customer Message' : 'Support Specialist'}</span>
                      <span>{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="font-medium whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">No message history found.</div>
              )}
            </div>

            {/* Reply Input */}
            <form onSubmit={sendReply} className="border-t border-gray-100 pt-3 flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Type resolution reply or note to customer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
              />
              <button
                type="submit"
                disabled={replying || !replyText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </form>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(selectedTicket.id || selectedTicket._id, 'in_progress')}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => updateStatus(selectedTicket.id || selectedTicket._id, 'resolved')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1"
                >
                  <CheckCircle2 size={13} />
                  <span>Mark Resolved</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
