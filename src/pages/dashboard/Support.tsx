import React, { useState } from 'react';
import { PageHeader, PrimaryButton, fieldCls, Badge } from '../../components/dashboard/DashboardUI';
import { MessageSquare, Mail, Phone, ChevronDown, LifeBuoy } from 'lucide-react';

const FAQS = [
  { q: 'How do I track my order?', a: 'Head to My Orders in your dashboard. Each order has a live tracking timeline, or use the tracking link in your confirmation email.' },
  { q: 'What is your return policy?', a: 'You can request a return at My Orders for delivered items within 7 days. Refunds are processed to the original payment method in 5–7 business days.' },
  { q: 'How do I apply a coupon?', a: 'Add a coupon code at cart checkout. Active coupons are listed under Coupons & Rewards.' },
  { q: 'Can I change my delivery address after ordering?', a: 'Yes — before your order ships. Contact support from this page and we will update it for you.' },
];

const INITIAL_CHAT = [
  { from: 'agent', text: 'Hi! 👋 Welcome to ShopIndia Support. How can we help you today?' },
];

export const SupportCenterPage: React.FC = () => {
  const [ticket, setTicket] = useState({ subject: '', category: 'Order Issue', priority: 'medium', message: '' });
  const [tickets, setTickets] = useState<{ id: string; subject: string; status: string; date: string; category: string }[]>([]);
  const [chat, setChat] = useState<{ from: string; text: string }[]>(INITIAL_CHAT);
  const [msg, setMsg] = useState('');
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  const submitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTickets((prev) => [{ id: 'TKT' + Math.floor(1000 + Math.random() * 9000), subject: ticket.subject, status: 'Open', date: new Date().toLocaleDateString('en-IN'), category: ticket.category }, ...prev]);
    setTicket({ subject: '', category: 'Order Issue', message: '', priority: 'medium' });
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setChat((c) => [...c, { from: 'me', text: msg }]);
    setMsg('');
    setTimeout(() => {
      setChat((c) => [...c, { from: 'agent', text: 'Thanks for the message! A support specialist will get back to you shortly.' }]);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Support Center" subtitle="We're here to help" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <MessageSquare className="w-5 h-5" />, label: 'Live Chat', color: 'bg-brand-blue/10 text-brand-blue' },
          { icon: <Mail className="w-5 h-5" />, label: 'Email', color: 'bg-emerald-50 text-emerald-600' },
          { icon: <Phone className="w-5 h-5" />, label: 'Call Us', color: 'bg-amber-50 text-amber-600' },
          { icon: <LifeBuoy className="w-5 h-5" />, label: '24/7 Support', color: 'bg-purple-50 text-purple-600' },
        ].map((c, i) => (
          <button key={i} className="bg-white border border-brand-border rounded-card shadow-premium p-5 flex flex-col items-center gap-2.5 hover:shadow-elevated hover:-translate-y-0.5 transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>{c.icon}</div>
            <span className="text-xs font-bold text-brand-graphite">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raise ticket */}
        <div className="bg-white border border-brand-border rounded shadow-premium p-5">
          <h3 className="font-extrabold text-sm text-brand-graphite font-heading mb-4">Raise a Support Ticket</h3>
          <form onSubmit={submitTicket} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-brand-slate">Subject</label>
              <input className={fieldCls} value={ticket.subject} onChange={(e) => setTicket((t) => ({ ...t, subject: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-brand-slate">Category</label>
                <select className={fieldCls} value={ticket.category} onChange={(e) => setTicket((t) => ({ ...t, category: e.target.value }))}>
                  {['Order Issue', 'Payment', 'Refund', 'Product', 'Delivery', 'Other'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-brand-slate">Priority</label>
                <select className={fieldCls} value={ticket.priority} onChange={(e) => setTicket((t) => ({ ...t, priority: e.target.value }))}>
                  {['low', 'medium', 'high', 'urgent'].map((c) => <option key={c} className="capitalize">{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-brand-slate">Describe your issue</label>
              <textarea className={`${fieldCls} min-h-[80px]`} value={ticket.message} onChange={(e) => setTicket((t) => ({ ...t, message: e.target.value }))} required />
            </div>
            <PrimaryButton>Submit Ticket</PrimaryButton>
          </form>

          {tickets.length > 0 && (
            <div className="mt-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-slate mb-2">My Tickets</h4>
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-3 py-2.5 border border-brand-border rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-brand-graphite">{t.subject}</p>
                      <p className="text-[10px] text-brand-slate">{t.id} · {t.category} · {t.date}</p>
                    </div>
                    <Badge tone="blue">{t.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live chat */}
        <div className="bg-white border border-brand-border rounded-card shadow-premium flex flex-col overflow-hidden">
          <div className="bg-[#0F2C59] text-white px-5 py-3.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
            <div>
              <p className="text-xs font-bold">Live Chat Support</p>
              <p className="text-[10px] text-white/60">Typically replies in a few minutes</p>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-3 min-h-[220px] max-h-72 overflow-y-auto bg-slate-50/40">
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs font-medium leading-relaxed ${m.from === 'me' ? 'bg-brand-blue text-white' : 'bg-white border border-brand-border text-brand-graphite'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="p-3 border-t border-brand-border flex gap-2">
            <input className="flex-1 px-3 py-2 border border-brand-border bg-slate-50 rounded-full text-xs font-bold focus:outline-none focus:border-brand-blue" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type a message..." />
            <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-full text-xs font-bold">Send</button>
          </form>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-brand-border rounded-card shadow-premium p-5">
        <h3 className="font-extrabold text-sm text-brand-graphite font-heading mb-4">Frequently Asked Questions</h3>
        <div className="divide-y divide-brand-border/40">
          {FAQS.map((f) => (
            <div key={f.q}>
              <button onClick={() => setFaqOpen(faqOpen === f.q ? null : f.q)} className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-xs font-bold text-brand-graphite">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-brand-slate transition-transform ${faqOpen === f.q ? 'rotate-180' : ''}`} />
              </button>
              {faqOpen === f.q && <p className="pb-3 text-xs text-brand-slate leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};