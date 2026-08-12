import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/types';

const RAW_API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_BASE = RAW_API.replace(/\/api\/?$/, '').replace(/\/$/, '');
import { api } from '../lib/api';
import { getCustomerToken } from '../lib/customerAuth';

export type VerticalType = 'shop' | 'quick' | 'services';
export type PathType = 'home' | 'search' | 'detail' | 'cart' | 'orders' | 'profile' | 'dashboard';

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  vertical: VerticalType;
  status: 'placed' | 'confirmed' | 'packing' | 'shipping' | 'delivered' | 'cancelled';
  deliveryTimeEstimate: string;
  location: string;
}

interface AppContextType {
  currentVertical: VerticalType;
  setCurrentVertical: (vertical: VerticalType) => void;
  currentPath: PathType;
  navigateTo: (path: PathType, productId?: string) => void;
  goBack: () => void;
  history: PathType[];
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  cart: OrderItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  orders: Order[];
  placeOrder: (payload: { addressId: string; paymentMethodId: string; items: any[]; total: number }) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation states
  const [currentPath, setCurrentPath] = useState<PathType>(() => {
    const h = window.location.hash;
    if (h.startsWith('#/dashboard') || h.startsWith('#/account')) return 'dashboard';
    if (h.startsWith('#/profile')) return 'profile';
    if (h.startsWith('#/orders')) return 'orders';
    if (h.startsWith('#/cart')) return 'cart';
    if (h.startsWith('#/search')) return 'search';
    return 'home';
  });
  const [history, setHistory] = useState<PathType[]>([currentPath]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Business vertical
  const [currentVertical, setCurrentVerticalState] = useState<VerticalType>('shop');

  // Location
  const [location, setLocation] = useState<string>('Home - Flat 302, MG Road, Bengaluru');

  // Cart
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch initial data from API
  useEffect(() => {
    const fetchAppData = async () => {
      const token = getCustomerToken();
      if (!token) return;
      try {
        const [cartRes, ordersRes] = await Promise.allSettled([
          api.get<{ cart: OrderItem[] }>('/api/cart').catch(() => null),
          api.get<{ orders: Order[] }>('/api/orders').catch(() => null)
        ]);

        if (cartRes.status === 'fulfilled' && cartRes.value?.cart) setCart(cartRes.value.cart);
        if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) setOrders(ordersRes.value.orders);
      } catch (err) {
        console.error('Failed to fetch App data', err);
      }
    };
    fetchAppData();
    
    const handleHash = () => {
      const h = window.location.hash;
      if (h.startsWith('#/dashboard') || h.startsWith('#/account')) setCurrentPath('dashboard');
      else if (h.startsWith('#/profile')) setCurrentPath('profile');
      else if (h.startsWith('#/orders')) setCurrentPath('orders');
      else if (h.startsWith('#/cart')) setCurrentPath('cart');
      else if (h.startsWith('#/search')) setCurrentPath('search');
      else if (h === '' || h === '#/') setCurrentPath('home');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Handle live order status simulation for 10-Min and Services
  useEffect(() => {
    const activeOrders = orders.filter(o => o.status !== 'delivered');
    if (activeOrders.length === 0) return;

    const interval = setInterval(() => {
      setOrders(prevOrders => {
        let changed = false;
        const newOrders = prevOrders.map(order => {
          if (order.status === 'delivered') return order;

          changed = true;
          let nextStatus: Order['status'] = order.status;

          // Transition states sequentially
          if (order.status === 'placed') nextStatus = 'confirmed';
          else if (order.status === 'confirmed') nextStatus = 'packing';
          else if (order.status === 'packing') nextStatus = 'shipping';
          else if (order.status === 'shipping') nextStatus = 'delivered';

          return { ...order, status: nextStatus };
        });

        return changed ? newOrders : prevOrders;
      });
    }, 15000); // Progress order state every 15 seconds

    return () => clearInterval(interval);
  }, [orders]);

  // Custom Navigation function
  const navigateTo = (path: PathType, productId?: string) => {
    if (productId) {
      setSelectedProductId(productId);
    }
    setHistory(prev => [...prev, path]);
    setCurrentPath(path);
    if (path !== 'detail' && path !== 'home') {
      window.location.hash = `#/${path}`;
    } else if (path === 'home') {
      window.location.hash = '';
    }
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current path
      const prevPath = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPath(prevPath);
    } else {
      setCurrentPath('home');
    }
  };

  const setCurrentVertical = (vertical: VerticalType) => {
    setCurrentVerticalState(vertical);
    // When changing verticals on mobile/desktop, go back to home to display the correct feed
    setCurrentPath('home');
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  // Order placement (persists to the backend API)
  const placeOrder = async (payload: { addressId: string; paymentMethodId: string; items: any[]; total: number }) => {
    try {
      await api.post('/api/orders', payload);
      // Fetch orders again to get the new order
      const res = await api.get<{ orders: Order[] }>('/api/customer/orders');
      if (res.orders) setOrders(res.orders);
      clearCart();
      navigateTo('orders');
    } catch (err) {
      console.error('Failed to place order', err);
      throw err;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const token = getCustomerToken();
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error('Cancel failed');
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = getCustomerToken();
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentVertical,
        setCurrentVertical,
        currentPath,
        navigateTo,
        goBack,
        history,
        selectedProductId,
        setSelectedProductId,
        searchQuery,
        setSearchQuery,
        location,
        setLocation,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        orders,
        placeOrder,
        cancelOrder,
        updateOrderStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

