import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { PageHeader, EmptyState, PrimaryButton, RatingStars, fieldCls, Badge } from '../../components/dashboard/DashboardUI';
import { Star, Pencil, Trash2, ImagePlus, X, CheckCircle2 } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const { reviews, addReview, updateReview, removeReview } = useCustomer();
  const { cart } = useApp();
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const purchasable = cart.map((i) => i.product);

  const openNew = () => {
    setEditId(null); setProductId(purchasable[0]?.id || ''); setRating(5); setTitle(''); setBody(''); setImages([]); setOpen(true);
  };
  const openEdit = (id: string) => {
    const r = reviews.find((x) => x.id === id);
    if (!r) return;
    setEditId(id); setProductId(r.productId); setRating(r.rating); setTitle(r.title); setBody(r.body); setImages(r.images); setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setIsSubmitting(true);
    const payload = { productId, productName: product.title, productImage: product.image, rating, title, body, images, isVerified: true };
    try {
      if (editId) await updateReview({ ...payload, id: editId, createdAt: reviews.find((x) => x.id === editId)?.createdAt || new Date().toISOString() });
      else await addReview(payload);
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = () => setImages((prev) => [...prev, `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60`]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews & Ratings" subtitle={`${reviews.length} review${reviews.length === 1 ? '' : 's'} you've shared`} actions={<PrimaryButton onClick={openNew}>Write a Review</PrimaryButton>} />

      {reviews.length === 0 && <EmptyState icon={<Star className="w-6 h-6" />} title="No reviews yet" message="Share your experience with products you've bought." />}

      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-brand-border rounded-card shadow-premium p-5">
            <div className="flex items-start gap-4">
              <img src={r.productImage} alt={r.productName} className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-brand-border/50" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sm font-bold text-brand-graphite font-heading">{r.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars value={r.rating} />
                      {r.isVerified && <Badge tone="green"><CheckCircle2 className="w-3 h-3 inline -mt-0.5 mr-0.5" /> Verified Purchase</Badge>}
                    </div>
                  </div>
                  <span className="text-xs text-brand-slate">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {r.title && <p className="text-xs font-extrabold text-brand-graphite mt-2">{r.title}</p>}
                <p className="text-xs text-brand-slate mt-1 leading-relaxed">{r.body}</p>
                {r.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {r.images.map((img, i) => <img key={i} src={img} alt="" className="w-14 h-14 rounded-lg object-cover" />)}
                  </div>
                )}
                <div className="flex gap-2 mt-3 pt-3 border-t border-brand-border/40">
                  <button onClick={() => openEdit(r.id)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-slate hover:text-brand-blue"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => removeReview(r.id)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-slate hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4 pt-16" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-card shadow-elevated max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-brand-graphite font-heading">{editId ? 'Edit Review' : 'Write a Review'}</h3>
              <button onClick={() => setOpen(false)} className="text-brand-slate hover:text-brand-graphite"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase text-brand-slate">Product</label>
              <select className={fieldCls} value={productId} onChange={(e) => setProductId(e.target.value)}>
                {purchasable.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                {!purchasable.some((p) => p.id === productId) && productId && <option value={productId}>Selected product</option>}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase text-brand-slate">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} star`}>
                    <Star className={`w-7 h-7 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase text-brand-slate">Title</label>
              <input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase text-brand-slate">Review</label>
              <textarea className={`${fieldCls} min-h-[90px]`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did you like or dislike?" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-brand-slate">Photos</label>
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={addImage} className="w-14 h-14 rounded-lg border-2 border-dashed border-brand-border flex flex-col items-center justify-center text-brand-slate hover:border-brand-blue hover:text-brand-blue">
                  <ImagePlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 bg-slate-100 rounded-button text-xs font-bold text-brand-slate">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-brand-blue text-white rounded-button text-xs font-bold disabled:opacity-50">{isSubmitting ? 'Saving...' : (editId ? 'Update Review' : 'Submit Review')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
