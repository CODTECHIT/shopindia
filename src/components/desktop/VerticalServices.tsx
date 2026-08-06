import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Star, Clock, CheckCircle2, Calendar, ShieldCheck, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const VerticalServices: React.FC = () => {
  const { addToCart, navigateTo, location } = useApp();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('v-appliance');
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Filter professional service vertical items
  const services = products.filter(p => p.vertical === 'services');
  const serviceCategories = categories.filter(c => c.vertical === 'services');
  const activeServices = services.filter(p => !p.category || p.category === selectedCategory);

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
    <div className="w-full flex flex-col min-h-screen bg-[#1C1C1E] text-zinc-300 py-10 px-12 select-none font-sans text-left">
      {/* Search Header Banner */}
      <div className="w-full py-12 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
        <span className="text-[10px] font-black tracking-widest text-services-gold uppercase bg-services-gold/10 px-3.5 py-1.5 rounded-full mb-4.5 border border-services-gold/20 font-heading">
          PRO PROFESSIONAL HOME SERVICES
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight font-heading">
          Certified Services at Your Doorstep
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl mb-8 leading-relaxed font-semibold">
          Pre-vetted partners, strict safety protocols, and transparent upfront pricing.
        </p>

        {/* Location & Trust Bar */}
        <div className="flex gap-8 items-center border border-zinc-800 rounded-card bg-[#2C2C2E] p-5 w-full shadow-premium">
          <div className="flex items-center gap-3.5 border-r border-zinc-800 pr-8 shrink-0">
            <MapPin size={18} className="text-services-gold" />
            <div className="text-left leading-tight">
              <span className="text-[9px] text-zinc-400 block font-black uppercase tracking-wider">Service Location</span>
              <span className="text-xs font-bold text-white max-w-[180px] truncate block">{location}</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4 text-left pl-4 font-bold text-xs">
            <div className="flex items-center gap-2.5 text-zinc-200">
              <ShieldCheck size={16} className="text-services-gold" />
              <span>Verified Experts</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-200">
              <Clock size={16} className="text-services-gold" />
              <span>Flexible Slots</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-200">
              <CheckCircle2 size={16} className="text-services-gold" />
              <span>Guarantee Cover</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Select Cards (20px rounded) */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-5 gap-4.5 mb-10">
        {serviceCategories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`border rounded-card p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
              selectedCategory === cat.id
                ? 'border-services-gold bg-services-gold/5 shadow-premium scale-[1.03]'
                : 'border-zinc-800 bg-[#2C2C2E] hover:border-zinc-700 hover:scale-[1.01]'
            }`}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden mb-3 flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <img src={cat.image ?? ''} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-extrabold text-white tracking-wide font-heading">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Main Grid: Services Feed (Left) & Guarantee Box (Right) */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-3 gap-8">
        {/* Left Side: Services List Feed */}
        <div className="col-span-2 flex flex-col gap-6">
          <h2 className="text-sm font-black text-white border-b border-zinc-800 pb-3.5 flex items-center gap-2.5 uppercase tracking-wider font-heading">
            <span>Available Packages</span>
            <span className="text-xs text-zinc-400 font-bold font-numbers">({activeServices.length} items)</span>
          </h2>

          <div className="flex flex-col gap-4.5">
            {activeServices.map(service => {
              const discount = Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100);
              const isWishlisted = wishlist[service.id];

              return (
                <div
                  key={service.id}
                  className="bg-[#2C2C2E] border border-zinc-800 rounded-card p-5.5 flex gap-5 hover:border-services-gold/30 hover:shadow-hover-lift hover:-translate-y-0.5 transition-all duration-350 relative group"
                >
                  {/* Wishlist Button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => toggleWishlist(service.id, e)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/60 text-zinc-450 hover:text-brand-red border border-zinc-800 transition-colors z-10"
                  >
                    <Heart size={13} className={isWishlisted ? "fill-brand-red text-brand-red" : ""} />
                  </motion.button>

                  {/* Service Image */}
                  <div className="w-[130px] h-[130px] rounded-card overflow-hidden shrink-0 bg-neutral-900 border border-zinc-800 flex items-center justify-center">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>

                  {/* Content details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-white mb-2 line-clamp-1 group-hover:text-services-gold transition-colors duration-300 font-heading">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2.5 leading-none">
                        <div className="flex items-center gap-0.5 bg-services-gold text-[#1C1C1E] font-black text-[9px] px-1.5 py-0.5 rounded shadow-soft font-numbers">
                          <span>{service.rating}</span>
                          <Star size={8} className="fill-[#1C1C1E] text-[#1C1C1E]" />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold font-numbers">
                          ({service.ratingCount.toLocaleString('en-IN')} bookings)
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 font-medium">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-baseline gap-2 leading-none font-numbers">
                        <span className="text-base font-extrabold text-white">₹{service.price}</span>
                        <span className="text-xs text-zinc-500 line-through">₹{service.originalPrice}</span>
                        <span className="text-[9px] text-services-gold font-black bg-services-gold/10 px-1.5 py-0.5 rounded border border-services-gold/10 uppercase tracking-wider">
                          {discount}% OFF
                        </span>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBookNow(service)}
                        className="px-5 py-2.5 bg-services-gold hover:bg-services-gold/90 text-[#1C1C1E] font-extrabold text-xs tracking-wider rounded-button transition-colors uppercase"
                      >
                        Book Service
                      </motion.button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Trust & Verification Guarantee Widget */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-[#2C2C2E] border border-zinc-800 rounded-card p-5 flex flex-col gap-4 shadow-premium">
            <span className="text-white font-black text-xs uppercase tracking-widest border-b border-zinc-800 pb-2.5 font-heading">
              ShopIndia Promise
            </span>
            <div className="flex flex-col gap-4.5 text-xs font-semibold text-zinc-300">
              <div className="flex gap-3 text-left">
                <CheckCircle2 size={16} className="text-services-gold shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-white mb-0.5 font-heading">Insurance Cover</span>
                  <span className="text-[10px] text-zinc-450">Up to ₹10,000 protection against accidental damages.</span>
                </div>
              </div>
              <div className="flex gap-3 text-left">
                <CheckCircle2 size={16} className="text-services-gold shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-white mb-0.5 font-heading">Certified Partners Only</span>
                  <span className="text-[10px] text-zinc-450">Thorough background check and training audits.</span>
                </div>
              </div>
              <div className="flex gap-3 text-left">
                <CheckCircle2 size={16} className="text-services-gold shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-white mb-0.5 font-heading">No-Questions Re-servicing</span>
                  <span className="text-[10px] text-zinc-450">If not satisfied, free re-service done in 4 days.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Slot Selection Modal Overlay (Frosted glass overlay) */}
      {selectedServiceIdForBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-[#2C2C2E] border border-zinc-800 rounded-card max-w-md w-full p-6 text-left shadow-hover-lift">
            <h3 className="text-sm font-black text-white mb-4.5 flex items-center gap-2 uppercase tracking-wide font-heading">
              <Calendar size={18} className="text-services-gold" />
              <span>Select Booking Slot</span>
            </h3>

            {/* Date selection */}
            <span className="text-[9px] text-zinc-450 uppercase font-black tracking-wider block mb-2 font-heading">Select Date</span>
            <div className="grid grid-cols-4 gap-2 mb-4.5">
              {dates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`py-2 px-1 text-center font-bold text-xs rounded-button border transition-all ${
                    selectedDate === date
                      ? 'border-services-gold bg-services-gold/10 text-services-gold shadow-soft'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>

            {/* Time selection */}
            <span className="text-[9px] text-zinc-450 uppercase font-black tracking-wider block mb-2 font-heading">Select Time</span>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {times.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-1 text-center font-bold text-xs rounded-button border transition-all ${
                    selectedTime === time
                      ? 'border-services-gold bg-services-gold/10 text-services-gold shadow-soft'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setSelectedServiceIdForBooking(null)}
                className="px-4.5 py-2 border border-zinc-800 text-zinc-450 hover:text-white hover:border-zinc-700 rounded-button text-xs font-semibold"
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
