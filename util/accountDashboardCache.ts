import type { MyPageData } from '../types/mypageTypes';

// Display cache only. Never use these values to authorize spending or access.
const PREFIX = 'tarot-dashboard-v2:';
const TTL = 60_000;
const MAX_AGE = 24 * 60 * 60_000;
type Entry = { at: number; data: MyPageData };
const memory = new Map<string, Entry>();
const pending = new Map<string, Promise<MyPageData>>();
const versions = new Map<string, number>();
let generation = 0;
const today = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
const usable = (entry: Entry | undefined | null) => entry && Date.now() >= entry.at && Date.now() - entry.at < MAX_AGE && entry.data.day === today();

export function readDashboard(id: string): MyPageData | null {
  const entry = memory.get(id);
  return usable(entry) ? entry!.data : null;
}

export function readDashboardSummary(id: string): MyPageData | null {
  const full = readDashboard(id);
  if (full) return full;
  try {
    const entry: Entry | null = JSON.parse(localStorage.getItem(PREFIX + id) || 'null');
    if (!entry || !entry.data || !usable(entry)) return null;
    const d = entry.data;
    if (![d.premium, d.basic, d.ads, d.total].every(n => Number.isFinite(n) && n >= 0)) return null;
    if (d.representativeCard !== null && (!Number.isInteger(d.representativeCard) || d.representativeCard < 0 || d.representativeCard > 77)) return null;
    return { ...d, activities: [], hasMore: false };
  } catch { return null; }
}

export function invalidateDashboard(id: string) {
  versions.set(id, (versions.get(id) || 0) + 1);
  memory.delete(id);
  pending.delete(id);
  try { localStorage.removeItem(PREFIX + id); } catch { /* Storage is optional. */ }
}

export function clearDashboardCache() {
  generation++;
  memory.clear(); pending.clear(); versions.clear();
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) localStorage.removeItem(key);
    }
  } catch { /* Storage is optional. */ }
}

export function loadDashboard(id: string): Promise<MyPageData> {
  const entry = memory.get(id);
  if (usable(entry) && Date.now() - entry!.at < TTL) return Promise.resolve(entry!.data);
  const existing = pending.get(id);
  if (existing) return existing;
  const epoch = generation;
  const version = versions.get(id) || 0;
  const request = (async () => {
    const response = await fetch('/api/account/dashboard', { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) invalidateDashboard(id);
      throw new Error('DASHBOARD_UNAVAILABLE');
    }
    const data: MyPageData = await response.json();
    if (epoch !== generation || version !== (versions.get(id) || 0)) throw new Error('DASHBOARD_CHANGED');
    const at = Date.now();
    memory.set(id, { at, data });
    // Persist only display fields, never history, titles, questions or readings.
    const { representativeCard, premium, basic, ads, exchangeAvailable, day, total, adsAvailable, paymentsAvailable } = data;
    try { localStorage.setItem(PREFIX + id, JSON.stringify({ at, data: { representativeCard, premium, basic, ads, exchangeAvailable, day, total, adsAvailable, paymentsAvailable } })); } catch { /* Storage is optional. */ }
    return data;
  })();
  pending.set(id, request);
  void request.finally(() => { if (pending.get(id) === request) pending.delete(id); }).catch(() => {});
  return request;
}
