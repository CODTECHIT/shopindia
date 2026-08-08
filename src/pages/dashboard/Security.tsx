import React, { useState } from 'react';
import { PageHeader, SectionCard, GhostButton, fieldCls, Badge } from '../../components/dashboard/DashboardUI';
import { ShieldCheck, KeyRound, Smartphone, Laptop, Trash2, Check } from 'lucide-react';

const SESSIONS = [
  { id: 's1', device: 'iPhone 15 Pro · Safari', location: 'Bengaluru, IN', active: true, lastActive: 'Now' },
  { id: 's2', device: 'Windows · Chrome', location: 'Mumbai, IN', active: false, lastActive: '2 days ago' },
];

export const SecurityPage: React.FC = () => {
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [twoFAMode, setTwoFAMode] = useState('app');
  const [msg, setMsg] = useState<string | null>(null);

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirm) { setMsg('Passwords do not match.'); return; }
    setMsg('Password changed successfully.');
    setCur(''); setPw(''); setConfirm('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Security" subtitle="Protect your account and devices" />

      {/* Change password */}
      <SectionCard title="Change Password" subtitle="Use a strong password you don't use elsewhere">
        <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-brand-slate">Current Password</label>
            <input type="password" className={fieldCls} value={cur} onChange={(e) => setCur(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-brand-slate">New Password</label>
            <input type="password" className={fieldCls} value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-brand-slate">Confirm New</label>
            <input type="password" className={fieldCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <div className="md:col-span-3 flex items-center gap-3">
            <button type="submit" className="px-5 py-2.5 bg-brand-blue text-white rounded-button text-xs font-bold inline-flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> Update Password</button>
            {msg && <span className={`text-xs font-bold ${msg.includes('match') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</span>}
          </div>
        </form>
      </SectionCard>

      {/* Two-factor auth */}
      <SectionCard title="Two-Factor Authentication (2FA)" subtitle="Add an extra layer of security to your account">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-brand-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-brand-graphite">Authenticator App / SMS</p>
                <p className="text-[10px] text-brand-slate">{twoFA ? 'Enabled — require a code on sign-in' : 'Currently disabled'}</p>
              </div>
            </div>
            <button onClick={() => setTwoFA(!twoFA)} aria-label="Toggle 2FA" className={`w-11 h-6 rounded-full relative transition-colors ${twoFA ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${twoFA ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          {twoFA && (
            <div className="flex gap-2">
              {['app', 'sms', 'email'].map((m) => (
                <button key={m} onClick={() => setTwoFAMode(m)} className={`px-3 py-1.5 rounded-button text-xs font-bold border capitalize ${twoFAMode === m ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-border bg-slate-50 text-brand-graphite'}`}>{m === 'app' ? 'Authenticator' : m}</button>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard title="Login Sessions" subtitle="Devices currently signed in to your account" action={<GhostButton className="text-[11px]">Sign out all</GhostButton>}>
        <div className="space-y-2.5">
          {SESSIONS.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 border border-brand-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-brand-slate flex items-center justify-center">{s.device.includes('Windows') ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}</div>
                <div>
                  <p className="text-xs font-bold text-brand-graphite">{s.device}</p>
                  <p className="text-[10px] text-brand-slate">{s.location} · {s.lastActive}</p>
                </div>
              </div>
              <Badge tone={s.active ? 'green' : 'slate'}>{s.active ? <Check className="w-3 h-3 inline -mt-0.5 mr-0.5" /> : ''}{s.active ? 'Active' : 'Inactive'}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Delete account */}
      <SectionCard title="Danger Zone" subtitle="Irreversible actions on your account">
        <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-xs font-bold text-red-700">Delete My Account</p>
              <p className="text-[10px] text-red-500">This removes all your data permanently.</p>
            </div>
          </div>
          <button onClick={() => { if (window.confirm('Are you sure? This cannot be undone.')) alert('Account deletion requested (demo).'); }} className="px-4 py-2 bg-red-600 text-white rounded-button text-xs font-bold">Delete Account</button>
        </div>
      </SectionCard>
    </div>
  );
};