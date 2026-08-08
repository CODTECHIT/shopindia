import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { User, MapPin, ShieldCheck, Mail, Phone, Home, Sparkles, LogIn, LogOut, Loader2, LayoutDashboard, Package, Truck, Store, Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CustomerUser } from '../lib/customerAuth';
import { DashboardInner } from './dashboard/DashboardPortal';
import {
  getCustomerToken,
  getCustomerUser,
  loginCustomer,
  registerCustomer,
  setCustomerSession,
  clearCustomerSession,
} from '../lib/customerAuth';

export const ProfilePage: React.FC = () => {
  const { location, setLocation, navigateTo } = useApp();
  const isMobile = useIsMobile();
  const [newAddress, setNewAddress] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const [authUser, setAuthUser] = useState<CustomerUser | null>(() => {
    const u = getCustomerUser();
    return u && getCustomerToken() ? u : null;
  });

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [aName, setAName] = useState('');
  const [aEmail, setAEmail] = useState('');
  const [aPass, setAPass] = useState('');
  const [aError, setAError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAError('');
    setAuthLoading(true);
    try {
      const data = authMode === 'login'
        ? await loginCustomer(aEmail.trim(), aPass)
        : await registerCustomer(aName.trim(), aEmail.trim(), aPass);
      setCustomerSession(data.token, data.user);
      setAuthUser(data.user);
      setAName('');
      setAEmail('');
      setAPass('');
      window.location.hash = '#/dashboard';
      window.location.reload(); // Force contexts to fetch user data
    } catch (err: any) {
      setAError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearCustomerSession();
    setAuthUser(null);
    window.location.reload(); // Force contexts to clear user data
  };

  const renderAuthBar = () => {
    const pad = isMobile ? 'px-4' : 'px-12';
    if (authUser) {
      return (
        <div className={`max-w-7xl mx-auto ${pad} pt-6 text-left`}>
          <div className="bg-white border border-brand-border rounded-card p-6 shadow-premium flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black border border-brand-blue/20">
                <User size={20} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-sm text-brand-graphite font-heading">Signed in as {authUser.name}</span>
                <span className="text-xs text-brand-slate font-bold">{authUser.email}</span>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-brand-graphite text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-2 transition-colors">
              <LogOut size={16} /> Log out
            </motion.button>
          </div>
        </div>
      );
    }
    return (
      <div className={`max-w-7xl mx-auto ${pad} pt-8 pb-4 text-left`}>
        <div className="bg-white border border-brand-border rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row min-h-[360px]">
          {/* Left Side: Gradient Banner */}
          <div className="md:w-2/5 lg:w-1/3 bg-gradient-to-br from-brand-blue to-blue-800 p-8 md:p-10 text-white flex flex-col justify-center relative overflow-hidden">
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
             
             <div className="relative z-10 flex flex-col h-full justify-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-inner">
                   {authMode === 'login' ? <LogIn size={28} className="text-white" /> : <Sparkles size={28} className="text-white" />}
                </div>
                <h2 className="text-3xl font-black font-heading mb-3 leading-tight tracking-tight">
                  {authMode === 'login' ? 'Welcome Back!' : 'Join ShopIndia'}
                </h2>
                <p className="text-blue-50 text-sm font-semibold leading-relaxed max-w-[260px]">
                  {authMode === 'login' 
                    ? 'Sign in to access your saved addresses, track orders, and experience fast checkout.'
                    : 'Create an account for personalized recommendations, faster checkout, and exclusive offers.'}
                </p>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-3/5 lg:w-2/3 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white relative">
             <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5 w-full max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-brand-graphite font-heading">
                    {authMode === 'login' ? 'Secure Login' : 'Create Account'}
                  </h3>
                  <div className="h-px flex-1 bg-slate-100 ml-4"></div>
                </div>

                {authMode === 'register' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-slate uppercase tracking-wider flex items-center gap-1.5"><User size={12}/> Full Name</label>
                    <input value={aName} onChange={(e) => setAName(e.target.value)} placeholder="E.g. Jane Doe" required className="px-4 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-brand-graphite focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-brand-slate uppercase tracking-wider flex items-center gap-1.5"><Mail size={12}/> Email Address</label>
                  <input type="email" value={aEmail} onChange={(e) => setAEmail(e.target.value)} placeholder="you@example.com" required className="px-4 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-brand-graphite focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-brand-slate uppercase tracking-wider flex items-center gap-1.5"><ShieldCheck size={12}/> Password</label>
                  <input type="password" value={aPass} onChange={(e) => setAPass(e.target.value)} placeholder="••••••••" required className="px-4 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-brand-graphite focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400" />
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={authLoading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-brand-blue hover:bg-blue-650 text-white text-sm font-black uppercase tracking-wider rounded-xl shadow-[0_8px_20px_rgb(14,165,233,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 transition-all">
                    {authLoading ? <Loader2 size={18} className="animate-spin" /> : (authMode === 'login' ? <LogIn size={18} /> : <User size={18} />)}
                    {authMode === 'login' ? 'Log In Now' : 'Register Now'}
                  </motion.button>
                  
                  <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAError(''); }}
                    className="text-xs text-brand-slate hover:text-brand-blue font-bold underline transition-colors w-full sm:w-auto text-center">
                    {authMode === 'login' ? "New here? Create account" : 'Already registered? Log in'}
                  </button>
                </div>
                {aError && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 mt-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>{aError}
                  </motion.div>
                )}
             </form>
          </div>
        </div>
      </div>
    );
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress.trim()) {
      setLocation(newAddress);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const renderDesktop = () => {
    return (
      <div className="max-w-7xl mx-auto py-8 px-12 text-left select-none text-brand-graphite font-sans">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2.5 font-heading uppercase tracking-wider">
            <User size={20} className="text-brand-blue" />
            <span>My Profile & Settings</span>
          </h1>
          <button
            onClick={() => navigateTo('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-blue-650 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-soft"
          >
            <LayoutDashboard size={14} /> Open Dashboard
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Account Details (Span 1) */}
          <div className="col-span-1 flex flex-col gap-5 select-none">
            {/* Profile Brief Info */}
            <div className="bg-white border border-brand-border rounded-card p-6 shadow-premium flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-lg font-black mb-3 border border-brand-blue/10">
                {authUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="font-extrabold text-sm text-brand-graphite mb-1.5 font-heading">{authUser?.name || 'User'}</h2>
              <span className="text-[10px] text-brand-slate font-extrabold mb-4">{authUser?.email}</span>
              <div className="flex items-center gap-1 text-[9.5px] text-brand-blue bg-blue-50 border border-brand-blue/10 px-3.5 py-1 rounded-full font-black uppercase tracking-wider select-none leading-none">
                <Sparkles size={11} className="fill-brand-blue text-brand-blue animate-pulse" />
                <span>ShopIndia Plus</span>
              </div>
            </div>

            {/* Verification status details */}
            <div className="bg-white border border-brand-border rounded-card p-6 shadow-premium text-left flex flex-col gap-3">
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                  <ShieldCheck size={16} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-xs text-brand-graphite font-heading">Verified Account</span>
                  <span className="text-[9.5px] text-brand-slate font-bold">100% Secure Shopping</span>
                </div>
              </div>
              <p className="text-[10.5px] text-brand-slate leading-relaxed border-t border-brand-border pt-3 font-semibold">
                Your guest profile is verified with verified delivery addresses. No additional verification needed.
              </p>
            </div>
          </div>

          {/* Right Column: Address and Personal Info Form (Span 2) */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* Personal info form */}
            <div className="bg-white border border-brand-border rounded-card p-6 shadow-premium text-left">
              <span className="text-brand-graphite font-black text-xs uppercase tracking-wider font-heading border-b border-brand-border/10 pb-3 block mb-5">
                Personal Information
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 leading-none">
                  <label className="text-[9.5px] font-black text-brand-slate uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={authUser?.email || ''}
                    className="p-3 border border-brand-border bg-slate-50 rounded-input text-xs font-bold text-brand-slate cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-1.5 leading-none">
                  <label className="text-[9.5px] font-black text-brand-slate uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={12} /> Contact Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Not provided"
                    className="p-3 border border-brand-border bg-slate-50 rounded-input text-xs font-bold text-brand-slate cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Address Details Management Form */}
            <div className="bg-white border border-brand-border rounded-card p-6 shadow-premium text-left">
              <span className="text-brand-graphite font-black text-xs uppercase tracking-wider font-heading border-b border-brand-border/10 pb-3 block mb-5">
                Manage Delivery Addresses
              </span>

              {/* Current Active Address Card */}
              <div className="border border-brand-border bg-slate-50/50 rounded-card p-4.5 mb-6 flex gap-3.5 items-start">
                <Home size={16} className="text-brand-blue shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-xs text-brand-graphite font-heading mb-1">Active Address</span>
                  <span className="text-xs text-brand-slate font-bold">{location}</span>
                </div>
              </div>

              {/* Set new address form (16px inputs) */}
              <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 leading-none">
                  <label htmlFor="p-address" className="text-[9.5px] font-black text-brand-slate uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} /> Enter New Address details
                  </label>
                  <textarea
                    id="p-address"
                    rows={3}
                    placeholder="Enter house no, street name, layout name, city, postal code..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="p-3 border border-brand-border bg-slate-50/50 rounded-input text-xs font-bold focus:outline-none focus:border-brand-blue text-brand-graphite"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  {isSaved && (
                    <span className="text-xs font-bold text-brand-green">
                      ✓ Active address updated successfully!
                    </span>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-6 py-2.5 bg-brand-blue hover:bg-blue-650 text-white font-extrabold text-xs rounded-button uppercase tracking-wider shadow-soft ml-auto"
                  >
                    Save Address
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMobile = () => {
    return (
      <div className="w-full flex flex-col bg-[#FAF9F6] min-h-screen text-left pb-20 select-none text-brand-graphite font-sans">
        <div className="px-4 py-3.5 sticky top-12 z-30 bg-white border-b border-brand-border flex items-center justify-between">
          <span className="font-extrabold text-xs uppercase tracking-wider font-heading">My Profile</span>
          <button onClick={() => navigateTo('dashboard')} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white rounded-full text-[10px] font-black uppercase tracking-wider">
            <LayoutDashboard size={12} /> Dashboard
          </button>
        </div>

        <div className="p-3 flex flex-col gap-3">
          {/* Profile overview */}
          <div className="bg-white border border-brand-border rounded-[20px] p-5 flex flex-col items-center text-center shadow-soft">
            <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-base font-black mb-2 border border-brand-blue/10">
              {authUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="font-extrabold text-xs text-brand-graphite font-heading">{authUser?.name || 'User'}</h2>
            <span className="text-[9.5px] text-brand-slate font-bold mb-3.5">{authUser?.email}</span>
            <div className="flex items-center gap-1 text-[8.5px] text-brand-blue bg-blue-50 border border-brand-blue/10 px-3 py-0.5 rounded-full font-black uppercase tracking-wider">
              <Sparkles size={10} className="fill-brand-blue text-brand-blue" />
              <span>Plus Customer</span>
            </div>
          </div>

          {/* Details input form */}
          <div className="bg-white border border-brand-border rounded-[20px] p-4 shadow-soft flex flex-col gap-3 text-left">
            <span className="text-[9px] uppercase font-black tracking-widest text-brand-slate font-heading border-b border-brand-border/10 pb-2 mb-1">
              Account Data
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[8.5px] font-black text-brand-slate uppercase tracking-wider">Email ID</span>
              <span className="text-xs font-bold text-brand-graphite bg-slate-50 border border-brand-border p-2.5 rounded-input">{authUser?.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8.5px] font-black text-brand-slate uppercase tracking-wider">Contact No</span>
              <span className="text-xs font-bold text-brand-graphite bg-slate-50 border border-brand-border p-2.5 rounded-input">Not provided</span>
            </div>
          </div>

          {/* Address manager */}
          <div className="bg-white border border-brand-border rounded-[20px] p-4 shadow-soft text-left flex flex-col gap-3">
            <span className="text-[9px] uppercase font-black tracking-widest text-brand-slate font-heading border-b border-brand-border/10 pb-2 mb-1">
              Delivery Addresses
            </span>
            <div className="p-3 bg-slate-50/50 rounded-[20px] border border-brand-border flex gap-2.5 items-start">
              <Home size={14} className="text-brand-blue shrink-0 mt-0.5" />
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-[10px] text-brand-graphite font-heading">Deliver To:</span>
                <span className="text-[10px] text-brand-slate font-bold mt-0.5">{location}</span>
              </div>
            </div>

            {/* Set address */}
            <form onSubmit={handleSaveAddress} className="flex flex-col gap-2.5 mt-2">
              <span className="text-[8.5px] font-black text-brand-slate uppercase tracking-wider">Enter New Details</span>
              <textarea
                rows={2}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="House no, street name, layout, city..."
                className="p-3 border border-brand-border rounded-input text-xs font-bold bg-slate-50/50 text-brand-graphite focus:outline-none focus:border-brand-blue"
              />
              <div className="flex items-center justify-between">
                {isSaved && <span className="text-[9px] font-bold text-brand-green">✓ Saved</span>}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-5 py-2.5 bg-brand-blue text-white rounded-button text-[10px] font-black uppercase tracking-wider shadow ml-auto"
                >
                  Save Address
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (authUser) {
    return <DashboardInner initialTab="profile" />;
  }

  return (
    <>
      {renderAuthBar()}
    </>
  );
};
