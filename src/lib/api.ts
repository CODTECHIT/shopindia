/**
 * Minimal fetch wrapper — attaches JWT, handles JSON, throws on error.
 * Falls back to MOCK_DATA when VITE_USE_MOCK=true.
 */

const RAW_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const BASE = RAW_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function getToken(): string | null {
  return localStorage.getItem('shopindia_admin_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ─── Mock data layer (VITE_USE_MOCK=true) ────────────────────────────────────
export const MOCK = {
  adminDashboard: {
    stats: { totalUsers: 1240, totalVendors: 87, totalRiders: 43, totalOrders: 5820, pendingVendors: 12, openTickets: 34, totalRevenue: 2847600 },
    dailyOrders: [
      { _id: '2026-07-25', count: 142, revenue: 87400 },
      { _id: '2026-07-26', count: 165, revenue: 95200 },
      { _id: '2026-07-27', count: 128, revenue: 76800 },
      { _id: '2026-07-28', count: 189, revenue: 112600 },
      { _id: '2026-07-29', count: 201, revenue: 124300 },
      { _id: '2026-07-30', count: 178, revenue: 108700 },
      { _id: '2026-07-31', count: 224, revenue: 138900 },
    ],
  },
  vendors: [
    { _id: 'v1', businessName: 'TechZone Electronics', email: 'tz@example.com', phone: '9876543210', approvalStatus: 'pending',  commissionRate: 10, createdAt: '2026-07-30' },
    { _id: 'v2', businessName: 'FreshMart Groceries',  email: 'fm@example.com', phone: '9123456789', approvalStatus: 'approved', commissionRate: 8,  createdAt: '2026-07-28' },
    { _id: 'v3', businessName: 'CoolAir HVAC',         email: 'ca@example.com', phone: '9988776655', approvalStatus: 'approved', commissionRate: 12, createdAt: '2026-07-25' },
    { _id: 'v4', businessName: 'StyleHub Fashion',     email: 'sh@example.com', phone: '9871234560', approvalStatus: 'rejected', commissionRate: 10, createdAt: '2026-07-20' },
  ],
  orders: [
    { _id: 'o1', orderNumber: 'OD17220001', status: 'placed',     type: 'traditional',   total: 2499, customerId: { name: 'Priya S', email: 'priya@x.com' }, createdAt: '2026-07-31' },
    { _id: 'o2', orderNumber: 'OD17220002', status: 'packing',    type: 'quick_commerce',total: 399,  customerId: { name: 'Arjun M', email: 'arjun@x.com' }, createdAt: '2026-07-31' },
    { _id: 'o3', orderNumber: 'OD17220003', status: 'delivered',  type: 'traditional',   total: 1899, customerId: { name: 'Sneha R', email: 'sneha@x.com' }, createdAt: '2026-07-30' },
    { _id: 'o4', orderNumber: 'OD17220004', status: 'cancelled',  type: 'hvac_service',  total: 5000, customerId: { name: 'Rahul K', email: 'rahul@x.com' }, createdAt: '2026-07-29' },
  ],
  tickets: [
    { _id: 't1', ticketNumber: 'TKT001', subject: 'Order not delivered', priority: 'high',   status: 'open',        customerId: { name: 'Priya S' }, createdAt: '2026-07-31' },
    { _id: 't2', ticketNumber: 'TKT002', subject: 'Wrong item received',  priority: 'medium', status: 'in_progress', customerId: { name: 'Arjun M' }, createdAt: '2026-07-30' },
    { _id: 't3', ticketNumber: 'TKT003', subject: 'Refund not processed', priority: 'urgent', status: 'open',        customerId: { name: 'Sneha R' }, createdAt: '2026-07-30' },
  ],
  branches: [
    { _id: 'b1', name: 'Bengaluru HQ', code: 'BLR-01', city: 'Bengaluru', managerId: { name: 'Kiran BM' }, isActive: true },
    { _id: 'b2', name: 'Mumbai Branch', code: 'MUM-01', city: 'Mumbai',   managerId: { name: 'Vijay BM' }, isActive: true },
  ],
  serviceAreas: [
    { _id: 'sa1', name: 'Koramangala Zone', city: 'Bengaluru', pincodes: ['560034','560095'], isActive: true,  deliveryType: 'both' },
    { _id: 'sa2', name: 'Bandra Zone',      city: 'Mumbai',    pincodes: ['400050','400051'], isActive: true,  deliveryType: 'quick_commerce' },
    { _id: 'sa3', name: 'Whitefield Zone',  city: 'Bengaluru', pincodes: ['560066','560067'], isActive: false, deliveryType: 'traditional' },
  ],
  vendorDashboard: {
    totalOrders: 142, pendingOrders: 18, revenue: 284760, walletBalance: 22400,
    recentOrders: [
      { _id: 'o1', orderNumber: 'OD17220001', status: 'placed',  total: 2499, customerId: { name: 'Priya S' }, createdAt: '2026-07-31' },
      { _id: 'o2', orderNumber: 'OD17220002', status: 'packing', total: 399,  customerId: { name: 'Arjun M' }, createdAt: '2026-07-31' },
    ],
  },
  vendorProducts: [
    { _id: 'p1', name: 'Samsung 1.5T Split AC', basePrice: 34999, stock: 12, isOutOfStock: false, status: 'active',   fulfillmentType: 'traditional' },
    { _id: 'p2', name: 'LG Window AC 1T',       basePrice: 28499, stock: 0,  isOutOfStock: true,  status: 'active',   fulfillmentType: 'traditional' },
    { _id: 'p3', name: 'AC Service Kit',         basePrice: 799,   stock: 50, isOutOfStock: false, status: 'inactive', fulfillmentType: 'quick_commerce' },
  ],
  vendorAnalytics: {
    allTime: { total: 284760, count: 142 },
    period:  { total: 48200,  count: 24  },
    topProducts: [
      { name: 'Samsung 1.5T Split AC', revenue: 174995, sold: 5 },
      { name: 'LG Window AC 1T',       revenue: 113996, sold: 4 },
    ],
    dailyRevenue: [
      { _id: '2026-07-25', revenue: 5999, orders: 3 },
      { _id: '2026-07-26', revenue: 8499, orders: 4 },
      { _id: '2026-07-27', revenue: 6200, orders: 3 },
      { _id: '2026-07-28', revenue: 9800, orders: 5 },
      { _id: '2026-07-29', revenue: 7400, orders: 4 },
      { _id: '2026-07-30', revenue: 5300, orders: 2 },
      { _id: '2026-07-31', revenue: 5002, orders: 3 },
    ],
  },
};

export { USE_MOCK };
