import { useState, useEffect } from 'react';
import type { Product } from '../data/types';

const RAW_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const BASE = RAW_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE}/api/products`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error('Error fetching products:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
