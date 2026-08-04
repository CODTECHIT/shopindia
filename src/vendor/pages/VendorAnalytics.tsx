import React, { useEffect, useState } from 'react';
import { api, MOCK, USE_MOCK } from '../../lib/api';
import { Award, ArrowUpRight } from 'lucide-react';

export const VendorAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setData(MOCK.vendorAnalytics);
      setLoading(false);
    } else {
      api.get<any>('/api/vendor/analytics/summary')
        .then(d => setData(d))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return <div className="h-40 skeleton-shimmer rounded-2xl" />;

  const maxRev = Math.max(...(data?.dailyRevenue?.map((d: any) => d.revenue) || [1]), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Sales Analytics</h1>
        <p className="text-sm text-gray-500">Track revenue performance, top products, and daily sales trends (FR-02.4)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">30-Day Period Revenue</p>
          <p className="text-3xl font-bold text-gray-900 font-numbers">₹{data?.period?.total || 0}</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> {data?.period?.count || 0} orders fulfilled
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">All-Time Net Sales</p>
          <p className="text-3xl font-bold text-gray-900 font-numbers">₹{data?.allTime?.total || 0}</p>
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
    </div>
  );
};
