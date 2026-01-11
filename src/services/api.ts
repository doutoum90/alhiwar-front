import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(init.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${input}`, { ...init, headers });
  if (!res.ok) {
    // remonte l'erreur brute (ton override 401 s'en chargera)
    const msg = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, msg || `${res.status}`);
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// Axios instance si nécessaire pour d'autres parties de l'application
const api = axios.create({
  baseURL: BASE_URL
});

export default api;