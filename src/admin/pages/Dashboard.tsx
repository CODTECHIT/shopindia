import React, { useEffect, useState } from 'react';
import { api, MOCK, USE_MOCK } from '../../lib/api';
import {
  Users, Store, Bike, ShoppingBag, TrendingUp,
  AlertCircle, Clock, DollarSign, ArrowUpRight,
} from 'lucide-react';

interface Stats {
  totalUsers: number; totalVendors: number; totalRiders: number;
  totalOrders: number; pendingVendors: number; openTickets: number; totalRevenue: number;
}
interface DailyOrder { _id: string; count: number; revenue: number; }

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);
const fmtRs = (n: number) => '₹' + fmt(n);

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
  const [stats, setStats]   = useState<Stats | null>(null);
  const [chart, setChart]   = useState<DailyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (USE_MOCK
      ? Promise.resolve(MOCK.adminDashboard)
      : api.get<{ stats: Stats; dailyOrders: DailyOrder[] }>('/api/admin/dashboard')
    ).then(d => { setStats(d.stats); setChart(d.dailyOrders); })
     .catch(console.error)
     .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 h-28 skeleton-shimmer" />
      ))}
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Revenue — Last 7 Days</h2>
            <p className="text-sm text-gray-500">Daily revenue trend</p>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+12.4%</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {chart.map(d => (
            <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-[#0F2C59] to-[#2563eb] rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${(d.revenue / maxRev) * 120}px` }}
                title={fmtRs(d.revenue)}
              />
              <span className="text-xs text-gray-400">{d._id.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
