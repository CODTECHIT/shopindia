import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader, Badge, statusTone, EmptyState, PrimaryButton, GhostButton } from '../../components/dashboard/DashboardUI';
import { Package, X, Download, RotateCcw, Undo2, ArrowLeftRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../../lib/customerApi';
import type { OrderItem } from '../../context/AppContext';

const STATUS_STEPS: Record<string, string[]> = {
  pending: ['Order Placed', 'Awaiting Confirmation'],
  confirmed: ['Order Placed', 'Order Confirmed'],
  processing: ['Order Placed', 'Order Confirmed', 'Processing'],
  placed: ['Order Placed', 'Order Confirmed', 'Processing'],
  packing: ['Order Placed', 'Order Confirmed', 'Processing', 'Packing'],
  shipped: ['Order Placed', 'Order Confirmed', 'Processing', 'Packing', 'Shipped'],
  in_transit: ['Order Placed', 'Order Confirmed', 'Processing', 'Packing', 'Shipped', 'In Transit'],
  delivered: ['Order Placed', 'Order Confirmed', 'Processing', 'Packing', 'Shipped', 'In Transit', 'Delivered'],
};

export const OrdersPage: React.FC = () => {
  const { orders, cancelOrder, updateOrderStatus } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const openOrder = openId !== null ? orders.find((o) => (o.id || '') === openId) : null;
  const steps = openOrder ? getSteps(openOrder.status) : [];
  const cancelable = openOrder ? ['pending', 'placed', 'confirmed', 'processing', 'packing'].includes(openOrder.status) : false;

  return (
    <div className="space-y-6">
      <PageHeader title="My Orders" subtitle={`${orders.length} order${orders.length === 1 ? '' : 's'} in your account`} />

      {orders.length === 0 && (
        <EmptyState icon={<Package className="w-6 h-6" />} title="No orders yet" message="Once you place an order, it will appear here with live tracking." />
      )}

      <div className="flex flex-col gap-4">
        {orders.map((o) => {
          const isOpen = openId === o.id;
          return (
            <motion.div key={o.id} layout className="bg-white border border-brand-border rounded-card shadow-premium overflow-hidden">
              <button onClick={() => setOpenId(isOpen ? null : o.id)} className="w-full text-left p-5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue flex-shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-brand-graphite">
                        {o.items.map(it => it.product?.title || 'Product').join(', ') || 'Order'}
                      </span>
                      <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                    </div>
                    <p className="text-xs text-brand-slate mt-0.5">
                      Order {o.orderNumber || o.id} • {o.date || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-brand-graphite font-numbers">₹{o.total.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-brand-slate">{o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-brand-slate transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && openOrder && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="border-t border-brand-border/60 bg-slate-50/40 overflow-hidden">
                    <div className="p-5 space-y-5">
                      {/* Tracking timeline */}
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-slate mb-3">Order Tracking</h4>
                        <div className="flex flex-col">
                          {steps.map((s, i) => (
                            <div key={s} className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i < steps.length ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                {i < steps.length - 1 && <div className="w-0.5 h-8 bg-emerald-400" />}
                              </div>
                              <p className={`text-xs font-semibold pt-1 ${i < steps.length ? 'text-brand-graphite' : 'text-brand-slate'}`}>{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Items */}
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-slate mb-3">Items</h4>
                          <div className="flex flex-col gap-3">
                            {openOrder.items.map((it: OrderItem, i: number) => (
                              <div key={i} className="flex items-center gap-3 bg-white border border-brand-border rounded-xl p-2.5">
                                <img src={it.product.image} alt={it.product.title} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-brand-graphite line-clamp-1">{it.product.title}</p>
                                  <p className="text-xs text-brand-slate">Qty {it.quantity}</p>
                                </div>
                                <span className="text-xs font-bold text-brand-graphite font-numbers">₹{(it.product.price * it.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Summary + actions */}
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-slate mb-3">Order Summary</h4>
                          <div className="bg-white border border-brand-border rounded-lg p-4 space-y-2 text-xs text-brand-slate">
                            <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-brand-graphite font-numbers">₹{openOrder.total.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between"><span>Shipping</span><span className="font-bold text-emerald-600">FREE</span></div>
                            <div className="flex justify-between"><span>Tax (incl.)</span><span className="font-bold text-brand-graphite font-numbers">₹{Math.round(openOrder.total * 0.12).toLocaleString('en-IN')}</span></div>
                            <div className="border-t border-brand-border pt-2 flex justify-between items-center">
                              <span className="font-bold text-brand-graphite">Grand Total</span>
                              <span className="font-extrabold text-brand-blue font-numbers">₹{openOrder.total.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <PrimaryButton onClick={() => alert('Invoice downloaded (demo).')} className="inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Invoice</PrimaryButton>
                            {cancelable && (
                              <button 
                                disabled={isProcessing}
                                onClick={async () => { 
                                  if (confirm('Are you sure you want to cancel this order?')) {
                                    setIsProcessing(true);
                                    try {
                                      await cancelOrder(openOrder.id);
                                      trackEvent('ORDER_CANCELLED', { entityId: openOrder.id, entityType: 'order' }); 
                                      alert('Order successfully cancelled.');
                                    } catch (err) {
                                      alert('Failed to cancel order.');
                                    } finally {
                                      setIsProcessing(false);
                                    }
                                  }
                                }} 
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-button text-xs font-bold disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" /> Cancel
                              </button>
                            )}
                            {openOrder.status === 'delivered' && (
                              <>
                                <GhostButton 
                                  disabled={isProcessing}
                                  className="inline-flex items-center gap-1.5 disabled:opacity-50" 
                                  onClick={async () => { 
                                    setIsProcessing(true);
                                    try {
                                      await updateOrderStatus(openOrder.id, 'returned');
                                      trackEvent('RETURN_REQUESTED', { entityId: openOrder.id, entityType: 'order' }); 
                                      alert('Return request submitted.');
                                    } catch (err) {
                                      alert('Failed to submit return request.');
                                    } finally {
                                      setIsProcessing(false);
                                    }
                                  }}
                                >
                                  <Undo2 className="w-3.5 h-3.5" /> Return
                                </GhostButton>
                                <GhostButton 
                                  disabled={isProcessing}
                                  className="inline-flex items-center gap-1.5 disabled:opacity-50" 
                                  onClick={async () => { 
                                    setIsProcessing(true);
                                    try {
                                      await updateOrderStatus(openOrder.id, 'returned');
                                      trackEvent('EXCHANGE_REQUESTED', { entityId: openOrder.id, entityType: 'order' }); 
                                      alert('Exchange request submitted.'); 
                                    } catch (err) {
                                      alert('Failed to submit exchange request.');
                                    } finally {
                                      setIsProcessing(false);
                                    }
                                  }}
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5" /> Exchange
                                </GhostButton>
                              </>
                            )}
                            <GhostButton className="inline-flex items-center gap-1.5" onClick={() => { trackEvent('REORDER', { entityId: openOrder.id, entityType: 'order' }); alert('Items added to cart (demo).'); }}>
                              <RotateCcw className="w-3.5 h-3.5" /> Reorder
                            </GhostButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

function getSteps(status: string): string[] {
  return STATUS_STEPS[status] || ['Order Placed', 'Order Confirmed', 'Processing', 'Shipped'];
}