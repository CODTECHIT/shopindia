import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { PageHeader, PrimaryButton, fieldCls } from '../../components/dashboard/DashboardUI';
import { User, Camera, Mail, Phone, Calendar, CheckCircle2 } from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { profile, updateProfile } = useCustomer();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [dob, setDob] = useState(profile.dob || '');
  const [saved, setSaved] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, email, phone, dob });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile Settings" subtitle="Manage your personal information" />

      <div className="bg-white border border-brand-border rounded-card shadow-premium p-6">
        <div className="flex items-start gap-6 flex-wrap mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full bg-brand-blue/10 border-2 border-brand-blue/10 flex items-center justify-center text-brand-blue text-3xl font-black">
              {(profile.name?.[0] || 'G').toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-700 px-2.5 py-1 rounded-full">
              <span>Upload Photo</span>
              <Camera className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-lg text-brand-graphite font-heading">{profile.name}</h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">Plus Member</span>
            </div>
            <p className="text-xs text-brand-slate">{profile.email}</p>
            <p className="text-xs text-brand-slate mt-1">Member since {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-brand-slate flex items-center gap-1"><User className="w-3 h-3" /> Full Name</label>
            <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-brand-slate flex items-center gap-1"><Mail className="w-3 h-3" /> Email Address</label>
            <input className={fieldCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-brand-slate flex items-center gap-1"><Phone className="w-3 h-3" /> Mobile Number</label>
            <input className={fieldCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-brand-slate flex items-center gap-1"><Calendar className="w-3 h-3" /> Date of Birth</label>
            <input className={fieldCls} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <PrimaryButton disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</PrimaryButton>
            {saved && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Profile updated</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

