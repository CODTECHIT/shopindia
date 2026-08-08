import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../../context/CustomerContext';
import { useApp } from '../../context/AppContext';
import { X, MapPin, CreditCard, ChevronRight, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({ isOpen, onClose, subtotal, discount, delivery, total }) => {
  const { addresses, paymentMethods } = useCustomer();
  const { cart, placeOrder } = useApp();
  
  const [selectedAddress, setSelectedAddress] = useState(addresses.find(a => a.isDefault)?.id || addresses[0]?.id || '');
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods.find(p => p.isDefault)?.id || paymentMethods[0]?.id || 'COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If new addresses/payments are added, auto-select them if none selected
  React.useEffect(() => {
    if (!selectedAddress && addresses.length) setSelectedAddress(addresses.find(a => a.isDefault)?.id || addresses[0].id);
    if (!selectedPayment && paymentMethods.length) setSelectedPayment(paymentMethods.find(p => p.isDefault)?.id || paymentMethods[0].id);
  }, [addresses, paymentMethods, selectedAddress, selectedPayment]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return alert('Please select a delivery address');
    if (!selectedPayment) return alert('Please select a payment method');

    setIsSubmitting(true);
    const payload = {
      addressId: selectedAddress,
      paymentMethodId: selectedPayment,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      total
    };

    try {
      await placeOrder(payload);
      // AppContext will clear cart and navigate to orders
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-elevated z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-brand-border">
              <h2 className="font-extrabold text-brand-graphite text-lg font-heading tracking-tight">Checkout</h2>
              <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-4 h-4 text-brand-graphite" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Delivery Address */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-slate font-heading">1. Delivery Address</h3>
                  <button onClick={() => window.location.hash = '#/account?tab=addresses'} className="text-[10px] font-bold text-brand-blue hover:underline">Add New</button>
                </div>
                
                {addresses.length === 0 ? (
                  <div className="bg-white border border-dashed border-brand-border rounded-xl p-4 text-center">
                    <p className="text-xs text-brand-slate font-semibold mb-2">No saved addresses found.</p>
                    <button onClick={() => window.location.hash = '#/account?tab=addresses'} className="px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-button text-xs font-bold">Add Delivery Address</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-brand-blue bg-blue-50/50' : 'border-brand-border bg-white hover:border-brand-border/80'}`}>
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddress === addr.id ? 'border-brand-blue' : 'border-slate-300'}`}>
                          {selectedAddress === addr.id && <div className="w-2 h-2 rounded-full bg-brand-blue" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-graphite text-xs">{addr.label || 'Home'}</span>
                            <span className="text-[10px] text-brand-slate font-bold font-numbers">{addr.phone}</span>
                          </div>
                          <p className="text-[11px] text-brand-slate mt-0.5 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-slate font-heading">2. Payment Method</h3>
                  <button onClick={() => window.location.hash = '#/account?tab=payments'} className="text-[10px] font-bold text-brand-blue hover:underline">Manage</button>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="flex flex-col gap-2">
                     <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedPayment === 'COD' ? 'border-brand-blue bg-blue-50/50' : 'border-brand-border bg-white hover:border-brand-border/80'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPayment === 'COD' ? 'border-brand-blue' : 'border-slate-300'}`}>
                          {selectedPayment === 'COD' && <div className="w-2 h-2 rounded-full bg-brand-blue" />}
                        </div>
                        <div className="w-4 h-4 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-[8px] font-black font-numbers">₹</div>
                        <span className="font-bold text-brand-graphite text-xs">Cash on Delivery (COD)</span>
                      </div>
                    </label>
                    <div className="bg-white border border-dashed border-brand-border rounded-xl p-4 text-center mt-2">
                      <p className="text-[11px] text-brand-slate font-semibold mb-2">No saved payment methods.</p>
                      <button onClick={() => window.location.hash = '#/account?tab=payments'} className="px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-button text-[10px] font-bold">Add Payment Method</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {paymentMethods.map(pm => (
                      <label key={pm.id} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedPayment === pm.id ? 'border-brand-blue bg-blue-50/50' : 'border-brand-border bg-white hover:border-brand-border/80'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPayment === pm.id ? 'border-brand-blue' : 'border-slate-300'}`}>
                            {selectedPayment === pm.id && <div className="w-2 h-2 rounded-full bg-brand-blue" />}
                          </div>
                          <CreditCard className="w-4 h-4 text-brand-slate" />
                          <span className="font-bold text-brand-graphite text-xs">{pm.label}</span>
                        </div>
                      </label>
                    ))}
                    {/* Always offer COD */}
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedPayment === 'COD' ? 'border-brand-blue bg-blue-50/50' : 'border-brand-border bg-white hover:border-brand-border/80'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPayment === 'COD' ? 'border-brand-blue' : 'border-slate-300'}`}>
                          {selectedPayment === 'COD' && <div className="w-2 h-2 rounded-full bg-brand-blue" />}
                        </div>
                        <div className="w-4 h-4 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-[8px] font-black font-numbers">₹</div>
                        <span className="font-bold text-brand-graphite text-xs">Cash on Delivery (COD)</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

            </div>

            {/* Footer Summary */}
            <div className="bg-white border-t border-brand-border p-5 pb-safe">
              <div className="flex flex-col gap-2 mb-4 font-numbers text-xs text-brand-slate font-bold">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="text-brand-graphite">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-green">
                    <span>Discount applied</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-brand-border pb-3">
                  <span>Delivery Charges</span>
                  <span className={delivery === 0 ? 'text-brand-green' : 'text-brand-graphite'}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black text-brand-graphite">
                  <span>Total Payable</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                disabled={isSubmitting || !selectedAddress || (!selectedPayment && selectedPayment !== 'COD')}
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-brand-green hover:bg-emerald-650 text-white rounded-button text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-premium disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>Confirm Order — ₹{total.toLocaleString('en-IN')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="flex gap-2 items-center justify-center text-[10px] text-brand-slate font-extrabold mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                <span>100% Secure Checkout</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
