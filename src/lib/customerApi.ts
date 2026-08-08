import { getCustomerToken, API_BASE } from './customerAuth';

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (options.auth !== false) {
    const token = getCustomerToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const customerApi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** Best-effort tracking: fires and forgets, never blocks the UI. */
export function trackEvent(event: string, payload: { entityId?: string; entityType?: string; metadata?: Record<string, unknown>; sessionId?: string } = {}) {
  try {
    const token = getCustomerToken();
    if (!token) return;
    request('/api/customer/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, ...payload, sessionId: payload.sessionId || localStorage.getItem('shopindia_session_id') || undefined }),
    }).catch(() => {});
  } catch {
    // ignore
  }
}
