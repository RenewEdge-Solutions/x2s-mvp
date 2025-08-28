const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = {
  async login(username: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  async verify2FA(code: string) {
    const res = await fetch(`${API}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error('2FA failed');
    return res.json();
  },
  getPlants() {
    return fetch(`${API}/plants`).then((r) => r.json());
  },
  createPlant(data: { strain: string; location: string; by?: string }) {
    return fetch(`${API}/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getHarvests() {
    return fetch(`${API}/harvests`).then((r) => r.json());
  },
  createHarvest(data: { plantId: string; yieldGrams: number; status: 'drying' | 'dried'; by?: string }) {
    return fetch(`${API}/harvests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getLifecycle() {
    return fetch(`${API}/lifecycle`).then((r) => r.json());
  },
  getIntegrity() {
    return fetch(`${API}/integrity`).then((r) => r.json());
  },
};
