const BASE = '';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Entries
export const entriesAPI = {
  list: (params?: { date?: string; accountId?: string; productId?: string }) => {
    const sp = new URLSearchParams();
    if (params?.date) sp.set('date', params.date);
    if (params?.accountId && params.accountId !== 'all') sp.set('accountId', params.accountId);
    if (params?.productId && params.productId !== 'all') sp.set('productId', params.productId);
    const qs = sp.toString();
    return fetchAPI<{ data: any[]; pagination: any }>(`/api/entries${qs ? `?${qs}` : ''}`);
  },
  create: (data: any) => fetchAPI<any>('/api/entries', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI<any>(`/api/entries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI<any>(`/api/entries/${id}`, { method: 'DELETE' }),
};

// Products
export const productsAPI = {
  list: () => fetchAPI<any[]>('/api/products'),
  create: (data: any) => fetchAPI<any>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI<any>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI<any>(`/api/products/${id}`, { method: 'DELETE' }),
};

// Accounts
export const accountsAPI = {
  list: () => fetchAPI<any[]>('/api/accounts'),
  create: (data: any) => fetchAPI<any>('/api/accounts', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI<any>(`/api/accounts/${id}`, { method: 'DELETE' }),
};

// Targets
export const targetsAPI = {
  get: () => fetchAPI<any>('/api/targets'),
  update: (data: any) => fetchAPI<any>('/api/targets', { method: 'PUT', body: JSON.stringify(data) }),
};

// Dashboard
export const dashboardAPI = {
  summary: (params?: { date?: string; accountId?: string; productId?: string }) => {
    const sp = new URLSearchParams();
    if (params?.date) sp.set('date', params.date);
    if (params?.accountId && params.accountId !== 'all') sp.set('accountId', params.accountId);
    if (params?.productId && params.productId !== 'all') sp.set('productId', params.productId);
    const qs = sp.toString();
    return fetchAPI<{ totals: any; rates: any; targets: any }>(`/api/dashboard/summary${qs ? `?${qs}` : ''}`);
  },
};
