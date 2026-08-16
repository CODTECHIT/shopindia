import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { PageHeader, EmptyState } from '../../components/dashboard/DashboardUI';
import { Heart, ShoppingCart, Share2, BellRing, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist } = useCustomer();
  const { addToCart } = useApp();
  const { products } = useProducts();
  const items = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Wishlist"
        subtitle={`${items.length} saved items`}
        actions={items.length ? <button onClick={() => alert('Wishlist link copied (demo).')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-button text-xs font-bold text-brand-graphite"><Share2 className="w-3.5 h-3.5" /> Share Wishlist</button> : undefined}
      />

      {items.length === 0 && (
        <EmptyState icon={<Heart className="w-6 h-6" />} title="Your wishlist is empty" message="Tap the heart on any product to save it here for later." />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p, i) => (
          <motion.div key={p!.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white border border-brand-border rounded-card shadow-premium p-4 flex flex-col hover:shadow-elevated hover:-translate-y-0.5 transition-all">
            <div className="relative">
              <img src={p!.image} alt={p!.title} className="w-full aspect-square object-cover rounded-xl bg-slate-50" loading="lazy" />
              <button onClick={() => toggleWishlist(p!.id)} aria-label="Remove from wishlist" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-soft flex items-center justify-center text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
              {p!.originalPrice > p!.price && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-brand-orange text-white text-xs font-black">
                  {Math.round(((p!.originalPrice - p!.price) / p!.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <h3 className="text-xs font-bold text-brand-graphite line-clamp-2 mt-3 font-heading">{p!.title}</h3>
            <div className="flex items-baseline gap-1.5 mt-1.5 font-numbers">
              <span className="font-extrabold text-brand-graphite">₹{p!.price.toLocaleString('en-IN')}</span>
              {p!.originalPrice > p!.price && <span className="text-xs text-brand-slate line-through">₹{p!.originalPrice.toLocaleString('en-IN')}</span>}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <BellRing className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-brand-slate font-semibold">Price drop & back-in-stock alerts</span>
            </div>

            <div className="mt-3 flex gap-2 pt-3 border-t border-brand-border/50">
              <button onClick={() => addToCart(p!)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-blue text-white rounded-button text-xs font-bold hover:bg-blue-700 transition-colors">
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </button>
              <button onClick={() => alert('Price drop alert enabled (demo).')} aria-label="Enable alert" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-button text-brand-graphite">
                <BellRing className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
