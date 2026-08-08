import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { PageHeader, EmptyState, GhostButton } from '../../components/dashboard/DashboardUI';
import { Bookmark, Heart, X, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackEvent } from '../../lib/customerApi';

export const SavedForLaterPage: React.FC = () => {
  const { savedForLater, moveToCart, moveToWishlist, removeSaved } = useCustomer();
  const { addToCart } = useApp();
  const { products } = useProducts();
  const items = savedForLater.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader title="Saved For Later" subtitle={`${items.length} item${items.length === 1 ? '' : 's'} parked outside your cart`} />

      {items.length === 0 && (
        <EmptyState icon={<Bookmark className="w-6 h-6" />} title="Nothing saved for later" message="Save products from your cart to revisit them later without losing them." />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p, i) => (
          <motion.div key={p!.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white border border-brand-border rounded-card shadow-premium p-4 flex flex-col hover:shadow-elevated transition-all">
            <div className="relative">
              <img src={p!.image} alt={p!.title} className="w-full aspect-square object-cover rounded-xl bg-slate-50" loading="lazy" />
              <button onClick={() => { removeSaved(p!.id); }} aria-label="Remove" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-soft flex items-center justify-center text-brand-slate hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xs font-bold text-brand-graphite line-clamp-2 mt-3 font-heading">{p!.title}</h3>
            <p className="text-sm font-extrabold font-numbers text-brand-graphite mt-1">₹{p!.price.toLocaleString('en-IN')}</p>

            <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-brand-border/50">
              <button onClick={() => { addToCart(p!); moveToCart(p!.id); trackEvent('ADDED_TO_CART', { entityId: p!.id, entityType: 'product' }); alert(`${p!.title} moved to cart.`); }} className="flex justify-center gap-1.5 px-3 py-2 bg-brand-blue text-white rounded-button text-xs font-bold hover:bg-blue-700 transition-colors">
                <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
              </button>
              <div className="flex gap-2">
                <GhostButton onClick={() => moveToWishlist(p!.id)} className="flex-1 justify-center inline-flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Wishlist
                </GhostButton>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
