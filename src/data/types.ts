export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  ratingCount: number;
  image: string;
  category: string;
  brand: string;
  vertical: 'shop' | 'quick' | 'services';
  specs?: Record<string, string>;
  deliveryTime?: string;
  isAssured?: boolean;
  quantity?: number;
  stock?: number;
  isOutOfStock?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  vertical: 'shop' | 'quick' | 'services';
}

export const CATEGORIES: Category[] = [];

export const PRODUCTS: Product[] = [];

export const BANNERS: any[] = [];
