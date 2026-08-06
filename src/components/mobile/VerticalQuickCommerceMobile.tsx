import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Plus, Minus, ShoppingBag, Clock, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const VerticalQuickCommerceMobile: React.FC = () => {
  const { cart, addToCart, updateQuantity, navigateTo } = useApp();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [activeCat, setActiveCat] = useState('q-fruits');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const quickProducts = products.filter(p => p.vertical === 'quick');
  const quickCategories = categories.filter(c => c.vertical === 'quick');
  const currentProducts = quickProducts.filter(p => !p.category || p.category === activeCat);

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
    <div className="w-full flex flex-col gap-3 py-3.5 px-3 bg-[#FAF9F6] min-h-screen text-brand-graphite font-sans pb-28">
      {/* 10 Min Header Strip */}
      <div className="w-full py-2 px-3.5 rounded-[16px] bg-[#ECFDF5] text-brand-green flex justify-between items-center text-[10px] font-bold border border-brand-green/10 font-heading">
        <span className="flex items-center gap-1.5">
          <Clock size={12} className="animate-pulse" />
          Delivered in 10 minutes from store
        </span>
        <span className="text-[8px] uppercase tracking-wider bg-brand-green text-white px-2 py-0.5 rounded-full font-black">10 MINS</span>
      </div>

      {/* Horizontal Scroll Categories Tag List */}
      <div className="w-full flex gap-2 overflow-x-auto py-1 no-scrollbar select-none">
        {quickCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-4.5 py-2.5 rounded-full font-bold text-[10px] whitespace-nowrap tracking-wide border transition-all font-heading ${
              activeCat === cat.id
                ? 'bg-brand-green text-white border-brand-green shadow-soft font-black'
                : 'bg-white text-brand-slate border-brand-border hover:text-brand-graphite'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid List (2-column layout) */}
      <div className="grid grid-cols-2 gap-2.5 mt-1 select-none">
        {currentProducts.map(product => {
          const qty = getCartQty(product.id);
          const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          const isWishlisted = wishlist[product.id];

          return (
            <div
              key={product.id}
              onClick={() => navigateTo('detail', product.id)}
              className="bg-white border border-brand-border rounded-[20px] p-3 flex flex-col relative h-full cursor-pointer hover:shadow-soft"
            >
              {/* Wishlist Button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => toggleWishlist(product.id, e)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 text-zinc-400 hover:text-brand-red shadow-soft border border-brand-border transition-colors z-10"
              >
                <Heart size={11} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
              </motion.button>

              {/* Discount tag overlay */}
              {discount > 0 && (
                <span className="absolute top-2 left-2 bg-[#ECFDF5] text-brand-green text-[8px] font-black px-1.5 py-0.5 rounded shadow-soft z-10 font-numbers uppercase tracking-wider">
                  {discount}% OFF
                </span>
              )}

              {/* Product Image */}
              <div className="w-full aspect-square flex items-center justify-center mb-2.5 bg-brand-elevated rounded-[20px] overflow-hidden p-1.5 shadow-soft border border-brand-border/40">
                <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain rounded" />
              </div>

              {/* Title & Info */}
              <h3 className="text-[10px] font-bold text-brand-graphite line-clamp-2 leading-snug mb-0.5 min-h-[30px] font-heading">
                {product.title}
              </h3>
              <span className="text-[9px] text-brand-slate font-extrabold mb-3.5">
                {product.specs?.['Weight'] || product.specs?.['Volume'] || 'Pack'}
              </span>

              {/* Price & Quantity Actions Row */}
              <div className="flex items-center justify-between mt-auto font-numbers" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-extrabold text-brand-graphite">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-[9px] text-brand-slate line-through mt-0.5">₹{product.originalPrice}</span>
                  )}
                </div>

                {qty === 0 ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    className="px-3.5 py-1.5 border border-brand-green/20 bg-[#ECFDF5] text-brand-green text-[10px] font-black rounded-button uppercase shadow-soft transition-colors"
                  >
                    Add
                  </motion.button>
                ) : (
                  <div className="flex items-center border border-brand-green bg-brand-green text-white rounded-button overflow-hidden text-[10px] font-extrabold shadow-soft">
                    <button
                      onClick={() => updateQuantity(product.id, qty - 1)}
                      className="px-1.5 py-1.5 hover:bg-emerald-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={10} strokeWidth={3} />
                    </button>
                    <span className="px-2 min-w-[15px] text-center select-none">{qty}</span>
                    <button
                      onClick={() => updateQuantity(product.id, qty + 1)}
                      className="px-1.5 py-1.5 hover:bg-emerald-700 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Cart Bar for Quick Commerce (Blinkit style on Mobile) */}
      {activeCartCount > 0 && (
        <div className="fixed bottom-16 left-3 right-3 bg-brand-green text-white px-4 py-2.5 rounded-[20px] shadow-hover-lift flex items-center justify-between z-40 transition-transform duration-300 hover:bg-emerald-600">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-green-800/40 relative">
              <ShoppingBag size={15} />
              <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-orange text-[8px] font-black text-white font-numbers">
                {activeCartCount}
              </span>
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="font-extrabold text-xs font-numbers">₹{activeCartTotal.toLocaleString('en-IN')}</span>
              <span className="text-[8px] text-emerald-100 font-extrabold uppercase tracking-widest font-heading">Quick Checkout</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('cart')}
            className="flex items-center gap-1 bg-white text-brand-green px-3.5 py-1.5 rounded-button text-[10px] font-black shadow hover:bg-slate-50 transition-colors uppercase tracking-wider"
          >
            <span>Proceed</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
