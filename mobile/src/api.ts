import { auth } from './firebase';
import { StaffMember } from './quasarData';
import { CartItem } from './CartContext';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getIdToken(): Promise<string | null> {
  const user = auth?.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export async function apiGet(path: string, requiresAuth = false): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = await getIdToken();
    if (!token) throw new ApiError(401, 'Not signed in');
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (json as Record<string, string>)?.error || `Request failed: ${res.status}`);
  return json;
}

export async function apiPatch(path: string, body: unknown, requiresAuth = false): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = await getIdToken();
    if (!token) throw new ApiError(401, 'Not signed in');
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (json as Record<string, string>)?.error || `Request failed: ${res.status}`);
  return json;
}

export async function apiPost(path: string, body: unknown, requiresAuth = false): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = await getIdToken();
    if (!token) throw new ApiError(401, 'Not signed in');
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (json as Record<string, string>)?.error || `Request failed: ${res.status}`);
  return json;
}

/** ── Quasar Salon helpers ── */

/** Fetch all staff from the backend. Throws if API unavailable. */
export async function fetchAllStaff(): Promise<StaffMember[]> {
  const data = await apiGet('/staff');
  return data as StaffMember[];
}

export interface SlotAvailability {
  staffId: string;
  date: string;
  slots: string[];
}

/**
 * Fetch available start slots for a single staff member on a date (YYYY-MM-DD).
 * Pass `duration` (minutes) to get only slots with enough consecutive windows.
 */
export async function fetchStaffSlots(staffId: string, date: string, duration?: number): Promise<SlotAvailability> {
  const durationParam = duration ? `&duration=${duration}` : '';
  const data = await apiGet(`/staff/${staffId}/availability?date=${date}${durationParam}`);
  return data as SlotAvailability;
}

export interface QuasarBookingPayload {
  staffId: string;
  timeSlot: string;
  date: string;
  dateLabel: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    durationMins: number;
    category: string;
    qty: number;
  }>;
  total: number;
}

export interface QuasarBookingResult {
  id: string;
  status: string;
  staffId: string;
  timeSlot: string;
  date: string;
  dateLabel: string;
  total: number;
}

/** Create a Quasar Salon booking via the backend (requires auth). */
export async function createQuasarBooking(payload: QuasarBookingPayload): Promise<QuasarBookingResult> {
  const result = await apiPost('/bookings', payload, true);
  return result as QuasarBookingResult;
}

/** Build the payload from cart items + booking details. */
export function buildQuasarBookingPayload(
  items: CartItem[],
  staffId: string,
  timeSlot: string,
  dateIso: string,
  dateLabel: string,
  total: number
): QuasarBookingPayload {
  return {
    staffId,
    timeSlot,
    date: dateIso,
    dateLabel,
    services: items.map(item => ({
      id: item.service.id,
      name: item.service.name,
      price: item.service.price,
      durationMins: item.service.durationMins,
      category: item.category.name,
      qty: item.qty,
    })),
    total,
  };
}
