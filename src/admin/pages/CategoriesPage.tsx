import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

const VERTICALS = ['shop', 'quick', 'services'];

export const CategoriesPage: React.FC = () => {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', vertical: 'shop', image: '', slug: '' });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCats = cats.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.vertical.toLowerCase().includes(search.toLowerCase())
  );

  const nameMatches = form.name.trim().length > 1 ? cats.filter(c => 
    c.name.toLowerCase().includes(form.name.toLowerCase()) && c.id !== editing?.id
  ) : [];

  const load = () => {
    setLoading(true);
    api.get<Category[]>('/api/admin/categories')
      .then(d => setCats(Array.isArray(d) ? d : (d as any).categories || []))
      .catch(err => {
        if (!err.message.includes('Not Found') && !err.message.includes('404')) {
          alert(err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', vertical: 'shop', image: '', slug: '' }); setError(null); setModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, vertical: c.vertical, image: c.image || '', slug: c.slug || '' }); setError(null); setModal(true); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/api/admin/categories/upload-image', fd) as any;
      setForm(prev => ({ ...prev, image: res.imageUrl }));
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload: any = { name: form.name, vertical: form.vertical, image: form.image || null, slug: form.slug || null };
      if (editing) {
        await api.patch(`/api/admin/categories/${editing.id}`, payload);
      } else {
        await api.post('/api/admin/categories', payload);
      }
      setModal(false);
      load();
    } catch (err: any) { setError(err.message); }
  };

  const toggle = async (id: string) => {
    try { await api.patch(`/api/admin/categories/${id}/toggle`, {}); load(); }
    catch (err: any) { alert(err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category? Products will become uncategorized.')) return;
    try { await api.delete(`/api/admin/categories/${id}`); load(); }
    catch (err: any) { alert(err.message); }
  };

  const color: Record<string, string> = {
    shop: 'bg-blue-50 text-blue-700',
    quick: 'bg-emerald-50 text-emerald-700',
    services: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">Manage storefront categories across Shop, Quick Commerce & Services</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button onClick={() => { openCreate(); if(search) setForm(prev => ({ ...prev, name: search })); }} className="flex items-center gap-2 px-4 py-2 bg-[#0F2C59] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3d73] whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold">Category</th>
              <th className="text-left px-5 py-3.5 font-semibold">Vertical</th>
              <th className="text-left px-5 py-3.5 font-semibold">Products</th>
              <th className="text-left px-5 py-3.5 font-semibold">Status</th>
              <th className="text-left px-5 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              ))
            ) : cats.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">No categories yet. Create one.</td></tr>
            ) : filteredCats.length === 0 && search ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  <p className="mb-4">No category found matching "{search}".</p>
                  <button onClick={() => { openCreate(); setForm(prev => ({ ...prev, name: search })); }} className="px-4 py-2 bg-[#0F2C59] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3d73]">
                    Create "{search}"
                  </button>
                </td>
              </tr>
            ) : filteredCats.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {c.image ? <img src={c.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-100" /> : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">{c.name[0]}</div>}
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 capitalize">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${color[c.vertical] ?? 'bg-gray-100 text-gray-600'}`}>{c.vertical}</span>
                </td>
                <td className="px-5 py-4 text-gray-600 font-numbers">{c._count?.products ?? 0}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Inactive (Hidden)'}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggle(c.id)} title="Toggle active" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">{c.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    <button onClick={() => openEdit(c)} title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => remove(c.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={save} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">{editing ? 'Edit Category' : 'Add Category'}</h3>
            {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">{error}</div>}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mobiles & Tablets" className="w-full px-3 py-2 border rounded-xl text-sm" />
              {nameMatches.length > 0 && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex flex-col gap-1">
                  <span className="font-semibold">Similar existing categories:</span>
                  <ul className="list-disc pl-4 opacity-80">
                    {nameMatches.map(c => <li key={c.id}>{c.name} <span className="capitalize">({c.vertical})</span></li>)}
                  </ul>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Vertical</label>
                <select value={form.vertical} onChange={e => setForm({ ...form, vertical: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm capitalize">
                  {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Slug (optional)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto" className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category Image (S3 Upload)</label>
              <div className="flex items-center gap-4">
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover border" />
                )}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                </div>
              </div>
              {uploading && <p className="text-xs text-blue-600 mt-1">Uploading to S3...</p>}
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-[#0F2C59] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3d73] disabled:opacity-50">{editing ? 'Save' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};