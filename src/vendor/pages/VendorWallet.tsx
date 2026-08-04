import React, { useEffect, useState } from 'react';
import { api, USE_MOCK } from '../../lib/api';
import { ArrowDownRight } from 'lucide-react';

export const VendorWallet: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState<number>(1000);

  const load = () => {
    setLoading(true);
    if (USE_MOCK) {
      setWallet({
        walletBalance: 22400,
        commissionRate: 10,
        grossRevenue: 284760,
        totalCommission: 28476,
        netEarnings: 256284,
        bankDetails: { bankName: 'HDFC Bank', accountNumber: 'XXXXXX4920', ifsc: 'HDFC0001234' },
      });
      setLoading(false);
    } else {
      api.get<any>('/api/vendor/wallet')
        .then(d => setWallet(d))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(load, []);

  const handleWithdraw = async () => {
    try {
      if (USE_MOCK) {
        setWallet((w: any) => ({ ...w, walletBalance: (w?.walletBalance || 0) - amount }));
      } else {
        await api.post('/api/vendor/wallet/withdraw', { amount });
        load();
      }
      setWithdrawModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="h-40 skeleton-shimmer rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Wallet & Payouts</h1>
          <p className="text-sm text-gray-500">View wallet balance, platform commission deductions, and request payouts (FR-02.5)</p>
        </div>
        <button
          onClick={() => setWithdrawModal(true)}
          className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-semibold hover:bg-[#059669] flex items-center gap-2"
        >
          <ArrowDownRight className="w-4 h-4" /> Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#10B981] to-[#047857] rounded-2xl p-6 text-white shadow-xl space-y-2">
          <p className="text-xs uppercase font-semibold text-white/80">Available Wallet Balance</p>
          <p className="text-3xl font-bold font-numbers">₹{wallet?.walletBalance || 0}</p>
          <p className="text-xs text-white/70">Commission Rate: {wallet?.commissionRate || 10}%</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">Gross Sales Revenue</p>
          <p className="text-2xl font-bold text-gray-900 font-numbers">₹{wallet?.grossRevenue || 0}</p>
          <p className="text-xs text-red-500 font-semibold">-₹{wallet?.totalCommission || 0} Commission</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">Settled Bank Account</p>
          <p className="text-base font-bold text-gray-900">{wallet?.bankDetails?.bankName || 'Not Linked'}</p>
          <p className="text-xs font-mono text-gray-500">{wallet?.bankDetails?.accountNumber || 'No Account Linked'}</p>
        </div>
      </div>

      {withdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Request Withdrawal</h3>
            <p className="text-xs text-gray-500">Max available: ₹{wallet?.walletBalance || 0}</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                max={wallet?.walletBalance || 0}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-sm font-numbers"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setWithdrawModal(false)} className="flex-1 py-2 border rounded-xl text-sm">Cancel</button>
              <button onClick={handleWithdraw} className="flex-1 py-2 bg-[#10B981] text-white rounded-xl text-sm font-semibold hover:bg-[#059669]">Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
