import React, { useEffect, useState } from 'react';
import { api, MOCK, USE_MOCK } from '../../lib/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const VendorProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q] = useState('');

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [fulfillmentType, setFulfillmentType] = useState('traditional');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    if (USE_MOCK) {
      setProducts(MOCK.vendorProducts);
      setLoading(false);
    } else {
      api.get<{ products: any[] }>('/api/vendor/products')
        .then(d => setProducts(d.products))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (USE_MOCK) return;
    api.get<any[]>('/api/categories')
      .then(setCategories)
      .catch(console.error);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName(''); setPrice(0); setStock(10);
    setFulfillmentType('traditional'); setCategoryId(''); setImageFile(null);
  };

  const openAdd = () => { resetForm(); setModal(true); };

  const openEdit = (p: any) => {
    setEditingId(p.id || p._id);
    setName(p.name);
    setPrice(Number(p.basePrice || 0));
    setStock(Number(p.stock || 0));
    setFulfillmentType(p.fulfillmentType || 'traditional');
    setCategoryId(p.categoryId || '');
    setImageFile(null);
    setModal(true);
  };

  const toggleStock = async (id: string, currentOut: boolean) => {
    try {
      if (USE_MOCK) {
        setProducts(prev => prev.map(p => p._id === id ? { ...p, isOutOfStock: !currentOut } : p));
      } else {
        await api.patch(`/api/vendor/products/${id}/stock`, { isOutOfStock: !currentOut });
        load();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImageUpload = async (): Promise<string> => {
    if (!imageFile || USE_MOCK) return '';
    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    const token = localStorage.getItem('shopindia_admin_token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const uploadRes = await fetch(`${API_BASE}/api/vendor/products/upload-image`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    });
    if (!uploadRes.ok) throw new Error('Image upload failed');
    const uploadData = await uploadRes.json();
    setUploading(false);
    return uploadData.url;
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name, basePrice: price, stock, fulfillmentType };
      if (categoryId) payload.categoryId = categoryId;
      let imageUrl = '';
      if (imageFile && !USE_MOCK) imageUrl = await handleImageUpload();
      if (imageUrl) payload.images = [imageUrl];

      if (USE_MOCK) {
        if (editingId) {
          setProducts(prev => prev.map(p => (p.id || p._id) === editingId ? { ...p, ...payload } : p));
        } else {
          setProducts(prev => [...prev, { _id: 'vp' + Date.now(), ...payload, isOutOfStock: false, status: 'active' }]);
        }
      } else if (editingId) {
        await api.put(`/api/vendor/products/${editingId}`, payload);
      } else {
        await api.post('/api/vendor/products', payload);
      }

      setModal(false);
      resetForm();
      load();
    } catch (err: any) {
      setUploading(false);
      alert(err.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? It will be removed from the catalog.')) return;
    try {
      if (USE_MOCK) {
        setProducts(prev => prev.filter(p => (p.id || p._id) !== id));
      } else {
        await api.delete(`/api/vendor/products/${id}`);
        load();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = products.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Products</h1>
          <p className="text-sm text-gray-500">Manage catalog, pricing, variants, and stock status (FR-02.2)</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#059669]"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Product Name</th>
              <th className="px-5 py-3.5 font-semibold">Price</th>
              <th className="px-5 py-3.5 font-semibold">Stock</th>
              <th className="px-5 py-3.5 font-semibold">Channel</th>
              <th className="px-5 py-3.5 font-semibold">Stock Status</th>
              <th className="px-5 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              ))
            ) : filtered.map(p => (
              <tr key={p.id || p._id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />}
                    <span className="font-semibold text-gray-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-numbers font-medium text-gray-900">₹{p.basePrice}</td>
                <td className="px-5 py-4 font-numbers text-gray-600">{p.stock} units</td>
                <td className="px-5 py-4 capitalize text-xs font-medium text-gray-500">{p.fulfillmentType?.replace('_', ' ')}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleStock(p.id || p._id, p.isOutOfStock)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                      p.isOutOfStock ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {p.isOutOfStock ? 'Mark In-Stock' : 'In Stock (Click to Mark Out)'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(p)} title="Edit" className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProduct(p.id || p._id)} title="Delete" className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={saveProduct} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Product Title</label>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Split AC Filter" className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Price (₹)</label>
              <input type="number" required value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-sm font-numbers" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stock</label>
              <input type="number" required value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-sm font-numbers" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fulfillment Channel</label>
              <select value={fulfillmentType} onChange={e => setFulfillmentType(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm">
                <option value="traditional">Traditional E-Commerce</option>
                <option value="quick_commerce">Quick Commerce (Instant)</option>
                <option value="hvac">HVAC Service & Parts</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm">
                <option value="">Uncategorized</option>
                {categories.filter((c: any) => !c.vertical || c.vertical === (fulfillmentType === 'quick_commerce' ? 'quick' : fulfillmentType === 'hvac' ? 'services' : 'shop')).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Product Image</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setModal(false); resetForm(); }} className="flex-1 py-2 border rounded-xl text-sm" disabled={uploading}>Cancel</button>
              <button type="submit" disabled={uploading} className="flex-1 py-2 bg-[#10B981] text-white rounded-xl text-sm font-semibold hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? 'Uploading...' : editingId ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};