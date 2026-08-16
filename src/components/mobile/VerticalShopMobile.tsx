import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { 
  Heart, ShieldCheck,
  Clock, ChevronRight, Truck, Award, RotateCcw, Star,
  ShoppingCart, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

export const VerticalShopMobile: React.FC = () => {
  const { navigateTo, setSearchQuery, addToCart } = useApp();
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 44, seconds: 12 });
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ banners: any[] }>('/api/banners')
      .then(d => setBanners(d.banners.filter((b: any) => b.vertical === 'shop')))
      .catch(console.error);
  }, []);

  const { products } = useProducts();
  const { categories } = useCategories();
  const shopProducts = products.filter(p => p.vertical === 'shop');
  
  const shopCategories = categories.filter(c => c.vertical === 'shop');

  // Autoplay for Hero Carousel
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Deals countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  // 2x5 Mobile Categories circular list (styled with pastel background rings)
  // Premium 3D Categories matching the mockup
  // Removed hardcoded mobileCategoriesList

  return (
    <div className="w-full flex flex-col gap-7 py-6 px-4 bg-brand-bg min-h-screen text-brand-graphite font-sans pb-24 transition-colors duration-300">
      
      {/* 2. Circular Categories Grid (2x5 structure layout matching user reference) */}
      <div className="w-full bg-white border border-brand-border rounded-card p-4 shadow-soft grid grid-cols-5 gap-y-5 gap-x-2 select-none justify-items-center">
        {shopCategories.map((cat) => {
          return (
            <div
              key={cat.id}
              onClick={() => { 
                setSearchQuery(cat.name); 
                navigateTo('search'); 
              }}
              className="flex flex-col items-center text-center cursor-pointer active:scale-90 transition-transform w-14"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-1.5 shadow-soft bg-slate-50 text-slate-600 transition-all overflow-hidden border border-brand-border/60`}>
                <img src={cat.image || undefined} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <div className="h-7 flex items-start justify-center w-full overflow-hidden">
                <span className="text-[8.5px] font-semibold text-brand-graphite opacity-90 line-clamp-2 w-full tracking-tight leading-tight font-heading">
                  {cat.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Hero Banner Carousel */}
      <div className="w-full aspect-[2/1] rounded-[28px] overflow-hidden shadow-soft relative bg-zinc-950">
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
                  <span className="text-[7.5px] bg-brand-orange text-white font-black px-2 py-0.5 rounded w-max uppercase tracking-wider mb-2 shadow-soft">
                    Super Deal
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

            {/* Carousel indicators dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-4 bg-white' : 'w-1 bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs bg-[#FAF9F6]">Loading promotions...</div>
        )}
      </div>

      {/* 4. Mobile Deals of the Day Box */}
      <div className="w-full bg-white rounded-[20px] p-5 shadow-soft border border-brand-border flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-brand-border pb-3 leading-none select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-brand-graphite uppercase tracking-wide font-heading">Deals of the Day</span>
            <div className="flex items-center gap-1 text-[8.5px] text-brand-red font-black bg-red-50 border border-brand-red/10 px-2 py-0.5 rounded-full font-numbers">
              <Clock size={8} />
              <span>{formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m {formatNumber(timeLeft.seconds)}s</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('search')}
            className="text-xs font-black text-brand-blue uppercase tracking-widest flex items-center gap-0.5"
          >
            <span>See All</span>
            <ChevronRight size={10} />
          </button>
        </div>

        {/* Scrollable Deals list */}
        <div className="w-full flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
          {shopProducts.map(product => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            const isWishlisted = wishlist[product.id];
            return (
              <div
                key={product.id}
                onClick={() => navigateTo('detail', product.id)}
                className="w-full max-w-[110px] shrink-0 flex flex-col text-left cursor-pointer group relative"
              >
                {/* Wishlist Heart */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => toggleWishlist(product.id, e)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-white/95 text-zinc-400 hover:text-brand-red shadow-soft border border-brand-border transition-colors z-10"
                >
                  <Heart size={10} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
                </motion.button>

                <div className="w-full max-w-[110px] aspect-[5/4] border border-brand-border/60 rounded-[16px] flex items-center justify-center p-1 bg-white mb-2 overflow-hidden shadow-sm">
                  <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                <h4 className="text-xs font-bold text-brand-graphite line-clamp-1 leading-snug font-heading px-1">{product.title}</h4>
                <span className="text-xs font-extrabold text-brand-graphite mt-0.5 font-numbers px-1">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice > product.price && (
                  <span className="text-[8.5px] font-black text-brand-orange uppercase tracking-wider font-numbers px-1 mt-0.5">{discount}% OFF</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4.5. Trust Badges Row (Zepto / Blinkit style) */}
      <div className="w-full bg-white rounded-[20px] p-3.5 border border-brand-border shadow-soft grid grid-cols-4 gap-1 select-none">
        {[
          { title: 'Free Delivery', desc: 'Above ₹199', icon: Truck, color: 'text-emerald-600 bg-emerald-50' },
          { title: 'Best Quality', desc: '100% Premium', icon: Award, color: 'text-blue-600 bg-blue-50' },
          { title: 'Easy Returns', desc: 'Within 7 Days', icon: RotateCcw, color: 'text-orange-600 bg-orange-50' },
          { title: 'Secure Pay', desc: '100% Safe', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex flex-col items-center text-center p-0.5 relative border-r border-brand-border last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${item.color} shadow-soft shrink-0`}>
                <Icon size={14} strokeWidth={2.5} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-brand-graphite leading-tight tracking-tight font-heading">{item.title}</span>
              <span className="text-[8px] sm:text-[8.5px] font-bold text-brand-slate mt-0.5 leading-tight">{item.desc}</span>
            </div>
          );
        })}
      </div>



      {/* 5. Mobile Product Grid Feed */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-brand-border pb-2.5 mt-2.5 leading-none">
          <span className="text-[10.5px] font-black text-brand-graphite uppercase tracking-wider font-heading">Suggested for You</span>
        </div>

        <div className="grid grid-cols-2 gap-3 select-none">
          {shopProducts.map(product => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            const isWishlisted = wishlist[product.id];
            return (
              <div
                key={product.id}
                onClick={() => navigateTo('detail', product.id)}
                className="bg-white border border-brand-border/80 rounded-[16px] p-2.5 flex flex-col cursor-pointer relative shadow-sm active:scale-[0.98] transition-transform"
              >
                {/* Wishlist Heart */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => toggleWishlist(product.id, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 text-zinc-400 hover:text-brand-red shadow-soft border border-brand-border transition-colors z-10"
                >
                  <Heart size={11} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
                </motion.button>

                {product.isAssured && (
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-0.5 bg-blue-50/95 text-xs font-black italic px-1.5 py-0.5 rounded border border-brand-blue/20 backdrop-blur-sm select-none shadow-sm">
                    <span className="text-brand-blue">ShopIndia</span>
                    <span className="text-brand-orange">Assured</span>
                  </div>
                )}
                
                {/* Image panel */}
                <div className="w-full aspect-[5/4] flex items-center justify-center mb-2 bg-white rounded-[16px] overflow-hidden shadow-sm border border-brand-border/60">
                  <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                
                {/* Content */}
                <h3 className="text-xs font-bold text-brand-graphite line-clamp-2 leading-snug mb-1 min-h-[30px] font-heading px-0.5">
                  {product.title}
                </h3>
                
                {/* Rating Count */}
                <div className="flex items-center gap-1.5 mb-2 mt-auto leading-none px-0.5">
                  <div className="flex items-center gap-0.5 bg-brand-green/10 border border-brand-green/20 text-brand-green font-extrabold text-xs px-1.5 py-0.5 rounded shadow-soft font-numbers">
                    <span>{product.rating}</span>
                    <Star size={7} className="fill-brand-green text-brand-green" />
                  </div>
                  <span className="text-xs text-brand-slate font-bold font-numbers">({product.ratingCount.toLocaleString('en-IN')})</span>
                </div>
                
                {/* Price block details */}
                <div className="flex items-baseline gap-1 mt-1 leading-none font-numbers px-0.5">
                  <span className="text-xs font-extrabold text-brand-graphite">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-xs text-brand-slate line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="text-xs font-black text-brand-orange uppercase tracking-wider">{discount}% Off</span>
                    </>
                  )}
                </div>

                {/* Action Buttons: Add to Cart & Buy Now */}
                <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-brand-border/60">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="py-1.5 px-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-brand-orange/30 text-brand-orange font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <ShoppingCart size={11} className="text-brand-orange shrink-0" />
                    <span className="truncate">Add to Cart</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                      navigateTo('cart');
                    }}
                    className="py-1.5 px-1 rounded-lg bg-brand-blue hover:bg-blue-900 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <Zap size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                    <span className="truncate">Buy Now</span>
                  </motion.button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

