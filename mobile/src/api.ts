import { auth } from './firebase';
import { StaffMember } from './quasarData';
import { CartItem, Guest } from './CartContext';

function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) return `${envUrl.replace(/\/$/, '')}/api`;
  if (typeof window !== 'undefined') return '/api';
  return '/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

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

async function buildHeaders(requiresAuth: boolean, extra?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(extra ?? {}) };
  if (requiresAuth) {
    const token = await getIdToken();
    if (!token) throw new ApiError(401, 'Not signed in');
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(res: Response): Promise<unknown> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, (json as Record<string, string>)?.error || `Request failed: ${res.status}`);
  }
  return json;
}

export async function apiGet(path: string, requiresAuth = false): Promise<unknown> {
  const headers = await buildHeaders(requiresAuth);
  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  return parseResponse(res);
}

export async function apiPatch(path: string, body: unknown, requiresAuth = false): Promise<unknown> {
  const headers = await buildHeaders(requiresAuth);
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  return parseResponse(res);
}

export async function apiPost(path: string, body: unknown, requiresAuth = false, extraHeaders?: Record<string, string>): Promise<unknown> {
  const headers = await buildHeaders(requiresAuth, extraHeaders);
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return parseResponse(res);
}

export async function apiPut(path: string, body: unknown, requiresAuth = false): Promise<unknown> {
  const headers = await buildHeaders(requiresAuth);
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'PUT', headers, body: JSON.stringify(body) });
  return parseResponse(res);
}

export async function apiDelete(path: string, requiresAuth = false): Promise<unknown> {
  const headers = await buildHeaders(requiresAuth);
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', headers });
  return parseResponse(res);
}

/** ── User profile helpers ── */

export interface UserProfileUpdates {
  name?: string;
  phone?: string;
  photoUrl?: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  role?: string;
}

export async function getMyProfile(): Promise<UserProfile> {
  const data = await apiGet('/users/me', true);
  return data as UserProfile;
}

export async function updateUserProfile(updates: UserProfileUpdates): Promise<unknown> {
  return apiPut('/users/me', updates, true);
}

export async function deleteAccount(): Promise<void> {
  await apiDelete('/users/me', true);
}

/** ── Admin helpers ── */

export async function adminLogin(password: string): Promise<void> {
  await apiPost('/admin/login', { password }, false);
}

export interface UploadStaffPhotoResult {
  photoUrl: string;
}

export async function uploadStaffPhoto(
  staffId: string,
  adminPassword: string,
  imageBase64: string,
  contentType: string
): Promise<UploadStaffPhotoResult> {
  const result = await apiPost(
    `/admin/staff/${encodeURIComponent(staffId)}/photo`,
    { imageBase64, contentType },
    false,
    { 'x-admin-password': adminPassword }
  );
  return result as UploadStaffPhotoResult;
}

/** ── Quasar Salon helpers ── */

export async function fetchAllStaff(): Promise<StaffMember[]> {
  const data = await apiGet('/staff');
  return data as StaffMember[];
}

export interface SlotAvailability {
  staffId: string;
  date: string;
  slots: string[];
}

export async function fetchStaffSlots(staffId: string, date: string, duration?: number): Promise<SlotAvailability> {
  const durationParam = duration ? `&duration=${duration}` : '';
  const data = await apiGet(`/staff/${staffId}/availability?date=${date}${durationParam}`);
  return data as SlotAvailability;
}

export interface QuasarServicePayloadItem {
  id: string;
  name: string;
  price: number;
  durationMins: number;
  category: string;
  qty: number;
}

export interface QuasarBookingPayload {
  staffId: string;
  timeSlot: string;
  date: string;
  dateLabel: string;
  services: QuasarServicePayloadItem[];
  guests: Array<{ name: string; services: QuasarServicePayloadItem[] }>;
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

export async function createQuasarBooking(payload: QuasarBookingPayload): Promise<QuasarBookingResult> {
  const result = await apiPost('/bookings', payload, true);
  return result as QuasarBookingResult;
}

function cartItemToPayloadItem(item: CartItem): QuasarServicePayloadItem {
  return {
    id: item.service.id,
    name: item.service.name,
    price: item.service.price,
    durationMins: item.service.durationMins,
    category: item.category.name,
    qty: item.qty,
  };
}

export function buildQuasarBookingPayload(
  guests: Guest[],
  staffId: string,
  timeSlot: string,
  dateIso: string,
  dateLabel: string,
  total: number
): QuasarBookingPayload {
  const guestsPayload = guests
    .filter(g => g.items.length > 0)
    .map(g => ({ name: g.name, services: g.items.map(cartItemToPayloadItem) }));

  const allServices = guests.flatMap(g => g.items).map(cartItemToPayloadItem);

  return { staffId, timeSlot, date: dateIso, dateLabel, services: allServices, guests: guestsPayload, total };
}
