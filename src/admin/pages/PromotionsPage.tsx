import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Image as ImageIcon, Plus, Trash2, Power, Eye } from 'lucide-react';

export const PromotionsPage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', vertical: 'shop', isActive: true });

  const load = () => {
    setLoading(true);
    api.get<{ banners: any[] }>('/api/admin/banners')
      .then(d => setBanners(d.banners))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/banners', form);
      setShowForm(false);
      setForm({ title: '', subtitle: '', image: '', vertical: 'shop', isActive: true });
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post<{ imageUrl: string }>('/api/admin/banners/upload-image', formData);
      setForm({ ...form, image: res.imageUrl });
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/api/admin/banners/${id}/toggle`, {});
      load();
    } catch (err: any) { alert(err.message); }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await api.delete(`/api/admin/banners/${id}`);
      load();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotional Banners</h1>
          <p className="text-sm text-gray-500">Manage the hero banners shown on the frontend</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#0F2C59] text-white rounded-xl shadow hover:opacity-90 transition-opacity">
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">Create New Promotion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Title (Optional)</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Summer Sale" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle (Optional)</label>
              <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Up to 50% off!" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">Banner Image (Required)</label>
              
              <div className="flex items-center gap-4">
                {form.image && (
                  <div className="w-24 h-16 rounded overflow-hidden border border-gray-200">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                  {uploading && <p className="text-xs text-blue-600 mt-1 animate-pulse">Uploading to S3...</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <hr className="flex-1 border-gray-100" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">OR PASTE URL</span>
                <hr className="flex-1 border-gray-100" />
              </div>
              <input type="url" required value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vertical Target</label>
              <select value={form.vertical} onChange={e => setForm({ ...form, vertical: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="shop">Main Shop</option>
                <option value="quick">Quick Commerce (10 Min)</option>
                <option value="services">Home Services</option>
              </select>
            </div>
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium">Activate immediately</span>
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Save Banner</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No Banners Found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">You haven't created any promotional banners yet. Create one to display on the storefront!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className={`bg-white rounded-2xl overflow-hidden border ${banner.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-100 shadow-none opacity-75'}`}>
              <div className="aspect-[16/6] bg-gray-100 relative">
                {banner.image ? (
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-gray-300" size={32}/></div>
                )}
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-1 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{banner.title || 'Untitled'}</h3>
                    {banner.subtitle && <p className="text-xs text-gray-500">{banner.subtitle}</p>}
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{banner.vertical}</span>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button onClick={() => toggleStatus(banner.id)} className={`flex-1 py-1.5 flex justify-center items-center gap-1.5 rounded-lg text-xs font-bold border transition-colors ${banner.isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                    {banner.isActive ? <><Power size={14}/> Disable</> : <><Eye size={14}/> Enable</>}
                  </button>
                  <button onClick={() => deleteBanner(banner.id)} className="px-3 py-1.5 flex justify-center items-center rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
