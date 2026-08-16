import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, navigateTo, clearCart } = useApp();

  const handleCheckout = () => {
    clearCart();
    onClose();
    navigateTo('orders');
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
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-[100] flex flex-col font-sans"
          >
            <div className="flex items-center justify-between p-5 border-b border-brand-border">
              <h2 className="text-lg font-bold text-brand-graphite font-heading">
                Your Cart ({cart.length})
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-brand-slate hover:text-brand-graphite hover:bg-slate-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <span className="text-4xl mb-4">🛒</span>
                  <h3 className="font-bold text-brand-graphite mb-2">Cart is empty</h3>
                  <p className="text-xs text-brand-slate">Add items from the store to see them here.</p>
                </div>
              ) : (
                <motion.div 
                  className="flex flex-col gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {cart.map((item) => (
                    <motion.div 
                      key={item.product.id} 
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      className="flex gap-4 p-3 border border-brand-border rounded-card bg-slate-50/30"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-16 h-16 object-contain bg-white rounded p-1 border border-brand-border"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-brand-graphite line-clamp-1">
                            {item.product.title}
                          </h4>
                          <span className="text-xs font-bold text-brand-graphite mt-1 block">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-white border border-brand-border rounded-full shadow-sm overflow-hidden text-brand-graphite">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 hover:bg-slate-50 transition-colors"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 hover:bg-slate-50 transition-colors"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-brand-slate hover:text-brand-red transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-brand-border bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-brand-slate">Subtotal</span>
                  <span className="text-lg font-black text-brand-graphite">
                    ₹{getCartTotal().toLocaleString('en-IN')}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-brand-orange hover:bg-orange-655 text-white flex items-center justify-center gap-2 rounded-button font-bold text-sm uppercase tracking-wider transition-colors shadow-premium"
                >
                  <span>Checkout Now</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
