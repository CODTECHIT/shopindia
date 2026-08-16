import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { PageHeader, EmptyState, GhostButton } from '../../components/dashboard/DashboardUI';
import { History, ShoppingCart, Heart, Trash2, Search } from 'lucide-react';

const RECENT_SEARCHES = ['iphone 15 pro', 'wireless headphones', 'air conditioner', 'grocery staples', 'men casual shoes'];

export const RecentlyViewedPage: React.FC = () => {
  const { recentlyViewed, toggleWishlist, clearRecentlyViewed, wishlist } = useCustomer();
  const { addToCart } = useApp();
  const { products } = useProducts();
  const items = recentlyViewed.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recently Viewed"
        subtitle="Pick up right where you left off"
        actions={items.length ? <GhostButton onClick={clearRecentlyViewed} className="inline-flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Clear</GhostButton> : undefined}
      />

      {items.length === 0 && (
        <EmptyState icon={<History className="w-6 h-6" />} title="No recently viewed products" message="Products you open will show up here for quick reordering." />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((p) => {
          const isWish = wishlist.includes(p!.id);
          return (
            <div key={p!.id} className="bg-white border border-brand-border rounded-card shadow-premium p-3 flex flex-col hover:shadow-elevated transition-all group">
              <div className="relative">
                <img src={p!.image} alt={p!.title} className="w-full aspect-square object-cover rounded-lg bg-slate-50" loading="lazy" />
                <button onClick={() => toggleWishlist(p!.id)} aria-label="Add to wishlist" className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 shadow-soft flex items-center justify-center transition-colors">
                  <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-red-500 text-red-500' : 'text-brand-slate'}`} />
                </button>
              </div>
              <h3 className="text-xs font-bold text-brand-graphite line-clamp-2 mt-2 font-heading">{p!.title}</h3>
              <p className="text-xs font-extrabold font-numbers text-brand-graphite mt-0.5">₹{p!.price.toLocaleString('en-IN')}</p>
              <button onClick={() => addToCart(p!)} className="mt-2 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-brand-blue/10 text-brand-blue rounded-button text-xs font-bold hover:bg-brand-blue hover:text-white transition-colors">
                <ShoppingCart className="w-3 h-3" /> Buy Again
              </button>
            </div>
          );
        })}
      </div>

      {/* Recently searched */}
      <div className="bg-white border border-brand-border rounded-card shadow-premium p-5">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-brand-blue" />
          <h3 className="font-extrabold text-sm text-brand-graphite font-heading">Recently Searched</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {RECENT_SEARCHES.map((s) => (
            <button key={s} className="px-3 py-1.5 bg-slate-50 border border-brand-border rounded-full text-xs font-medium text-brand-graphite hover:border-brand-blue hover:text-brand-blue transition-colors">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
