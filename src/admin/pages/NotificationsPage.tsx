import React, { useEffect, useState } from 'react';
import { api, USE_MOCK } from '../../lib/api';
import { Mail, MessageSquare, Save } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
  const [_, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Selected Template State
  const [eventKey, setEventKey] = useState('ORDER_PLACED');
  const [smsBody, setSmsBody] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const loadTemplates = async () => {
    if (USE_MOCK) return;
    try {
      const res = await api.get<{ templates: any[] }>('/api/admin/notifications/templates');
      setTemplates(res.templates);
      const t = res.templates.find(x => x.event === eventKey);
      if (t) {
        setSmsBody(t.smsBody || '');
        setEmailSubject(t.emailSubject || '');
        setEmailBody(t.emailBody || '');
      }
    } catch (e) {}
  };

  const loadLogs = async () => {
    if (USE_MOCK) {
      setLogs([{ id: '1', recipient: 'john@example.com', type: 'EMAIL', event: 'ORDER_PLACED', status: 'sent', message: 'Order #123 placed successfully.', sentAt: new Date().toISOString() }]);
      return;
    }
    try {
      const res = await api.get<{ logs: any[] }>('/api/admin/notifications/logs');
      setLogs(res.logs);
    } catch (e) {}
  };

  useEffect(() => {
    if (activeTab === 'templates') loadTemplates();
    else loadLogs();
  }, [activeTab]);

  const handleSave = async () => {
    try {
      if (USE_MOCK) return alert("Mock saved!");
      await api.put('/api/admin/notifications/templates', {
        event: eventKey, smsBody, emailSubject, emailBody, isActive: true
      });
      alert('Template saved successfully!');
      loadTemplates();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notification System</h1>
        <p className="text-sm text-gray-500">Manage Email & SMS templates and view broadcast logs (FR-11)</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('templates')} className={`pb-3 text-sm font-medium border-b-2 ${activeTab === 'templates' ? 'border-[#0F2C59] text-[#0F2C59]' : 'border-transparent text-gray-500'}`}>Templates</button>
        <button onClick={() => setActiveTab('logs')} className={`pb-3 text-sm font-medium border-b-2 ${activeTab === 'logs' ? 'border-[#0F2C59] text-[#0F2C59]' : 'border-transparent text-gray-500'}`}>Message Logs</button>
      </div>

      {activeTab === 'templates' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-premium max-w-3xl">
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Event</label>
            <select value={eventKey} onChange={e => setEventKey(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-[#0F2C59]">
              <option value="ORDER_PLACED">Order Placed</option>
              <option value="ORDER_SHIPPED">Order Shipped</option>
              <option value="REFUND_PROCESSED">Refund Processed</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><MessageSquare className="w-4 h-4"/> SMS Body Template</label>
            <textarea value={smsBody} onChange={e => setSmsBody(e.target.value)} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-[#0F2C59]" placeholder="Hi {{name}}, your order {{orderId}} is confirmed!"></textarea>
          </div>

          <div className="mb-5 border-t border-gray-100 pt-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Mail className="w-4 h-4"/> Email Subject Template</label>
            <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-[#0F2C59]" placeholder="Order Confirmation - {{orderId}}"/>
            
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Email Body Template (HTML)</label>
            <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={6} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-[#0F2C59] font-mono text-sm" placeholder="<h1>Thank you!</h1>"></textarea>
          </div>

          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#0F2C59] text-white rounded-xl hover:bg-[#0F2C59]/90 font-medium">
            <Save className="w-4 h-4" /> Save Template
          </button>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Sent At</th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Recipient</th>
                <th className="px-5 py-3.5 font-semibold">Event</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-5 py-3 text-gray-500 font-numbers">{new Date(log.sentAt).toLocaleString()}</td>
                  <td className="px-5 py-3 font-semibold">{log.type}</td>
                  <td className="px-5 py-3">{log.recipient}</td>
                  <td className="px-5 py-3 text-gray-600">{log.event}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${log.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No logs found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
