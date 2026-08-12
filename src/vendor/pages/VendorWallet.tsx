import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ArrowDownRight } from 'lucide-react';

export const VendorWallet: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState<number>(1000);

  const [bankModal, setBankModal] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  const load = () => {
    setLoading(true);
    api.get<any>('/api/vendor/wallet')
      .then(d => setWallet(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (wallet?.bankDetails) {
      setBankName(wallet.bankDetails.bankName || '');
      setAccountHolder(wallet.bankDetails.accountHolder || '');
      setAccountNumber(wallet.bankDetails.accountNumber || '');
      setIfsc(wallet.bankDetails.ifsc || '');
    }
  }, [wallet]);

  const handleWithdraw = async () => {
    try {
      await api.post('/api/vendor/wallet/withdraw', { amount });
      load();
      setWithdrawModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveBankDetails = async () => {
    try {
      await api.patch('/api/vendor/wallet/bank-details', {
        bankName,
        accountHolder,
        accountNumber,
        ifsc
      });
      load();
      setBankModal(false);
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

      {/* Calculate Available Wallet Balance (Wallet Balance - Pending Withdrawals) */}
      {(() => {
        const pendingSum = wallet?.transactions
          ?.filter((t: any) => t.type === 'withdrawal' && t.status === 'pending')
          ?.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;
        const availableBalance = (wallet?.walletBalance || 0) - pendingSum;

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#10B981] to-[#047857] rounded-2xl p-6 text-white shadow-xl space-y-2">
                <p className="text-xs uppercase font-semibold text-white/80">Available Wallet Balance</p>
                <p className="text-3xl font-bold font-numbers">₹{availableBalance}</p>
                <p className="text-xs text-white/70">Commission Rate: {wallet?.commissionRate || 10}%</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">Gross Sales Revenue</p>
                <p className="text-2xl font-bold text-gray-900 font-numbers">₹{wallet?.grossRevenue || 0}</p>
                <p className="text-xs text-red-500 font-semibold">-₹{wallet?.totalCommission || 0} Commission</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-premium space-y-2 relative group">
                <p className="text-xs font-semibold text-gray-400 uppercase">Settled Bank Account</p>
                <p className="text-base font-bold text-gray-900">{wallet?.bankDetails?.bankName || 'Not Linked'}</p>
                <p className="text-xs font-mono text-gray-500">{wallet?.bankDetails?.accountNumber || 'No Account Linked'}</p>
                {wallet?.bankDetails?.ifsc && (
                  <p className="text-[10px] font-mono text-gray-400 uppercase">IFSC: {wallet.bankDetails.ifsc}</p>
                )}
                <button
                  onClick={() => setBankModal(true)}
                  className="absolute bottom-4 right-4 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  {wallet?.bankDetails?.bankName ? 'Edit Details' : 'Link Account'}
                </button>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 font-semibold text-sm text-gray-900">Transaction & Payout History</div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {!wallet?.transactions?.length ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    wallet.transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{t.createdAt?.slice(0, 10)}</td>
                        <td className="px-5 py-3.5 text-gray-800 capitalize font-medium">{t.type}</td>
                        <td className={`px-5 py-3.5 font-numbers font-semibold ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.amount >= 0 ? '+' : ''}₹{t.amount}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                            t.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                            t.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{t.note || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {withdrawModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg">Request Withdrawal</h3>
                  <p className="text-xs text-gray-500">Max available: ₹{availableBalance}</p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={amount}
                      max={availableBalance}
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

            {bankModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg">Settlement Bank Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank"
                        className="w-full px-3 py-2 border rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={e => setAccountHolder(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 border rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        placeholder="e.g. 501002345678"
                        className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={ifsc}
                        onChange={e => setIfsc(e.target.value.toUpperCase())}
                        placeholder="e.g. HDFC0000240"
                        className="w-full px-3 py-2 border rounded-xl text-sm font-mono uppercase"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setBankModal(false)} className="flex-1 py-2 border rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveBankDetails} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Save</button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
};
