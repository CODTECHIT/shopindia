import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/mockData';

const RAW_API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_BASE = RAW_API.replace(/\/api\/?$/, '').replace(/\/$/, '');
import { getCustomerToken } from '../lib/customerAuth';

export type VerticalType = 'shop' | 'quick' | 'services';
export type PathType = 'home' | 'search' | 'detail' | 'cart' | 'orders' | 'profile';

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
  status: 'placed' | 'confirmed' | 'packing' | 'shipping' | 'delivered';
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
  placeOrder: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation states
  const [currentPath, setCurrentPath] = useState<PathType>('home');
  const [history, setHistory] = useState<PathType[]>(['home']);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Business vertical
  const [currentVertical, setCurrentVerticalState] = useState<VerticalType>('shop');

  // Location
  const [location, setLocation] = useState<string>('Home - Flat 302, MG Road, Bengaluru');

  // Cart (Persist in LocalStorage)
  const [cart, setCart] = useState<OrderItem[]>(() => {
    const savedCart = localStorage.getItem('shopindia_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Orders (Persist in LocalStorage)
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('shopindia_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('shopindia_cart', JSON.stringify(cart));
  }, [cart]);

  // Save Orders to LocalStorage
  useEffect(() => {
    localStorage.setItem('shopindia_orders', JSON.stringify(orders));
  }, [orders]);

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
  const placeOrder = async () => {
    if (cart.length === 0) return;

    // Estimate delivery time depending on current vertical
    let deliveryTimeEstimate = '';
    if (currentVertical === 'quick') {
      deliveryTimeEstimate = '10 Mins';
    } else if (currentVertical === 'services') {
      deliveryTimeEstimate = 'Tomorrow at 10 AM';
    } else {
      deliveryTimeEstimate = 'Tomorrow, by 12 PM';
    }

    const payload = {
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
      })),
      vertical: currentVertical,
      location,
      paymentMethod: 'COD',
    };

    try {
      const token = getCustomerToken();
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      const newOrder: Order = {
        id: data.orderNumber,
        date: new Date(data.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        items: [...cart],
        total: data.total,
        vertical: currentVertical,
        status: 'placed',
        deliveryTimeEstimate,
        location
      };

      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      navigateTo('orders');
    } catch (err: any) {
      console.error('Order placement failed:', err.message);
      alert('Could not place order. Please try again.');
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
        placeOrder
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
