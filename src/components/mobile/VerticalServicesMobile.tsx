import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Star, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VerticalServicesMobile: React.FC = () => {
  const { addToCart, navigateTo } = useApp();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('v-appliance');
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const services = products.filter(p => p.vertical === 'services');
  const serviceCategories = categories.filter(c => c.vertical === 'services');
  const activeServices = services.filter(p => !p.category || p.category === selectedCategory);

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
    <div className="w-full flex flex-col gap-4 py-4 px-3 bg-[#1C1C1E] text-zinc-350 min-h-screen pb-16 select-none text-left font-sans">
      {/* Top Banner Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4.5 text-left shadow-soft">
        <span className="text-[8px] bg-services-gold/10 border border-services-gold/20 text-services-gold px-2.5 py-1 rounded-full font-black uppercase tracking-widest font-heading">
          Certified Experts Only
        </span>
        <h2 className="text-sm font-extrabold text-white mt-2 leading-snug font-heading">Professional Home Services</h2>
        <div className="flex items-center gap-1.5 mt-2 text-[9px] text-zinc-400 font-bold">
          <ShieldCheck size={12} className="text-services-gold" />
          <span>Equipped with sanitization and safety gear</span>
        </div>
      </div>

      {/* Category circular select scrollbar list */}
      <div className="w-full flex gap-3.5 overflow-x-auto py-2.5 no-scrollbar">
        {serviceCategories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex flex-col items-center shrink-0 w-16 text-center cursor-pointer transition-all ${
              selectedCategory === cat.id ? 'scale-105 font-bold' : ''
            }`}
          >
            <div className={`w-11 h-11 rounded-full border overflow-hidden mb-1 flex items-center justify-center bg-zinc-900 transition-all shadow-soft ${
              selectedCategory === cat.id ? 'border-services-gold' : 'border-zinc-800'
            }`}>
              <img src={cat.image ?? ''} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <span className={`text-[9px] font-black truncate w-full tracking-wide font-heading ${selectedCategory === cat.id ? 'text-services-gold' : 'text-zinc-550'}`}>
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* Services List Feed */}
      <div className="flex flex-col gap-3.5">
        <span className="text-[9px] text-zinc-450 uppercase font-black tracking-widest mb-1 font-heading">Recommended Packages</span>

        {activeServices.map(service => {
          const discount = Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100);
          const isWishlisted = wishlist[service.id];

          return (
            <div
              key={service.id}
              className="bg-zinc-900 border border-zinc-850 rounded-[20px] p-4 flex gap-4 cursor-pointer relative"
              onClick={() => navigateTo('detail', service.id)}
            >
              {/* Wishlist Button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => toggleWishlist(service.id, e)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-zinc-950/60 text-zinc-450 hover:text-brand-red border border-zinc-800 transition-colors z-10"
              >
                <Heart size={11} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
              </motion.button>

              {/* Left Column: Info details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white line-clamp-1 mb-1 pr-6 font-heading">{service.title}</h3>
                  <div className="flex items-center gap-1.5 mb-2 leading-none">
                    <div className="flex items-center gap-0.5 bg-services-gold text-[#1C1C1E] font-black text-[8px] px-1.5 py-0.5 rounded font-numbers">
                      <span>{service.rating}</span>
                      <Star size={7} className="fill-[#1C1C1E] text-[#1C1C1E]" />
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold font-numbers">({service.ratingCount.toLocaleString('en-IN')} orders)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2 font-medium">{service.description}</p>
                </div>

                <div className="flex items-baseline gap-1.5 mt-3.5 leading-none font-numbers">
                  <span className="text-xs font-extrabold text-white">₹{service.price}</span>
                  <span className="text-[9px] text-zinc-550 line-through">₹{service.originalPrice}</span>
                  <span className="text-[8px] text-services-gold font-black bg-services-gold/10 px-1 py-0.2 rounded border border-services-gold/10">
                    {discount}% OFF
                  </span>
                </div>
              </div>

              {/* Right Column: Image and Book button */}
              <div className="w-20 flex flex-col items-center justify-between shrink-0" onClick={e => e.stopPropagation()}>
                <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-neutral-900 border border-zinc-800 mb-3 shadow-soft">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBookClick(service.id)}
                  className="w-full py-2 bg-services-gold text-[#1C1C1E] font-extrabold text-[10px] rounded-button uppercase tracking-wider shadow-soft transition-colors active:scale-95 font-heading"
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
          <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setBookingServiceId(null)} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-bottom-nav p-5 pb-8 text-left z-50 shadow-elevated text-zinc-300 font-sans"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4 leading-none">
                <span className="font-extrabold text-sm text-white flex items-center gap-1.5 font-heading">
                  <Calendar size={15} className="text-services-gold" />
                  Select Booking Slot
                </span>
                <button onClick={() => setBookingServiceId(null)} className="text-zinc-400 hover:text-white font-bold p-1">
                  ✕
                </button>
              </div>

              {/* Choose Date */}
              <span className="text-[9px] text-zinc-450 uppercase font-black tracking-wider block mb-2 font-heading">Choose Date</span>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {dates.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`py-2 text-center font-bold text-[10px] rounded-button border transition-all ${
                      selectedDate === date
                        ? 'border-services-gold bg-services-gold/10 text-services-gold shadow-soft'
                        : 'border-zinc-850 bg-zinc-950 text-zinc-400'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>

              {/* Choose Arrival Time */}
              <span className="text-[9px] text-zinc-450 uppercase font-black tracking-wider block mb-2 font-heading">Choose Arrival Time</span>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {times.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 text-center font-bold text-[10px] rounded-button border transition-all ${
                      selectedTime === time
                        ? 'border-services-gold bg-services-gold/10 text-services-gold shadow-soft'
                        : 'border-zinc-850 bg-zinc-950 text-zinc-400'
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
