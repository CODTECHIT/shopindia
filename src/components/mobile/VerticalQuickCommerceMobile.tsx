import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Plus, Minus, ShoppingBag, Clock, ArrowRight, Heart, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

export const VerticalQuickCommerceMobile: React.FC = () => {
  const { cart, addToCart, updateQuantity, navigateTo } = useApp();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [activeCat, setActiveCat] = useState('');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ banners: any[] }>('/api/banners')
      .then(d => setBanners(d.banners.filter((b: any) => b.vertical === 'quick')))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const quickProducts = products.filter(p => p.vertical === 'quick');
  const quickCategories = categories.filter(c => c.vertical === 'quick');
  const currentProducts = !activeCat 
    ? quickProducts 
    : quickProducts.filter(p => p.category === activeCat);

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
      <div className="w-full py-2 px-3.5 rounded-[16px] bg-[#ECFDF5] text-brand-green flex justify-between items-center text-xs font-bold border border-brand-green/10 font-heading">
        <span className="flex items-center gap-1.5">
          <Clock size={12} className="animate-pulse" />
          Delivered in 10 minutes from store
        </span>
        <span className="text-xs uppercase tracking-wider bg-brand-green text-white px-2 py-0.5 rounded-full font-black">10 MINS</span>
      </div>

      {/* Hero Banner Carousel */}
      <div className="w-full aspect-[2/1] rounded-[24px] overflow-hidden shadow-soft relative bg-zinc-950 mt-1 mb-2">
        {banners.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
                onClick={() => navigateTo('search')}
              >
                <img src={banners[currentSlide].image} alt={banners[currentSlide].title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-center px-6 text-white text-left select-none drop-shadow-md">
                  <span className="text-[7.5px] bg-brand-green text-white font-black px-2 py-0.5 rounded w-max uppercase tracking-wider mb-2 shadow-soft">
                    10-Min Delivery
                  </span>
                  <h3 className="text-xs font-black line-clamp-1 font-heading uppercase tracking-wide leading-tight drop-shadow">
                    {banners[currentSlide].title}
                  </h3>
                  <p className="text-xs opacity-90 line-clamp-1 text-zinc-300 font-semibold mt-1">
                    {banners[currentSlide].subtitle}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {banners.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-4 bg-brand-green' : 'w-1 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-[#FAF9F6] border border-brand-border">
            <span className="text-xs font-bold">Loading...</span>
          </div>
        )}
      </div>

      {/* Category Grid */}
      <div className="w-full grid grid-cols-5 gap-y-3 gap-x-2 py-2 select-none justify-items-center">
        {/* 'All' Option */}
        <button
          onClick={() => setActiveCat('')}
          className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition-all ${
            activeCat === ''
              ? 'bg-[#ECFDF5] border-brand-green shadow-soft'
              : 'bg-white border-brand-border hover:border-brand-green/30'
          }`}
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-full overflow-hidden bg-brand-elevated border border-black/5 shadow-sm">
            <LayoutGrid size={20} className={activeCat === '' ? "text-brand-green" : "text-brand-slate/60"} />
          </div>
          <span className={`text-center text-xs leading-tight font-heading ${
            activeCat === '' ? 'font-black text-brand-green' : 'font-bold text-brand-slate'
          }`}>
            All
          </span>
        </button>

        {quickCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition-all w-16 ${
              activeCat === cat.id
                ? 'bg-[#ECFDF5] border-brand-green shadow-soft'
                : 'bg-white border-brand-border hover:border-brand-green/30'
            }`}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-elevated border border-black/5 shadow-sm">
              <img src={cat.image || undefined} alt={cat.name} className="w-full h-full object-cover" fetchPriority="high" />
            </div>
            <span className={`text-center text-xs leading-tight font-heading ${
              activeCat === cat.id ? 'font-black text-brand-green' : 'font-bold text-brand-slate'
            }`}>
              {cat.name}
            </span>
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
              className="bg-white border border-brand-border/80 rounded-[16px] p-2.5 flex flex-col relative h-full cursor-pointer hover:shadow-soft shadow-sm active:scale-[0.98] transition-transform"
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
                <span className="absolute top-2 left-2 bg-[#ECFDF5] text-brand-green text-xs font-black px-1.5 py-0.5 rounded shadow-soft z-10 font-numbers uppercase tracking-wider">
                  {discount}% OFF
                </span>
              )}

              {/* Product Image */}
              <div className="w-full aspect-[5/4] flex items-center justify-center mb-2 bg-white rounded-[16px] overflow-hidden p-1 shadow-sm border border-brand-border/60">
                <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain rounded" loading="lazy" decoding="async" />
              </div>

              {/* Title & Info */}
              <h3 className="text-xs font-bold text-brand-graphite line-clamp-2 leading-snug mb-0.5 min-h-[30px] font-heading">
                {product.title}
              </h3>
              <span className="text-xs text-brand-slate font-extrabold mb-3.5">
                {product.specs?.['Weight'] || product.specs?.['Volume'] || 'Pack'}
              </span>

              {/* Price & Quantity Actions Row */}
              <div className="flex items-center justify-between mt-auto font-numbers" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-extrabold text-brand-graphite">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-brand-slate line-through mt-0.5">₹{product.originalPrice}</span>
                  )}
                </div>

                {qty === 0 ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    className="px-3.5 py-1.5 border border-brand-green/20 bg-[#ECFDF5] text-brand-green text-xs font-black rounded-button uppercase shadow-soft transition-colors"
                  >
                    Add
                  </motion.button>
                ) : (
                  <div className="flex items-center border border-brand-green bg-brand-green text-white rounded-button overflow-hidden text-xs font-extrabold shadow-soft">
                    <button
                      onClick={() => updateQuantity(product.id, qty - 1)}
                      className="px-1.5 py-1.5 hover:bg-emerald-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={10} strokeWidth={3} />
                    </button>
                    <span className="px-2 min-w-full max-w-[15px] text-center select-none">{qty}</span>
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
              <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-orange text-xs font-black text-white font-numbers">
                {activeCartCount}
              </span>
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="font-extrabold text-xs font-numbers">₹{activeCartTotal.toLocaleString('en-IN')}</span>
              <span className="text-xs text-emerald-100 font-extrabold uppercase tracking-widest font-heading">Quick Checkout</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('cart')}
            className="flex items-center gap-1 bg-white text-brand-green px-3.5 py-1.5 rounded-button text-xs font-black shadow hover:bg-slate-50 transition-colors uppercase tracking-wider"
          >
            <span>Proceed</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
