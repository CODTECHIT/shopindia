import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Award, ArrowUpRight, Download, Calendar } from 'lucide-react';

export const VendorAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const loadAnalytics = () => {
    setLoading(true);
    let url = `/api/vendor/analytics/summary?period=${period}`;
    if (period === 'custom') {
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
    }
    api.get<any>(url)
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (period !== 'custom') {
      loadAnalytics();
    }
  }, [period]);

  const handleDownloadCSV = () => {
    if (!data?.rawOrders?.length) {
      alert("No order data available for the selected period.");
      return;
    }
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Items", "Total Amount (INR)", "Status", "Payment Method", "Payment Status"];
    const rows = data.rawOrders.map((o: any) => [
      o.orderNumber,
      o.date,
      o.customerName,
      o.customerEmail,
      `"${o.items.replace(/"/g, '""')}"`,
      o.totalAmount,
      o.status,
      o.paymentMethod,
      o.paymentStatus
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vendor_sales_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxRev = Math.max(...(data?.dailyRevenue?.map((d: any) => d.revenue) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Top Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Sales Analytics</h1>
          <p className="text-sm text-gray-500">Track revenue performance, top products, and daily sales trends (FR-02.4)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="text-xs font-semibold border-none focus:ring-0 bg-transparent text-gray-700 cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="monthly">Monthly (30 Days)</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {period === 'custom' && (
            <div className="flex items-center gap-2 border-l pl-3 border-gray-100 animate-fadeIn">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={loadAnalytics}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 skeleton-shimmer rounded-2xl" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase">Filtered Period Revenue</p>
              <p className="text-3xl font-bold text-gray-900 font-numbers font-heading">₹{data?.period?.total || 0}</p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> {data?.period?.count || 0} orders fulfilled
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase">All-Time Net Sales</p>
              <p className="text-3xl font-bold text-gray-900 font-numbers font-heading">₹{data?.allTime?.total || 0}</p>
              <p className="text-xs text-gray-500">{data?.allTime?.count || 0} total orders</p>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium">
            <h2 className="font-bold text-gray-900 mb-4">Daily Sales Performance</h2>
            {data?.dailyRevenue?.length > 0 ? (
              <div className="flex items-end gap-2 h-40">
                {data?.dailyRevenue?.map((d: any) => (
                  <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-[#10B981] to-[#34D399] rounded-t-lg transition-all"
                      style={{ height: `${(d.revenue / maxRev) * 120}px` }}
                      title={`₹${d.revenue}`}
                    />
                    <span className="text-[10px] text-gray-400">{d._id.slice(5)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-10">No daily sales recorded yet.</p>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Top Performing Products
            </h2>
            <div className="space-y-3">
              {data?.topProducts?.length > 0 ? (
                data?.topProducts?.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <span className="font-semibold text-sm text-gray-800">{p.name}</span>
                    <div className="text-right">
                      <p className="font-numbers font-bold text-sm text-gray-900">₹{p.revenue}</p>
                      <p className="text-xs text-gray-400">{p.sold} units sold</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No top product data available yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
