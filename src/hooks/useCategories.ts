import { useState, useEffect } from 'react';
import { CATEGORIES } from '../data/mockData';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

const RAW_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const BASE = RAW_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');

/** Fetches live categories from the API. Falls back to the static mock list on error. */
export const useCategories = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE}/api/categories`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!active) return;
        setCategories(data);
        setError(null);
      } catch (err: any) {
        if (!active) return;
        console.error('Error fetching categories, using mock:', err.message);
        setError(err.message);
        setCategories(
          CATEGORIES.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.id,
            vertical: c.vertical,
            image: c.image,
            sortOrder: 0,
            isActive: true,
            productCount: 0,
          })),
        );
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCategories();
    return () => { active = false; };
  }, []);

  return { categories, loading, error };
};