import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { PageHeader, Badge, PrimaryButton, EmptyState, fieldCls } from '../../components/dashboard/DashboardUI';
import { CreditCard, Trash2, Check, X, Smartphone, Building2, Landmark, QrCode, Undo } from 'lucide-react';
import type { PaymentMethodType } from '../../data/dashboardTypes';

const TYPE_META: Record<PaymentMethodType, { label: string; icon: React.ReactNode }> = {
  UPI: { label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
  CREDIT_CARD: { label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
  DEBIT_CARD: { label: 'Debit Card', icon: <CreditCard className="w-4 h-4" /> },
  NET_BANKING: { label: 'Net Banking', icon: <Landmark className="w-4 h-4" /> },
};

export const PaymentsPage: React.FC = () => {
  const { paymentMethods, transactions, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useCustomer();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PaymentMethodType>('UPI');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const setF = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const base = { isDefault: false };
    try {
    if (type === 'UPI') {
      if (!fields.upiId) return;
      await addPaymentMethod({ ...base, type, upiId: fields.upiId });
    } else if (type === 'NET_BANKING') {
      if (!fields.bankName) return;
      await addPaymentMethod({ ...base, type, bankName: fields.bankName });
    } else {
      if ((fields.cardNumber || '').length < 12) return;
      await addPaymentMethod({ ...base, type, label: fields.cardLabel, last4: fields.cardNumber.slice(-4), cardBrand: fields.brand, expiry: fields.expiry });
    }
    setOpen(false);
    setFields({});
    } catch (err) {
      alert('Failed to save payment method.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Methods" subtitle="Manage your saved payment options" actions={<PrimaryButton onClick={() => setOpen(true)}>+ Add Method</PrimaryButton>} />

      {paymentMethods.length === 0 && <EmptyState icon={<CreditCard className="w-6 h-6" />} title="No payment methods" message="Add a payment method to speed up checkout." />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((m) => (
          <div key={m.id} className={`bg-white border rounded-card shadow-premium p-5 flex flex-col gap-3 ${m.isDefault ? 'border-brand-blue/50 ring-1 ring-brand-blue/10' : 'border-brand-border'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">{TYPE_META[m.type].icon}</div>
                <div>
                  <p className="font-bold text-sm text-brand-graphite">{m.label}</p>
                  <p className="text-[11px] text-brand-slate">{m.type === 'UPI' ? m.upiId : m.type === 'NET_BANKING' ? m.bankName : `•••• ${m.last4}${m.expiry ? ` · ${m.expiry}` : ''}`}</p>
                </div>
              </div>
              {m.isDefault && <Badge tone="green"><Check className="w-3 h-3 inline -mt-0.5 mr-0.5" /> Default</Badge>}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-brand-border/40">
              {!m.isDefault ? (
                <button onClick={() => setDefaultPaymentMethod(m.id)} className="text-[11px] font-bold text-brand-blue hover:underline">Set default</button>
              ) : <span />}
              <button disabled={isDeleting === m.id} onClick={async () => {
                if (confirm('Are you sure you want to remove this payment method?')) {
                  setIsDeleting(m.id);
                  try {
                    await removePaymentMethod(m.id);
                  } catch (err) {
                    alert('Failed to remove payment method.');
                  } finally {
                    setIsDeleting(null);
                  }
                }
              }} aria-label="Remove" className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="bg-white border border-brand-border rounded-card shadow-premium p-5">
        <h3 className="font-extrabold text-sm text-brand-graphite font-heading mb-4">Transaction History</h3>
        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between border-b border-brand-border/40 pb-2.5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'refund' ? 'bg-red-50 text-red-500' : t.type === 'cashback' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-brand-blue'}`}>
                  {t.type === 'refund' ? <Undo className="w-4 h-4" /> : t.type === 'cashback' ? <QrCode className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-graphite capitalize">{t.type} {t.orderNumber ? `· ${t.orderNumber}` : ''}</p>
                  <p className="text-[10px] text-brand-slate">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {t.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-extrabold font-numbers ${t.type === 'refund' ? 'text-red-500' : 'text-brand-graphite'}`}>
                  {t.type === 'refund' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                </p>
                <Badge tone={t.status === 'paid' || t.status === 'refunded' ? 'green' : 'amber'}>{t.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4 pt-16" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-card shadow-elevated max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-brand-graphite font-heading">Add Payment Method</h3>
              <button onClick={() => setOpen(false)} className="text-brand-slate hover:text-brand-graphite"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'] as PaymentMethodType[]).map((t) => (
                <button key={t} type="button" onClick={() => { setType(t); setFields({}); }} className={`px-3 py-2.5 rounded-button text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors ${type === t ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-border bg-slate-50 text-brand-graphite'}`}>
                  {TYPE_META[t].icon} {TYPE_META[t].label}
                </button>
              ))}
            </div>

            {type === 'UPI' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-brand-slate">UPI ID</label>
                <input className={fieldCls} placeholder="yourname@upi" value={fields.upiId || ''} onChange={(e) => setF('upiId', e.target.value)} required />
              </div>
            )}
            {type === 'NET_BANKING' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-brand-slate">Bank Name</label>
                <input className={fieldCls} placeholder="e.g. HDFC Bank" value={fields.bankName || ''} onChange={(e) => setF('bankName', e.target.value)} required />
              </div>
            )}
            {(type === 'CREDIT_CARD' || type === 'DEBIT_CARD') && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-brand-slate">Card Number</label>
                  <input className={fieldCls} inputMode="numeric" placeholder="1234 5678 9012 3456" value={fields.cardNumber || ''} onChange={(e) => setF('cardNumber', e.target.value)} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-brand-slate">Brand</label>
                  <select className={fieldCls} value={fields.brand || 'Visa'} onChange={(e) => setF('brand', e.target.value)}>
                    <option>Visa</option><option>Mastercard</option><option>RuPay</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-brand-slate">Expiry</label>
                  <input className={fieldCls} placeholder="MM/YY" value={fields.expiry || ''} onChange={(e) => setF('expiry', e.target.value)} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} disabled={isSubmitting} className="px-4 py-2 bg-slate-100 rounded-button text-xs font-bold text-brand-slate disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-brand-blue text-white rounded-button text-xs font-bold disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};