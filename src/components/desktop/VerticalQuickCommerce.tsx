import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Plus, Minus, Clock, ShoppingCart, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const VerticalQuickCommerce: React.FC = () => {
  const { cart, addToCart, updateQuantity, navigateTo } = useApp();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [selectedCatId, setSelectedCatId] = useState<string>('q-fruits');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Filter 10-Min quick commerce items
  const quickProducts = products.filter(p => p.vertical === 'quick');
  const quickCategories = categories.filter(c => c.vertical === 'quick');
  const activeProducts = quickProducts.filter(p => !p.category || p.category === selectedCatId);

  // Cart matching helper
  const getCartQty = (id: string) => {
    const item = cart.find(i => i.product.id === id);
    return item ? item.quantity : 0;
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const activeCartItems = cart.filter(i => i.product.vertical === 'quick');
  const activeCartCount = activeCartItems.reduce((acc, i) => acc + i.quantity, 0);
  const activeCartTotal = activeCartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  return (
    <div className="w-full flex flex-col min-h-screen bg-brand-bg text-brand-graphite relative select-none font-sans">
      {/* Promo banner strip */}
      <div className="bg-gradient-to-r from-brand-green to-brand-blue text-white px-12 py-3.5 flex justify-between items-center text-xs font-bold shadow-soft select-none font-heading">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-white animate-pulse" />
          <span>FAST 10 MINUTE DELIVERY — Groceries, fresh fruits & items at your doorstep!</span>
        </div>
        <div className="flex items-center gap-1 hover:underline cursor-pointer" onClick={() => navigateTo('search')}>
          <span>Explore Catalog</span>
          <ArrowRight size={14} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-12 py-8 flex gap-6">
        {/* Left Column: Vertical Category Navigation Menu (Stripe/Blinkit style) */}
        <aside className="w-[240px] flex flex-col bg-white border border-brand-border rounded-card shadow-premium shrink-0 h-fit sticky top-[130px]">
          <span className="p-4 border-b border-brand-border font-extrabold text-xs uppercase tracking-wider text-brand-green font-heading">
            Categories
          </span>
          <div className="flex flex-col py-2 max-h-[500px] overflow-y-auto no-scrollbar">
            {quickCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`flex items-center gap-3.5 px-4.5 py-3.5 text-left transition-all border-l-4 font-bold text-xs ${
                  selectedCatId === cat.id
                    ? 'bg-green-50/20 text-brand-green border-brand-green font-extrabold'
                    : 'border-transparent hover:bg-slate-50/50 text-brand-slate hover:text-brand-graphite'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center border border-brand-border">
                  <img src={cat.image ?? ''} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-heading">{cat.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Column: Grid and Products */}
        <main className="flex-1 flex flex-col gap-6 text-left">
          {/* Active Category Header */}
          <div className="flex items-center justify-between border-b border-brand-border pb-3.5">
            <h2 className="text-base font-extrabold text-brand-graphite flex items-center gap-2.5 font-heading uppercase tracking-wide">
              <span>{quickCategories.find(c => c.id === selectedCatId)?.name}</span>
              <span className="text-xs text-brand-slate font-bold font-numbers">({activeProducts.length} items)</span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-brand-green bg-[#ECFDF5] px-4 py-1.5 rounded-full font-black border border-brand-green/10 shadow-soft">
              <Clock size={13} />
              <span>10 Min Delivery</span>
            </div>
          </div>

          {/* Product Grid with design system cards (20px curves) */}
          <div className="grid grid-cols-4 gap-4.5">
            {activeProducts.map(product => {
              const qty = getCartQty(product.id);
              const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              const isWishlisted = wishlist[product.id];

              return (
                <div
                  key={product.id}
                  className="bg-white border border-brand-border rounded-card p-4.5 flex flex-col relative hover:shadow-hover-lift hover:-translate-y-1 transition-all duration-350 group h-full cursor-pointer"
                  onClick={() => navigateTo('detail', product.id)}
                >
                  {/* Wishlist Button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => toggleWishlist(product.id, e)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-zinc-400 hover:text-brand-red shadow-soft border border-brand-border/40 transition-colors z-10"
                  >
                    <Heart size={12} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
                  </motion.button>

                  {/* Discount tag overlay */}
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-[#ECFDF5] border border-brand-green/10 text-brand-green text-[9px] font-black px-2 py-0.5 rounded shadow-soft z-10 font-numbers uppercase tracking-wider">
                      {discount}% OFF
                    </span>
                  )}

                  {/* Image container */}
                  <div className="w-full aspect-square flex items-center justify-center mb-4 bg-brand-elevated rounded-card border border-brand-border/40 p-2 overflow-hidden shadow-soft">
                    <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  </div>

                  {/* Time badge */}
                  <div className="flex items-center gap-1 text-[9.5px] text-brand-green font-extrabold bg-[#ECFDF5] border border-brand-green/10 rounded-sm w-max px-2 py-0.5 mb-2.5 shadow-soft leading-none">
                    <Clock size={10} className="text-brand-green" />
                    <span>{product.deliveryTime}</span>
                  </div>

                  {/* Title & info */}
                  <h3 className="text-xs font-bold text-brand-graphite line-clamp-2 leading-relaxed mb-1 min-h-[36px] group-hover:text-brand-green transition-colors font-heading">
                    {product.title}
                  </h3>
                  <div className="text-[10px] text-brand-slate font-extrabold mb-3">
                    {product.specs?.['Weight'] || product.specs?.['Volume'] || 'Pack'}
                  </div>

                  {/* Price & Add to Cart row */}
                  <div className="flex items-center justify-between mt-auto font-numbers" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col leading-none">
                      <span className="text-sm font-extrabold text-brand-graphite">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-brand-slate line-through mt-0.5">₹{product.originalPrice}</span>
                      )}
                    </div>

                    {qty === 0 ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(product)}
                        className="px-5 py-1.5 border border-brand-green/20 hover:border-brand-green bg-[#ECFDF5] text-brand-green text-xs font-black rounded-button hover:bg-brand-green/10 transition-colors uppercase tracking-wider shadow-soft select-none"
                      >
                        Add
                      </motion.button>
                    ) : (
                      <div className="flex items-center border border-brand-green bg-brand-green text-white rounded-button overflow-hidden text-xs font-bold shadow-soft">
                        <button
                          onClick={() => updateQuantity(product.id, qty - 1)}
                          className="px-2 py-1.5 hover:bg-emerald-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} strokeWidth={3} />
                        </button>
                        <span className="px-2.5 min-w-[20px] text-center select-none">{qty}</span>
                        <button
                          onClick={() => updateQuantity(product.id, qty + 1)}
                          className="px-2 py-1.5 hover:bg-emerald-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Floating Bottom Cart Bar for Quick Commerce (Blinkit style) */}
      {activeCartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl bg-brand-green text-white px-5 py-3 rounded-[20px] shadow-hover-lift flex items-center justify-between z-40 transition-transform duration-300 transform translate-y-0 scale-100 hover:bg-emerald-600">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-green-800/20 relative">
              <ShoppingCart size={18} />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange text-[9px] font-black text-white font-numbers">
                {activeCartCount}
              </span>
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="font-extrabold text-sm font-numbers">₹{activeCartTotal.toLocaleString('en-IN')}</span>
              <span className="text-[9.5px] text-green-100 font-extrabold uppercase tracking-widest font-heading">Checkout with Quick Cart</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('cart')}
            className="flex items-center gap-1.5 bg-white text-brand-green px-4.5 py-2 rounded-button text-xs font-black shadow hover:bg-slate-50 transition-colors uppercase tracking-wider"
          >
            <span>View Cart</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
