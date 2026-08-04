import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Store, Eye, EyeOff, Loader2 } from 'lucide-react';

export const VendorLogin: React.FC = () => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('vendor@demo.in');
  const [password, setPassword] = useState('Vendor@1234');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    try {
      if (isRegister) {
        // FR-02.1 Vendor registration
        const res = await api.post<any>('/api/vendor/auth/register', {
          name, email, phone, password, businessName, gstNumber, panNumber
        });
        setSuccess(res.message || 'Registration submitted! Please wait for admin approval.');
        setIsRegister(false);
      } else {
        // Vendor Login
        const res = await api.post<{ token: string; user: any }>('/api/vendor/auth/login', { email, password });
        login(res.token, res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 text-white">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">ShopIndia Vendor Portal</h1>
          <p className="text-white/80 text-sm mt-1">Multi-Vendor Partner Dashboard (MOD-02)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isRegister ? 'Register Business' : 'Vendor Sign In'}
            </h2>
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
              className="text-xs font-semibold text-[#10B981] hover:underline"
            >
              {isRegister ? 'Already registered? Sign In' : 'New Vendor? Apply Now'}
            </button>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Business / Trade Name *</label>
                  <input required value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Apex Electronics Ltd" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">GSTIN</label>
                    <input value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="Optional" className="w-full px-3 py-2 border rounded-xl text-xs uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number</label>
                    <input value={panNumber} onChange={e => setPanNumber(e.target.value)} placeholder="Optional" className="w-full px-3 py-2 border rounded-xl text-xs uppercase" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#10B981] text-white rounded-xl font-semibold text-sm hover:bg-[#059669] flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegister ? 'Submit Application' : 'Vendor Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
