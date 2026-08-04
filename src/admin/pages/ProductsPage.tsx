import React, { useEffect, useState } from 'react';
import { api, USE_MOCK } from '../../lib/api';
import { Search, Trash2 } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    if (USE_MOCK) {
      setProducts([
        { _id: 'p1', name: 'Samsung 1.5T Split AC', basePrice: 34999, stock: 12, isOutOfStock: false, status: 'active', fulfillmentType: 'traditional', vendorId: { businessName: 'Demo Electronics' } },
        { _id: 'p2', name: 'LG Window AC 1T', basePrice: 28499, stock: 0, isOutOfStock: true, status: 'active', fulfillmentType: 'traditional', vendorId: { businessName: 'CoolAir HVAC' } },
        { _id: 'p3', name: 'AC Service Kit', basePrice: 799, stock: 50, isOutOfStock: false, status: 'inactive', fulfillmentType: 'quick_commerce', vendorId: { businessName: 'FreshMart Groceries' } },
      ]);
      setLoading(false);
    } else {
      api.get<{ products: any[] }>(`/api/admin/products?q=${q}`)
        .then(d => setProducts(d.products))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      if (USE_MOCK) {
        setProducts(p => p.filter(x => x._id !== id));
      } else {
        await api.delete(`/api/admin/products/${id}`);
        load();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = products.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product & Catalog Management</h1>
          <p className="text-sm text-gray-500">Monitor and curate marketplace catalog products (FR-05.3)</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Product</th>
              <th className="px-5 py-3.5 font-semibold">Vendor</th>
              <th className="px-5 py-3.5 font-semibold">Price</th>
              <th className="px-5 py-3.5 font-semibold">Stock</th>
              <th className="px-5 py-3.5 font-semibold">Type</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 skeleton-shimmer rounded" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No products found.</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id || p._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-semibold text-gray-900">{p.name}</td>
                  <td className="px-5 py-4 text-gray-600">{p.vendor?.businessName || p.vendorId?.businessName || '—'}</td>
                  <td className="px-5 py-4 font-numbers font-medium text-gray-900">₹{p.basePrice}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${p.isOutOfStock ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {p.isOutOfStock ? 'Out of Stock' : `${p.stock} units`}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="capitalize text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {p.fulfillmentType?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${p.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDelete(p.id || p._id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
