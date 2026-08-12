import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Star, Award, Heart, ChevronLeft, ChevronRight, Clock, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

export const VerticalShop: React.FC = () => {
  const { navigateTo, setSearchQuery, addToCart } = useApp();
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ banners: any[] }>('/api/banners')
      .then(d => setBanners(d.banners.filter((b: any) => b.vertical === 'shop')))
      .catch(console.error);
  }, []);

  // Filter products for this vertical
  const shopProducts = products.filter(p => p.vertical === 'shop');

  // Dynamic sections
  const topBrands = Array.from(new Set(shopProducts.map(p => p.brand))).filter(Boolean).slice(0, 8);
  const justForYou = shopProducts.length > 5 ? shopProducts.slice().sort(() => 0.5 - Math.random()).slice(0, 6) : shopProducts.slice(0, 6);

  // Autoplay for Hero Carousel
  useEffect(() => {
    if (isHoveringCarousel || banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHoveringCarousel, banners.length]);

  // Deals countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }; // reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const shopCategories = categories.filter(cat => cat.vertical === 'shop');

  // Horizontal scroll container reference for deals
  const dealsScrollRef = useRef<HTMLDivElement>(null);

  const scrollDeals = (direction: 'left' | 'right') => {
    if (dealsScrollRef.current) {
      const scrollAmount = 400;
      dealsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full py-10 px-6 md:px-12 xl:px-16 bg-brand-bg min-h-screen text-brand-graphite font-sans transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-16">
      
      {/* Categories Bar (Horizontal Scrollable, scrolls away with body content) */}
      <div className="w-full flex justify-center border-b border-brand-border/40 pb-6 overflow-hidden select-none">
        <div className="flex items-center gap-12 overflow-x-auto no-scrollbar py-2 max-w-full px-4 scroll-smooth scrollbar-none">
          {categories.filter(cat => cat.vertical === 'shop').map(cat => (
            <div
              key={cat.id}
              onClick={() => {
                setSearchQuery(cat.name);
                navigateTo('search');
              }}
              className="flex flex-col items-center cursor-pointer group text-center shrink-0 px-2 py-1 rounded-card hover:bg-slate-50/40 transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden mb-2 flex items-center justify-center bg-white border border-brand-border/80 shadow-soft group-hover:scale-[1.04] group-hover:shadow-premium group-hover:border-brand-blue/30 transition-all duration-300">
                <img 
                  src={cat.image || undefined} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                />
              </div>
              <span className="text-[10px] font-bold text-brand-slate group-hover:text-brand-blue transition-colors duration-300 whitespace-nowrap tracking-wide mt-0.5 font-heading">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Hero Banner Carousel (Redesigned from Scratch with Apple-like typography & progress indicator dots) */}
      <div 
        className="w-full h-[360px] rounded-hero overflow-hidden shadow-premium relative bg-zinc-950 group"
        onMouseEnter={() => setIsHoveringCarousel(true)}
        onMouseLeave={() => setIsHoveringCarousel(false)}
      >
        {banners.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background zoom image */}
              <motion.img
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 6, ease: 'easeOut' }}
                src={banners[currentSlide]?.image}
                alt={banners[currentSlide]?.title}
                className="absolute inset-0 w-full h-full object-cover opacity-70 select-none"
              />
              {/* Soft vignette overlay mapping text visibility zone only */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/75 via-zinc-950/20 to-transparent z-0" />
              
              {/* Text Overlay */}
              <div className="absolute inset-y-0 left-0 pl-20 flex flex-col justify-center max-w-xl z-10 text-left text-white select-none">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-brand-orange/90 text-[9px] font-bold uppercase px-3 py-1 rounded-sm w-max tracking-widest mb-5 shadow-soft"
                >
                  Exclusive Launch
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl font-bold tracking-tight mb-3 font-heading leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                >
                  {banners[currentSlide]?.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-sm font-medium text-zinc-300 mb-8 leading-relaxed max-w-md"
                >
                  {banners[currentSlide]?.subtitle}
                </motion.p>
                
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('search')}
                  className="group px-8 py-3.5 bg-white text-zinc-950 rounded-full font-bold text-xs tracking-wider shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_25px_rgba(255,255,255,0.2)] hover:bg-zinc-50 transition-all w-max uppercase flex items-center gap-2.5"
                >
                  <span>Shop Collection</span>
                  <span className="text-brand-orange group-hover:translate-x-1 transition-transform">→</span>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm bg-[#FAF9F6]">Loading promotions...</div>
        )}

        {/* Carousel Prev/Next Arrows (Elegant & unobtrusive) */}
        {banners.length > 0 && (
          <>
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/10 hover:bg-black/25 text-white/90 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % banners.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/10 hover:bg-black/25 text-white/90 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90"
              aria-label="Next Slide"
            >
              <ChevronRight size={16} />
            </button>

            {/* Progress Navigation Dots (Apple style line indicators) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className="group relative focus:outline-none"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <span className={`block h-1 rounded-full transition-all duration-500 ${
                    currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 group-hover:bg-white/70'
                  }`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Top Brands Horizontal Marquee/Row */}
      {topBrands.length > 0 && (
        <div className="w-full bg-white rounded-card shadow-premium border border-brand-border p-6 select-none flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-bold tracking-wider text-brand-graphite uppercase font-heading">Explore Top Brands</h3>
            <button className="text-[10px] font-bold text-brand-blue hover:underline">View Directory</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            {topBrands.map(brand => (
              <div 
                key={brand} 
                onClick={() => { setSearchQuery(brand); navigateTo('search'); }}
                className="flex-shrink-0 w-32 h-16 rounded-xl border border-brand-border bg-slate-50 flex items-center justify-center cursor-pointer hover:border-brand-blue/40 hover:shadow-soft transition-all group"
              >
                <span className="font-extrabold text-sm text-brand-slate group-hover:text-brand-graphite transition-colors">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Just For You (Recently Viewed / Recommended) */}
      {justForYou.length > 0 && (
        <div className="w-full flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-bold tracking-wider text-brand-graphite uppercase font-heading">Just For You</h3>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth p-2 -mx-2">
            {justForYou.map(product => {
              const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              return (
                <div
                  key={'jfy-'+product.id}
                  onClick={() => navigateTo('detail', product.id)}
                  className="w-[180px] flex-shrink-0 border border-brand-border/60 rounded-xl flex flex-col bg-white hover:shadow-hover-lift hover:border-brand-blue/30 transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  <div className="w-full aspect-[4/3] flex items-center justify-center bg-slate-50/50 p-4 relative border-b border-brand-border/30">
                    <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out mix-blend-multiply" />
                    {product.isAssured && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-white/95 text-[8px] font-black italic px-1.5 py-0.5 rounded shadow-sm border border-brand-blue/10">
                        <span className="text-brand-blue">Shop</span><span className="text-brand-orange">Assured</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="text-[11px] font-medium text-brand-graphite line-clamp-2 leading-relaxed group-hover:text-brand-blue transition-colors font-heading mb-auto">{product.title}</h4>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex flex-col leading-none font-numbers">
                      <span className="text-[13px] font-bold text-brand-graphite">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.originalPrice > product.price && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] text-brand-slate line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                          <span className="text-[8.5px] text-brand-green font-extrabold">{discount}% OFF</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Deals of the Day (Polished details, luxury monospaced countdown timer, horizontal carousel buttons) */}
      <div className="w-full bg-white rounded-card flex flex-col md:flex-row shadow-premium overflow-hidden border border-brand-border relative">
        {/* Left Side: Editorial timer and badge */}
        <div 
          className="w-full md:w-[280px] p-8 border-b md:border-b-0 md:border-r border-brand-border flex flex-col items-center justify-center text-center shrink-0 bg-cover bg-bottom bg-no-repeat relative"
          style={{ backgroundImage: `linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.95)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format')` }}
        >
          <div className="flex items-center gap-1.5 text-brand-orange bg-orange-50/80 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider mb-3.5 border border-brand-orange/10">
            <Clock size={10} className="animate-spin-slow" />
            <span>Limited Offer</span>
          </div>
          <h3 className="text-sm font-bold mb-4 tracking-wider text-brand-graphite uppercase font-heading">Deals of the Day</h3>
          
          {/* Monospaced Digit blocks */}
          <div className="flex items-center gap-2 mb-7 font-numbers text-xs font-bold select-none">
            <div className="flex flex-col items-center">
              <span className="w-9 h-9 flex items-center justify-center bg-brand-graphite text-white rounded-sm shadow-soft text-sm font-bold leading-none">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-[7.5px] uppercase font-bold tracking-wider text-brand-slate mt-1.5">Hours</span>
            </div>
            <span className="text-brand-slate font-bold mb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="w-9 h-9 flex items-center justify-center bg-brand-graphite text-white rounded-sm shadow-soft text-sm font-bold leading-none">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-[7.5px] uppercase font-bold tracking-wider text-brand-slate mt-1.5">Mins</span>
            </div>
            <span className="text-brand-slate font-bold mb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="w-9 h-9 flex items-center justify-center bg-brand-graphite text-white rounded-sm shadow-soft text-sm font-bold leading-none">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-[7.5px] uppercase font-bold tracking-wider text-brand-slate mt-1.5">Secs</span>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('search')}
            className="px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-bold text-[10px] tracking-wider rounded-button shadow-premium transition-colors uppercase"
          >
            Explore All Deals
          </motion.button>
        </div>

        {/* Right Side: Horizontal products list with slider arrows */}
        <div className="flex-1 relative flex items-center">
          {/* Scroll Navigation Arrows */}
          <button
            onClick={() => scrollDeals('left')}
            className="absolute left-3 w-8 h-8 rounded-full bg-white border border-brand-border/60 hover:border-brand-border shadow-soft flex items-center justify-center text-brand-slate hover:text-brand-graphite hover:scale-105 active:scale-95 transition-all z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollDeals('right')}
            className="absolute right-3 w-8 h-8 rounded-full bg-white border border-brand-border/60 hover:border-brand-border shadow-soft flex items-center justify-center text-brand-slate hover:text-brand-graphite hover:scale-105 active:scale-95 transition-all z-10"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>

          {/* Horizontal Grid Content */}
          <div 
            ref={dealsScrollRef}
            className="w-full flex gap-6 overflow-x-auto p-8 scroll-smooth no-scrollbar"
          >
            {shopProducts.slice(0, 5).map(product => {
              const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              const isWishlisted = wishlist[product.id];
              return (
                <div
                  key={product.id}
                  onClick={() => navigateTo('detail', product.id)}
                  className="w-[160px] flex-shrink-0 flex flex-col items-center text-center group cursor-pointer relative"
                >
                  {/* Wishlist Heart Animation */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => toggleWishlist(product.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-zinc-400 hover:text-brand-red shadow-soft transition-colors z-10"
                  >
                    <Heart size={12} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
                  </motion.button>

                  {/* Editorial zoom wrapper */}
                  <div className="w-[120px] h-[120px] flex items-center justify-center mb-3 bg-slate-50/50 rounded-full p-4 relative overflow-hidden group-hover:bg-slate-100/50 transition-colors">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out mix-blend-multiply" 
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-brand-graphite line-clamp-1 group-hover:text-brand-blue transition-colors px-2 leading-tight font-heading">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-2 justify-center leading-none font-numbers text-xs">
                    <span className="font-semibold text-brand-graphite">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-[10px] text-brand-slate line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  {product.originalPrice > product.price && (
                    <span className="text-[9px] text-brand-orange font-bold mt-2 bg-orange-50 border border-brand-orange/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-numbers">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Multi-Column Product Display Grids (Polished visual borders, shadows, image-zooms & consistent rhythm spacing) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 text-left items-start select-none">
        
        {/* Left Column: Product Grid Sections (Span 3) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-10">
          
          {shopCategories.length === 0 && (
            <div className="w-full bg-brand-card p-8 rounded-card shadow-premium text-center border border-brand-border text-brand-slate font-semibold text-sm">
              No categories found. Create some in the Admin panel!
            </div>
          )}

          {shopCategories.slice(0, 3).map((category) => {
            const categoryProducts = shopProducts.filter(p => p.category === category.id);

            return (
              <div key={category.id} className="w-full bg-brand-card p-8 rounded-card shadow-premium flex flex-col gap-6 border border-brand-border">
                <div className="flex justify-between items-center border-b border-brand-border pb-4 leading-none">
                  <div className="flex items-center gap-2.5">
                    <span className="h-4 w-1 bg-brand-blue rounded-full"></span>
                    <h3 className="text-xs font-semibold text-brand-graphite uppercase tracking-wider font-heading">
                      {category.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery(category.name);
                      navigateTo('search');
                    }}
                    className="text-xs font-semibold text-brand-blue hover:text-blue-600 transition-colors uppercase tracking-wider"
                  >
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {productsLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="border border-brand-border rounded-card p-5.5 flex flex-col bg-brand-card h-full relative">
                        <div className="w-full aspect-[5/4] bg-slate-100/80 rounded-card mb-4 animate-pulse"></div>
                        <div className="h-3.5 bg-slate-100/80 rounded w-3/4 mb-2.5 animate-pulse"></div>
                        <div className="h-3.5 bg-slate-100/80 rounded w-1/2 mb-4 animate-pulse"></div>
                        
                        <div className="flex items-center gap-2 mb-4 mt-auto">
                          <div className="h-3 w-8 bg-slate-100/80 rounded animate-pulse"></div>
                          <div className="h-3 w-16 bg-slate-100/80 rounded animate-pulse"></div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div className="flex flex-col gap-1.5 w-1/2">
                            <div className="h-4 w-3/4 bg-slate-100/80 rounded animate-pulse"></div>
                            <div className="h-3 w-1/2 bg-slate-100/80 rounded-full animate-pulse"></div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-slate-100/80 animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : categoryProducts.length === 0 ? (
                    <div className="col-span-3 text-center py-10 text-brand-slate text-sm font-semibold">No products found in this category.</div>
                  ) : (
                    categoryProducts.map(product => {
                      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                      const isWishlisted = wishlist[product.id];
                      return (
                        <div
                          key={product.id}
                          onClick={() => navigateTo('detail', product.id)}
                          className="border border-brand-border/60 rounded-xl flex flex-col bg-white hover:shadow-hover-lift hover:-translate-y-1 hover:border-brand-blue/30 transition-all duration-300 ease-out cursor-pointer h-full group relative overflow-hidden"
                        >
                          {/* Wishlist Button */}
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => toggleWishlist(product.id, e)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-zinc-400 hover:text-brand-red hover:bg-white shadow-soft transition-colors z-10"
                          >
                            <Heart size={13} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
                          </motion.button>

                          <div className="w-full aspect-[4/3] flex items-center justify-center relative overflow-hidden bg-slate-50/50 p-6 border-b border-brand-border/30">
                            <img 
                              src={product.image} 
                              alt={product.title} 
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out mix-blend-multiply" 
                            />
                            {product.isAssured && (
                              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-0.5 bg-white/95 text-[9px] font-black italic px-1.5 py-0.5 rounded shadow-sm border border-brand-blue/10 select-none">
                                <span className="text-brand-blue">ShopIndia</span>
                                <span className="text-brand-orange">Assured</span>
                              </div>
                            )}
                          </div>

                          <div className="p-5 flex flex-col flex-1">
                            <h4 className="text-xs font-semibold text-brand-graphite line-clamp-2 leading-relaxed mb-3 group-hover:text-brand-blue transition-colors font-heading">
                              {product.title}
                            </h4>

                          {/* Ratings and Count Row */}
                          <div className="flex items-center gap-2 mb-4 mt-auto leading-none select-none">
                            <div className="flex items-center gap-0.5 bg-brand-green/10 border border-brand-green/20 text-brand-green font-semibold text-[9px] px-2 py-0.5 rounded shadow-soft font-numbers">
                              <span>{product.rating}</span>
                              <Star size={8} className="fill-brand-green text-brand-green" />
                            </div>
                            <span className="text-[10px] text-brand-slate font-semibold font-numbers">({product.ratingCount.toLocaleString('en-IN')} ratings)</span>
                          </div>

                          {/* Price and discount badges details */}
                          <div className="flex items-center justify-between mt-2 pt-3 border-t border-brand-border/40">
                            <div className="flex flex-col gap-0.5 leading-none font-numbers">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-brand-graphite">₹{product.price.toLocaleString('en-IN')}</span>
                                {product.originalPrice > product.price && (
                                  <span className="text-[10px] text-brand-slate line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                )}
                              </div>
                              {product.originalPrice > product.price && (
                                <span className="text-[9px] font-extrabold text-brand-green w-max tracking-wide">{discount}% Off</span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-brand-border/60 text-brand-slate hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-colors rounded-full shadow-sm"
                            >
                              <ShoppingCart size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Promotional Sidebar / Advertisements (Span 1) */}
        <div className="col-span-1 flex flex-col gap-6 lg:sticky lg:top-[140px] h-fit">
          <div className="w-full bg-brand-card p-6 rounded-card shadow-premium flex flex-col gap-4 border border-brand-border">
            <span className="font-bold text-[9px] tracking-widest text-brand-slate uppercase font-heading">Spotlight Brand</span>
            <div className="relative aspect-[3/4] rounded-card overflow-hidden shadow-inner group cursor-pointer bg-neutral-900">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format"
                alt="Ad"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-graphite via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[8px] font-bold uppercase tracking-wider text-brand-orange bg-orange-50/15 border border-brand-orange/20 px-2 py-0.5 rounded w-max mb-1.5 font-heading">
                  Partnership
                </span>
                <h4 className="text-base font-bold leading-tight mb-1 font-heading">Active Jordan series</h4>
                <p className="text-[10.5px] text-zinc-300 leading-normal mb-4 font-medium">Claim premium cashbacks instantly.</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('search')}
                  className="px-4.5 py-2 bg-brand-blue text-white rounded-button font-bold text-[9.5px] tracking-wide w-max shadow hover:bg-blue-650 transition-colors uppercase font-heading"
                >
                  Shop Now
                </motion.button>
              </div>
            </div>
          </div>

          <div className="w-full bg-brand-card p-6 rounded-card shadow-premium flex flex-col gap-3.5 border border-brand-border text-left">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-brand-orange border border-brand-orange/10 shadow-soft">
                <Award size={16} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-xs text-brand-graphite font-heading">Plus Guaranteed Partner</span>
                <span className="text-[9.5px] text-brand-slate font-bold">1-day fast delivery</span>
              </div>
            </div>
            <p className="text-[11px] text-brand-slate leading-relaxed border-t border-brand-border pt-3.5 font-semibold">
              Enjoy 1-day delivery and special discount prices on items displaying the <strong>ShopIndia Assured</strong> badge.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

