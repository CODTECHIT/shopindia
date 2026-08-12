import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import {
  Users, Store, Bike, ShoppingBag, TrendingUp,
  AlertCircle, Clock, DollarSign, ArrowUpRight, Download, Calendar,
} from 'lucide-react';

interface Stats {
  totalUsers: number; totalVendors: number; totalRiders: number;
  totalOrders: number; pendingVendors: number; openTickets: number; totalRevenue: number;
}
interface DailyOrder { _id: string; count: number; revenue: number; }

type Range = '7d' | '3m' | '6m' | '12m';

const fmt    = (n: number) => new Intl.NumberFormat('en-IN').format(n);
const fmtRs  = (n: number) => '₹' + fmt(n);

const PRESETS: { label: string; value: Range }[] = [
  { label: '7 Days',    value: '7d'  },
  { label: '3 Months',  value: '3m'  },
  { label: '6 Months',  value: '6m'  },
  { label: '12 Months', value: '12m' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2022 }, (_, i) => String(2023 + i));

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; color: string }> = ({ icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-premium border border-gray-100 flex items-start gap-4 hover:shadow-elevated transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 font-numbers mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [chart,   setChart]   = useState<DailyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Filter state — only one active at a time
  const [range,      setRange]      = useState<Range>('7d');
  const [singleDate, setSingleDate] = useState('');
  const [year,       setYear]       = useState('');

  // Load main stats once
  useEffect(() => {
    api.get<{ stats: Stats; dailyOrders: DailyOrder[] }>('/api/admin/dashboard')
      .then(d => { setStats(d.stats); setChart(d.dailyOrders); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch chart whenever filter changes
  const fetchChart = useCallback(() => {
    const params = new URLSearchParams();
    if (singleDate) {
      params.set('date', singleDate);
    } else if (year) {
      params.set('year', year);
    } else {
      params.set('range', range);
    }

    setChartLoading(true);
    api.get<{ chartData: DailyOrder[] }>(`/api/admin/dashboard/revenue-chart?${params}`)
      .then(d => setChart(d.chartData))
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [range, singleDate, year]);

  useEffect(() => {
    if (!loading) fetchChart();
  }, [range, singleDate, year, loading, fetchChart]);

  // CSV download — same filter params
  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (singleDate) params.set('date', singleDate);
      else if (year)  params.set('year', year);
      else            params.set('range', range);

      const res = await api.get<{ data: Record<string, unknown>[] }>(
        `/api/admin/dashboard/revenue-export?${params}`
      );
      const csvData = res.data;
      if (!csvData.length) return alert('No revenue data for this period.');

      const headers = Object.keys(csvData[0]).join(',');
      const rows    = csvData.map(row =>
        Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const label = singleDate || year || range;
      a.href     = url;
      a.download = `revenue_${label}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  // Helpers to switch filter and clear the others
  const selectRange = (r: Range) => { setRange(r); setSingleDate(''); setYear(''); };
  const selectDate  = (d: string) => { setSingleDate(d); setYear(''); };
  const selectYear  = (y: string) => { setYear(y); setSingleDate(''); };

  const activeLabel = singleDate
    ? `${singleDate} (Hourly)`
    : year
      ? `Year ${year}`
      : PRESETS.find(p => p.value === range)?.label ?? '';

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 h-28 skeleton-shimmer" />
      ))}
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
      <p className="font-semibold">Failed to load dashboard</p>
      <p className="text-sm mt-1">{error}</p>
      <p className="text-xs mt-2 text-red-500">Make sure the backend server is running on port 5001.</p>
    </div>
  );

  const maxRev = Math.max(...chart.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview — live stats</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-blue-600" />}    label="Total Customers" value={fmt(stats?.totalUsers    ?? 0)} color="bg-blue-50"   />
        <StatCard icon={<Store className="w-5 h-5 text-emerald-600" />} label="Vendors"          value={fmt(stats?.totalVendors ?? 0)} sub={`${stats?.pendingVendors} pending`} color="bg-emerald-50" />
        <StatCard icon={<Bike className="w-5 h-5 text-orange-600" />}   label="Riders"           value={fmt(stats?.totalRiders  ?? 0)} color="bg-orange-50"  />
        <StatCard icon={<ShoppingBag className="w-5 h-5 text-purple-600" />} label="Total Orders" value={fmt(stats?.totalOrders ?? 0)} color="bg-purple-50"  />
        <StatCard icon={<DollarSign className="w-5 h-5 text-green-600" />}   label="Total Revenue" value={fmtRs(stats?.totalRevenue ?? 0)} color="bg-green-50" />
        <StatCard icon={<AlertCircle className="w-5 h-5 text-red-600" />}    label="Open Tickets"  value={fmt(stats?.openTickets  ?? 0)} color="bg-red-50"    />
        <StatCard icon={<Clock className="w-5 h-5 text-amber-600" />}        label="Pending Approvals" value={fmt(stats?.pendingVendors ?? 0)} sub="vendors awaiting review" color="bg-amber-50" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}  label="Avg Order Value"   value={fmtRs(stats ? Math.round(stats.totalRevenue / (stats.totalOrders || 1)) : 0)} color="bg-indigo-50" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-premium border border-gray-100">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="font-bold text-gray-900">Revenue — {activeLabel}</h2>
            <p className="text-sm text-gray-500">Daily revenue trend</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ArrowUpRight className="w-4 h-4 text-emerald-600 hidden sm:block" />
            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-[#0F2C59] text-white rounded-lg hover:bg-[#0F2C59]/90 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {/* Preset pills */}
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => selectRange(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !singleDate && !year && range === p.value
                  ? 'bg-[#0F2C59] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}

          {/* Single date picker */}
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={singleDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => selectDate(e.target.value)}
              className={`pl-8 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 transition-colors ${
                singleDate ? 'border-[#0F2C59] bg-[#0F2C59]/5 text-[#0F2C59] font-semibold' : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
              title="Filter by a specific day"
            />
          </div>

          {/* Year select */}
          <select
            value={year}
            onChange={e => selectYear(e.target.value)}
            className={`px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 transition-colors ${
              year ? 'border-[#0F2C59] bg-[#0F2C59]/5 text-[#0F2C59] font-semibold' : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
          >
            <option value="">Year</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Chart */}
        {chartLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#0F2C59] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chart.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No revenue data for this period.</p>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {chart.map(d => (
              <div key={d._id} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div
                  className="w-full bg-gradient-to-t from-[#0F2C59] to-[#2563eb] rounded-t-lg transition-all hover:opacity-80 cursor-default"
                  style={{ height: `${(d.revenue / maxRev) * 120}px` }}
                  title={`${d._id}\n${fmtRs(d.revenue)} • ${d.count} orders`}
                />
                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                  {/* For month keys (YYYY-MM), show short month name; for hour keys (HH:00), show as-is; else show MM-DD */}
                  {d._id.length === 7
                    ? new Date(`${d._id}-01`).toLocaleString('default', { month: 'short' })
                    : d._id.length === 5
                      ? d._id          // HH:00
                      : d._id.slice(5) // MM-DD
                  }
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
