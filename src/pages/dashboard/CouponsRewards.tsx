import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { PageHeader, SectionCard, Badge } from '../../components/dashboard/DashboardUI';
import { TicketPercent, BadgeIndianRupee, Copy, TrendingUp } from 'lucide-react';
import type { CouponState } from '../../data/dashboardTypes';

const STATE_TONE: Record<CouponState, 'green' | 'amber' | 'slate'> = { available: 'green', used: 'amber', expired: 'slate' };

export const CouponsRewardsPage: React.FC = () => {
  const { coupons, points, rewards } = useCustomer();
  const groups: { key: CouponState; label: string }[] = [
    { key: 'available', label: 'Available' },
    { key: 'used', label: 'Used' },
    { key: 'expired', label: 'Expired' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Coupons & Rewards" subtitle="Maximise your savings with promos and reward points" />

      {/* Rewards summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-br from-brand-blue to-blue-800 rounded-card p-6 text-white shadow-elevated">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">ShopIndia Rewards Balance</p>
              <p className="text-4xl font-black font-numbers mt-1">{points.toLocaleString('en-IN')} <span className="text-lg font-bold text-white/70">pts</span></p>
              <p className="text-white/70 text-xs mt-2">≈ ₹{Math.floor(points).toLocaleString('en-IN')} on your next order</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center"><BadgeIndianRupee className="w-7 h-7" /></div>
          </div>
        </div>

        <SectionCard title="Reward History" subtitle="How you earned points">
          <div className="space-y-2.5">
            {rewards.map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-graphite capitalize">{r.source}</p>
                  <p className="text-[10px] text-brand-slate">{r.description}</p>
                </div>
                <Badge tone="green">+{r.points} pts</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Coupon groups */}
      {groups.map((g) => {
        const list = coupons.filter((c) => c.state === g.key);
        if (list.length === 0) return null;
        return (
          <SectionCard key={g.key} title={`${g.label} Coupons`} subtitle={`${list.length} coupon${list.length === 1 ? '' : 's'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((c) => (
                <div key={c.id} className="border border-brand-border rounded-xl overflow-hidden flex">
                  <div className="bg-brand-orange/10 text-brand-orange flex items-center justify-center px-4">
                    <TicketPercent className="w-5 h-5" />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold font-numbers text-brand-graphite">{c.code}</p>
                      <Badge tone={STATE_TONE[c.state]}>{c.state}</Badge>
                    </div>
                    <p className="text-xs font-bold text-brand-orange mt-1">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}</p>
                    <p className="text-[10px] text-brand-slate mt-0.5">{c.title} · Min ₹{c.minOrderValue.toLocaleString('en-IN')}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/40">
                      <span className="text-[10px] text-brand-slate">Valid till {new Date(c.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      {g.key === 'available' && (
                        <button onClick={() => { navigator.clipboard?.writeText(c.code).catch(() => {}); alert(`Coupon ${c.code} copied!`); }} className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-blue"><Copy className="w-3 h-3" /> Copy</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      })}

      {/* How to earn */}
      <SectionCard title="Earn More Rewards" subtitle="Ways to boost your points">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: <TrendingUp className="w-5 h-5" />, title: 'Order More', desc: 'Earn on every order placed' },
            { icon: <TicketPercent className="w-5 h-5" />, title: 'Write Reviews', desc: '+25 pts per verified review' },
            { icon: <BadgeIndianRupee className="w-5 h-5" />, title: 'Refer Friends', desc: '+200 pts per referral' },
          ].map((x, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-brand-border rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">{x.icon}</div>
              <div>
                <p className="text-xs font-bold text-brand-graphite">{x.title}</p>
                <p className="text-[10px] text-brand-slate">{x.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};