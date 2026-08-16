import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Star, Calendar, Heart, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

export const VerticalServicesMobile: React.FC = () => {
  const { addToCart, navigateTo } = useApp();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ banners: any[] }>('/api/banners')
      .then(d => setBanners(d.banners.filter((b: any) => b.vertical === 'services')))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);
  const services = products.filter(p => p.vertical === 'services');
  const serviceCategories = categories.filter(c => c.vertical === 'services');
  const activeServices = !selectedCategory 
    ? services 
    : services.filter(p => p.category === selectedCategory);

  const dates = ['Today', 'Tomorrow', 'Saturday', 'Sunday'];
  const times = ['08:00 AM', '10:00 AM', '01:00 PM', '04:00 PM', '06:00 PM'];

  const handleBookClick = (serviceId: string) => {
    setBookingServiceId(serviceId);
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
    setBookingServiceId(null);
    navigateTo('cart');
  };

  return (
    <div className="w-full flex flex-col gap-4 py-4 px-3 bg-[#FAF9F6] text-brand-slate min-h-screen pb-16 select-none text-left font-sans">
      {/* Hero Banner Carousel (Now at the very top to match desktop) */}
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
                  <span className="text-[7.5px] bg-brand-blue text-white font-black px-2 py-0.5 rounded w-max uppercase tracking-wider mb-2 shadow-soft">
                    Home Services
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
                    idx === currentSlide ? 'w-4 bg-brand-blue' : 'w-1 bg-white/40'
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

      {/* Top Banner Box (Now centered to match Desktop Search Header Banner) */}
      <div className="w-full py-4 flex flex-col items-center justify-center text-center px-4">
        <span className="text-xs font-black tracking-widest text-amber-700 uppercase bg-amber-50 px-3 py-1 rounded-full mb-3 border border-amber-200 font-heading">
          PRO PROFESSIONAL HOME SERVICES
        </span>
        <h2 className="text-xl font-extrabold tracking-tight text-brand-graphite mb-1.5 leading-tight font-heading">
          Certified Services at Your Doorstep
        </h2>
        <p className="text-xs text-brand-slate max-w-[280px] mb-2 leading-relaxed font-semibold">
          Pre-vetted partners, strict safety protocols, and transparent upfront pricing.
        </p>
      </div>

      {/* Category circular select scrollbar list */}
      <div className="w-full flex gap-4 overflow-x-auto py-2.5 px-1 no-scrollbar">
        {/* 'All' Option */}
        <div
          onClick={() => setSelectedCategory('')}
          className={`flex flex-col items-center shrink-0 w-16 text-center cursor-pointer transition-all ${
            selectedCategory === '' ? 'scale-105 font-bold' : ''
          }`}
        >
          <div className={`w-11 h-11 rounded-full border overflow-hidden mb-1 flex items-center justify-center bg-white transition-all shadow-soft ${
            selectedCategory === '' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-brand-border'
          }`}>
            <LayoutGrid size={20} className={selectedCategory === '' ? "text-amber-600" : "text-brand-slate/60"} />
          </div>
          <span className={`text-xs font-black truncate w-full tracking-wide font-heading ${selectedCategory === '' ? 'text-amber-600' : 'text-brand-slate'}`}>
            All
          </span>
        </div>

        {serviceCategories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex flex-col items-center shrink-0 w-16 text-center cursor-pointer transition-all ${
              selectedCategory === cat.id ? 'scale-105 font-bold' : ''
            }`}
          >
            <div className={`w-11 h-11 rounded-full border overflow-hidden mb-1 flex items-center justify-center bg-white transition-all shadow-soft ${
              selectedCategory === cat.id ? 'border-amber-500 ring-2 ring-amber-100' : 'border-brand-border'
            }`}>
              <img src={cat.image || undefined} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <span className={`text-xs font-black truncate w-full tracking-wide font-heading ${selectedCategory === cat.id ? 'text-amber-600' : 'text-brand-slate'}`}>
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* Services List Feed */}
      <div className="flex flex-col gap-3.5">
        <span className="text-xs text-brand-slate uppercase font-black tracking-widest mb-1 font-heading">Recommended Packages</span>

        {activeServices.map(service => {
          const discount = Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100);
          const isWishlisted = wishlist[service.id];

          return (
            <div
              key={service.id}
              className="bg-white border border-brand-border/80 rounded-[16px] p-3 flex gap-3 cursor-pointer relative shadow-sm"
              onClick={() => navigateTo('detail', service.id)}
            >
              {/* Wishlist Button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => toggleWishlist(service.id, e)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/95 text-brand-slate hover:text-brand-red border border-brand-border transition-colors z-10"
              >
                <Heart size={11} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
              </motion.button>

              {/* Left Column: Info details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-brand-graphite line-clamp-1 mb-1 pr-6 font-heading">{service.title}</h3>
                  <div className="flex items-center gap-1.5 mb-2 leading-none">
                    <div className="flex items-center gap-0.5 bg-amber-100 text-amber-800 font-black text-xs px-1.5 py-0.5 rounded font-numbers">
                      <span>{service.rating}</span>
                      <Star size={7} className="fill-amber-800 text-amber-800" />
                    </div>
                    <span className="text-xs text-brand-slate font-bold font-numbers">({service.ratingCount.toLocaleString('en-IN')} orders)</span>
                  </div>
                  <p className="text-xs text-brand-slate leading-normal line-clamp-2 font-medium">{service.description}</p>
                </div>

                <div className="flex items-baseline gap-1.5 mt-3.5 leading-none font-numbers">
                  <span className="text-xs font-extrabold text-brand-graphite">₹{service.price}</span>
                  <span className="text-xs text-brand-slate line-through">₹{service.originalPrice}</span>
                  <span className="text-xs text-amber-600 font-black bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                    {discount}% OFF
                  </span>
                </div>
              </div>

              {/* Right Column: Image and Book button */}
              <div className="w-full max-w-[90px] flex flex-col items-center justify-between shrink-0" onClick={e => e.stopPropagation()}>
                <div className="w-full max-w-[90px] aspect-[4/3] rounded-[16px] overflow-hidden bg-white border border-brand-border/60 mb-2 shadow-sm">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBookClick(service.id)}
                  className="w-full py-2 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-button uppercase tracking-wider shadow-soft transition-colors active:scale-95 font-heading"
                >
                  Book
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Slot bottom drawer sheet for Mobile Services */}
      <AnimatePresence>
        {bookingServiceId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setBookingServiceId(null)} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full bg-white border-t border-brand-border rounded-t-bottom-nav p-5 pb-8 text-left z-50 shadow-elevated text-brand-graphite font-sans"
            >
              <div className="flex justify-between items-center border-b border-brand-border pb-3 mb-4 leading-none">
                <span className="font-extrabold text-sm text-brand-graphite flex items-center gap-1.5 font-heading">
                  <Calendar size={15} className="text-amber-500" />
                  Select Booking Slot
                </span>
                <button onClick={() => setBookingServiceId(null)} className="text-brand-slate hover:text-brand-graphite font-bold p-1">
                  ✕
                </button>
              </div>

              {/* Choose Date */}
              <span className="text-xs text-brand-slate uppercase font-black tracking-wider block mb-2 font-heading">Choose Date</span>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {dates.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`py-2 text-center font-bold text-xs rounded-button border transition-all ${
                      selectedDate === date
                        ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-soft'
                        : 'border-brand-border bg-brand-elevated text-brand-slate'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>

              {/* Choose Arrival Time */}
              <span className="text-xs text-brand-slate uppercase font-black tracking-wider block mb-2 font-heading">Choose Arrival Time</span>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {times.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 text-center font-bold text-xs rounded-button border transition-all ${
                      selectedTime === time
                        ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-soft'
                        : 'border-brand-border bg-brand-elevated text-brand-slate'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const service = services.find(s => s.id === bookingServiceId);
                  if (service) confirmBooking(service);
                }}
                className="w-full py-3 bg-services-gold hover:bg-services-gold/90 text-[#1C1C1E] font-extrabold text-xs rounded-button uppercase tracking-widest shadow-premium transition-all"
              >
                Confirm Slot Booking
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
