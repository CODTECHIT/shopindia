import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Star, Clock, CheckCircle2, Calendar, ShieldCheck, MapPin, Heart, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

export const VerticalServices: React.FC = () => {
  const { addToCart, navigateTo, location } = useApp();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ banners: any[] }>('/api/banners')
      .then(d => setBanners(d.banners.filter((b: any) => b.vertical === 'services')))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isHoveringCarousel || banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHoveringCarousel, banners.length]);
  // Filter professional service vertical items
  const services = products.filter(p => p.vertical === 'services');
  const serviceCategories = categories.filter(c => c.vertical === 'services');
  
  const activeServices = selectedCategory === '' ? services : services.filter(p => p.category === selectedCategory);

  const dates = ['Today', 'Tomorrow', 'Saturday', 'Sunday'];
  const times = ['08:00 AM', '10:00 AM', '01:00 PM', '04:00 PM', '06:00 PM'];

  const handleBookNow = (service: any) => {
    setSelectedServiceIdForBooking(service.id);
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const confirmBooking = (service: any) => {
    const bookingDetails = {
      ...service,
      deliveryTime: `${selectedDate} at ${selectedTime}`,
      specs: {
        ...service.specs,
        'Scheduled Slot': `${selectedDate}, ${selectedTime}`,
        'Technician': 'Certified Professional Assigned'
      }
    };
    addToCart(bookingDetails);
    setSelectedServiceIdForBooking(null);
    navigateTo('cart');
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FAF9F6] text-brand-slate py-10 px-12 select-none font-sans text-left">
      {/* Hero Banner Carousel */}
      <div className="max-w-[1440px] mx-auto w-full mb-8">
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
                <motion.img
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6, ease: 'easeOut' }}
                  src={banners[currentSlide]?.image}
                  alt={banners[currentSlide]?.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/75 via-zinc-950/20 to-transparent z-0" />
                
                <div className="absolute inset-y-0 left-0 pl-20 flex flex-col justify-center max-w-xl z-10 text-left text-white select-none">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-brand-blue/90 text-[9px] font-bold uppercase px-3 py-1 rounded-sm w-max tracking-widest mb-5 shadow-soft"
                  >
                    Home Services
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
                    <span>Book Now</span>
                    <span className="text-brand-blue group-hover:translate-x-1 transition-transform">→</span>
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm bg-[#FAF9F6]">Loading promotions...</div>
          )}
        </div>
      </div>
      {/* Search Header Banner */}
      <div className="w-full py-12 flex flex-col items-center justify-center text-center max-w-[1440px] px-8 mx-auto">
        <span className="text-[10px] font-black tracking-widest text-services-gold uppercase bg-services-gold/10 px-3.5 py-1.5 rounded-full mb-4.5 border border-services-gold/20 font-heading">
          PRO PROFESSIONAL HOME SERVICES
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-graphite mb-2 leading-tight font-heading">
          Certified Services at Your Doorstep
        </h1>
        <p className="text-xs text-brand-slate max-w-xl mb-8 leading-relaxed font-semibold">
          Pre-vetted partners, strict safety protocols, and transparent upfront pricing.
        </p>

        {/* Location & Trust Bar */}
        <div className="flex gap-8 items-center border border-brand-border/40 rounded-card bg-white p-5 w-full max-w-5xl shadow-soft">
          <div className="flex items-center gap-3.5 border-r border-brand-border/40 pr-8 shrink-0">
            <MapPin size={18} className="text-services-gold" />
            <div className="text-left leading-tight">
              <span className="text-[9px] text-brand-slate block font-black uppercase tracking-wider">Service Location</span>
              <span className="text-xs font-bold text-brand-graphite max-w-[180px] truncate block">{location}</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4 text-left pl-4 font-bold text-xs">
            <div className="flex items-center gap-2.5 text-brand-graphite">
              <ShieldCheck size={16} className="text-services-gold" />
              <span>Verified Experts</span>
            </div>
            <div className="flex items-center gap-2.5 text-brand-graphite">
              <Clock size={16} className="text-services-gold" />
              <span>Flexible Slots</span>
            </div>
            <div className="flex items-center gap-2.5 text-brand-graphite">
              <CheckCircle2 size={16} className="text-services-gold" />
              <span>Guarantee Cover</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Select Cards (20px rounded) */}
      <div className="max-w-[1440px] mx-auto w-full flex flex-wrap justify-center gap-4.5 mb-10 px-8">
        <div
          onClick={() => setSelectedCategory('')}
          className={`border rounded-card p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-w-[160px] ${
            selectedCategory === ''
              ? 'border-services-gold bg-services-gold/5 shadow-soft scale-[1.03]'
              : 'border-brand-border/40 bg-white hover:border-brand-border/60 hover:scale-[1.01]'
          }`}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden mb-3 flex items-center justify-center bg-services-gold/10 border border-services-gold/20">
            <LayoutGrid size={24} className="text-services-gold" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-graphite font-heading">
            All Categories
          </span>
        </div>
        {serviceCategories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`border rounded-card p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
              selectedCategory === cat.id
                ? 'border-services-gold bg-services-gold/5 shadow-soft scale-[1.03]'
                : 'border-brand-border/40 bg-white hover:border-brand-border/60 hover:scale-[1.01]'
            }`}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden mb-3 flex items-center justify-center bg-zinc-100 border border-brand-border/40">
              <img src={cat.image || undefined} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-extrabold text-brand-graphite tracking-wide font-heading">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Main Grid: Services Feed (Left) & Guarantee Box (Right) */}
      <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-8 px-8">
        {/* Left Side: Services List Feed */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-sm font-black text-brand-graphite border-b border-brand-border/40 pb-3.5 flex items-center gap-2.5 uppercase tracking-wider font-heading">
            <span>Available Packages</span>
            <span className="text-xs text-brand-slate font-bold font-numbers">({activeServices.length} items)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeServices.map(service => {
              const discount = Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100);
              const isWishlisted = wishlist[service.id];

              return (
                <div
                  key={service.id}
                  className="bg-white border border-brand-border/40 rounded-card p-4 flex flex-col gap-4 hover:border-services-gold/30 hover:shadow-md hover:-translate-y-1 transition-all duration-350 relative group"
                >
                  {/* Wishlist Button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => toggleWishlist(service.id, e)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-brand-slate hover:text-brand-red border border-brand-border/40 shadow-sm transition-colors z-10"
                  >
                    <Heart size={13} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
                  </motion.button>

                  {/* Service Image */}
                  <div className="w-full aspect-[4/3] rounded-card overflow-hidden shrink-0 bg-zinc-100 border border-brand-border/40 flex items-center justify-center">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>

                  {/* Content details */}
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-brand-graphite mb-1.5 line-clamp-1 group-hover:text-services-gold transition-colors duration-300 font-heading">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2.5 leading-none">
                        <div className="flex items-center gap-0.5 bg-services-gold text-[#1C1C1E] font-black text-[9px] px-1.5 py-0.5 rounded shadow-soft font-numbers">
                          <span>{service.rating}</span>
                          <Star size={8} className="fill-[#1C1C1E] text-[#1C1C1E]" />
                        </div>
                        <span className="text-[10px] text-brand-slate font-bold font-numbers">
                          ({service.ratingCount.toLocaleString('en-IN')} bookings)
                        </span>
                      </div>
                      <p className="text-xs text-brand-slate leading-relaxed line-clamp-2 font-medium mb-4">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-baseline gap-1.5 leading-none font-numbers flex-wrap">
                        <span className="text-base font-extrabold text-brand-graphite">₹{service.price}</span>
                        <span className="text-xs text-brand-slate line-through">₹{service.originalPrice}</span>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBookNow(service)}
                        className="px-4 py-2 bg-services-gold hover:bg-services-gold/90 text-[#1C1C1E] font-extrabold text-xs tracking-wider rounded-button transition-colors uppercase whitespace-nowrap ml-2"
                      >
                        Book
                      </motion.button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Trust & Verification Guarantee Widget */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-brand-border/40 rounded-card p-5 flex flex-col gap-4 shadow-soft">
            <span className="text-brand-graphite font-black text-xs uppercase tracking-widest border-b border-brand-border/40 pb-2.5 font-heading">
              ShopIndia Promise
            </span>
            <div className="flex flex-col gap-4.5 text-xs font-semibold text-brand-slate">
              <div className="flex gap-3 text-left">
                <CheckCircle2 size={16} className="text-services-gold shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-brand-graphite mb-0.5 font-heading">Insurance Cover</span>
                  <span className="text-[10px] text-brand-slate">Up to ₹10,000 protection against accidental damages.</span>
                </div>
              </div>
              <div className="flex gap-3 text-left">
                <CheckCircle2 size={16} className="text-services-gold shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-brand-graphite mb-0.5 font-heading">Certified Partners Only</span>
                  <span className="text-[10px] text-brand-slate">Thorough background check and training audits.</span>
                </div>
              </div>
              <div className="flex gap-3 text-left">
                <CheckCircle2 size={16} className="text-services-gold shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-brand-graphite mb-0.5 font-heading">No-Questions Re-servicing</span>
                  <span className="text-[10px] text-brand-slate">If not satisfied, free re-service done in 4 days.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Slot Selection Modal Overlay (Frosted glass overlay) */}
      {selectedServiceIdForBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white border border-brand-border/40 rounded-card max-w-md w-full p-6 text-left shadow-soft">
            <h3 className="text-sm font-black text-brand-graphite mb-4.5 flex items-center gap-2 uppercase tracking-wide font-heading">
              <Calendar size={18} className="text-services-gold" />
              <span>Select Booking Slot</span>
            </h3>

            {/* Date selection */}
            <span className="text-[9px] text-brand-slate uppercase font-black tracking-wider block mb-2 font-heading">Select Date</span>
            <div className="grid grid-cols-4 gap-2 mb-4.5">
              {dates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`py-2 px-1 text-center font-bold text-xs rounded-button border transition-all ${
                    selectedDate === date
                      ? 'border-services-gold bg-services-gold/10 text-services-gold shadow-soft'
                      : 'border-brand-border/40 bg-zinc-50 text-brand-slate hover:text-brand-graphite hover:border-brand-border'
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>

            {/* Time selection */}
            <span className="text-[9px] text-brand-slate uppercase font-black tracking-wider block mb-2 font-heading">Select Time</span>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {times.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-1 text-center font-bold text-xs rounded-button border transition-all ${
                    selectedTime === time
                      ? 'border-services-gold bg-services-gold/10 text-services-gold shadow-soft'
                      : 'border-brand-border/40 bg-zinc-50 text-brand-slate hover:text-brand-graphite hover:border-brand-border'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-3 border-t border-brand-border/40">
              <button
                onClick={() => setSelectedServiceIdForBooking(null)}
                className="px-4.5 py-2 border border-brand-border/40 text-brand-slate hover:text-brand-graphite hover:border-brand-border/60 rounded-button text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const service = services.find(s => s.id === selectedServiceIdForBooking);
                  if (service) confirmBooking(service);
                }}
                className="px-5 py-2 bg-services-gold text-[#1C1C1E] hover:bg-services-gold/90 rounded-button text-xs font-black uppercase tracking-wider"
              >
                Confirm Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
