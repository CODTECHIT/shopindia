import React, { useEffect, useState } from 'react';
import { api, USE_MOCK } from '../../lib/api';
import { Download, Calendar, Filter, BarChart3, TrendingUp } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = () => {
    setLoading(true);
    if (USE_MOCK) {
      setReports([
        { id: '1', orderNumber: 'ORD-1234', total: 1500, status: 'delivered', createdAt: new Date().toISOString(), branch: { name: 'Main Branch' }, vendor: { businessName: 'Tech Store' } }
      ]);
      setLoading(false);
    } else {
      api.get<{ orders: any[] }>('/api/admin/reports/sales')
        .then(d => setReports(d.orders))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(loadReports, []);

  const handleExportCSV = async () => {
    try {
      if (USE_MOCK) {
        alert("Mock CSV Export Triggered");
        return;
      }
      const res = await api.get<{ data: any[] }>('/api/admin/reports/export');
      const csvData = res.data;
      if (!csvData.length) return alert('No data to export');

      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopindia_sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deep Reporting & Analytics</h1>
          <p className="text-sm text-gray-500">Generate business reports and export financial data (FR-12)</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#0F2C59] text-white rounded-xl hover:bg-[#0F2C59]/90 font-medium text-sm transition-all shadow-lg shadow-[#0F2C59]/20">
          <Download className="w-4 h-4" />
          Export All as CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
          <div className="flex items-center gap-3 text-[#0F2C59] mb-2"><BarChart3 className="w-5 h-5" /><h3 className="font-semibold">Sales Volume</h3></div>
          <p className="text-2xl font-bold font-numbers">{reports.length}</p>
          <p className="text-xs text-gray-500 mt-1">Orders matched in timeframe</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
          <div className="flex items-center gap-3 text-emerald-600 mb-2"><TrendingUp className="w-5 h-5" /><h3 className="font-semibold">Total Value</h3></div>
          <p className="text-2xl font-bold font-numbers">₹{reports.reduce((sum, r) => sum + (r.total || 0), 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Gross Merchandise Value (GMV)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-3">
          <div className="flex-1 max-w-xs relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 bg-gray-50">
              <option value="">All Branches</option>
              <option value="main">Main Branch</option>
            </select>
          </div>
          <div className="flex-1 max-w-xs relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="date" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 bg-gray-50" />
          </div>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Order No</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 font-semibold">Amount</th>
              <th className="px-5 py-3.5 font-semibold">Vendor</th>
              <th className="px-5 py-3.5 font-semibold">Branch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
               <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading Report...</td></tr>
            ) : reports.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-[#0F2C59]">{r.orderNumber}</td>
                <td className="px-5 py-3 text-gray-500 font-numbers">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-numbers font-semibold">₹{r.total}</td>
                <td className="px-5 py-3 text-gray-600">{r.vendor?.businessName || 'N/A'}</td>
                <td className="px-5 py-3 text-gray-600">{r.branch?.name || 'Online'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
