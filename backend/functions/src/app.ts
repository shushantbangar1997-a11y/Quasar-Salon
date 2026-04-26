import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';
import type { RequestHandler } from 'express';
import * as nodemailer from 'nodemailer';
import {
  BookingStatus,
  CreateBookingRequest,
  CreateQuasarBookingRequest,
  FavouritesRequest,
  Provider,
  QuasarStaff,
  UpsertProviderRequest,
  UpdateBookingStatusRequest,
  UpdateUserRequest,
  User,
  UserRole
} from './types';

if (admin.apps.length === 0) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountEnv) {
    try {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
      admin.initializeApp();
    }
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

export const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function badRequest(res: express.Response, message: string) {
  return res.status(400).json({ error: message });
}

function forbidden(res: express.Response, message: string) {
  return res.status(403).json({ error: message });
}

function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function nowTimestamps() {
  return {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function requireAuth(req: express.Request, res: express.Response): string | null {
  const uid = req.user?.uid;
  if (!uid) {
    res.status(401).json({ error: 'Unauthenticated' });
    return null;
  }
  return uid;
}

async function getUserRole(uid: string): Promise<UserRole> {
  const snap = await db.collection('users').doc(uid).get();
  const role = snap.exists ? (snap.data()?.role as UserRole | undefined) : undefined;
  return role ?? 'client';
}

const authenticateUser: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

/** Quasar time-slot helpers */
const QUASAR_TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM',
];

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getDayName(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return DAY_NAMES[d.getDay()];
}

function slotTo24h(slot: string): string {
  const parts = slot.split(' ');
  const period = parts[1];
  const timeParts = parts[0].split(':').map(Number);
  let hour = timeParts[0];
  const minute = timeParts[1];
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function blockedSlotDocId(staffId: string, dateStr: string, timeSlot: string): string {
  const safeSlot = timeSlot.replace(/[: ]/g, '-');
  return `${staffId}__${dateStr}__${safeSlot}`;
}

/** ──── OTP helpers ──── */

function makeTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OTP_EMAIL_USER,
      pass: process.env.OTP_EMAIL_PASS,
    },
  });
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** ──── Routes ──── */

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'quasar-salon-api' });
});

/** POST /auth/send-otp — generate & email a 6-digit code */
app.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body as { email?: unknown };
  if (!isNonEmptyString(email) || !email.includes('@')) {
    return void badRequest(res, 'A valid email address is required');
  }
  const normalised = email.toLowerCase().trim();
  const code = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  try {
    await db.collection('otps').doc(normalised).set({ code, expiresAt, createdAt: admin.firestore.FieldValue.serverTimestamp() });

    if (!process.env.OTP_EMAIL_USER || !process.env.OTP_EMAIL_PASS) {
      console.warn('OTP email credentials not configured — OTP_EMAIL_USER and OTP_EMAIL_PASS must be set');
      return void res.status(500).json({ error: 'Email service is not configured. Please contact support.' });
    }

    const transport = makeTransport();
    await transport.sendMail({
      from: `"Quasar Salon" <${process.env.OTP_EMAIL_USER}>`,
      to: normalised,
      subject: 'Your Quasar Salon verification code',
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:32px;background:#FAF8F5;border-radius:12px">
          <h2 style="color:#1A1A1A;margin-bottom:8px">Quasar Salon</h2>
          <p style="color:#666;margin-bottom:24px">Use the code below to sign in. It expires in 5 minutes.</p>
          <div style="background:#fff;border:1px solid #E8DDD4;border-radius:10px;padding:24px;text-align:center">
            <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#C9A84C">${code}</span>
          </div>
          <p style="color:#999;font-size:12px;margin-top:24px">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ sent: true });
  } catch (err) {
    console.error('POST /auth/send-otp error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/** POST /auth/verify-otp — verify code, return Firebase custom token */
app.post('/auth/verify-otp', async (req, res) => {
  const { email, code } = req.body as { email?: unknown; code?: unknown };
  if (!isNonEmptyString(email) || !email.includes('@')) {
    return void badRequest(res, 'A valid email address is required');
  }
  if (!isNonEmptyString(code)) {
    return void badRequest(res, 'code is required');
  }
  const normalised = email.toLowerCase().trim();

  try {
    const snap = await db.collection('otps').doc(normalised).get();
    if (!snap.exists) {
      return void res.status(400).json({ error: 'No OTP found for this email. Please request a new code.' });
    }
    const data = snap.data()!;
    if (Date.now() > (data.expiresAt as number)) {
      await db.collection('otps').doc(normalised).delete();
      return void res.status(400).json({ error: 'Code has expired. Please request a new one.' });
    }
    if (data.code !== code.trim()) {
      return void res.status(400).json({ error: 'Incorrect code. Please try again.' });
    }

    // Code verified — delete it to prevent reuse
    await db.collection('otps').doc(normalised).delete();

    // Look up or create a Firebase Auth user for this email
    let uid: string;
    try {
      const existing = await admin.auth().getUserByEmail(normalised);
      uid = existing.uid;
    } catch {
      const created = await admin.auth().createUser({ email: normalised });
      uid = created.uid;
      await db.collection('users').doc(uid).set({
        id: uid,
        email: normalised,
        name: normalised.split('@')[0],
        role: 'client',
        favourites: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    const token = await admin.auth().createCustomToken(uid);
    res.status(200).json({ token });
  } catch (err) {
    console.error('POST /auth/verify-otp error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.get('/users/me', authenticateUser, async (req, res) => {
  const uid = requireAuth(req, res);
  if (!uid) return;

  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) {
    const decoded = req.user!;
    const profile: User = {
      id: uid,
      name: decoded.name ?? decoded.email ?? 'New user',
      email: decoded.email ?? '',
      role: 'client',
      favourites: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(uid).set(profile, { merge: true });
    res.status(200).json(profile);
    return;
  }

  res.status(200).json({ id: doc.id, ...doc.data() });
});

app.put('/users/me', authenticateUser, async (req, res) => {
  const uid = requireAuth(req, res);
  if (!uid) return;

  const body = req.body as UpdateUserRequest;
  const updates: Partial<User> = {};

  if (body.name !== undefined) {
    if (!isNonEmptyString(body.name)) return void badRequest(res, 'name must be a non-empty string');
    updates.name = body.name.trim();
  }
  if (body.photoUrl !== undefined) {
    if (!isNonEmptyString(body.photoUrl)) return void badRequest(res, 'photoUrl must be a non-empty string');
    updates.photoUrl = body.photoUrl.trim();
  }

  if (Object.keys(updates).length === 0) return void badRequest(res, 'No valid fields to update');

  await db.collection('users').doc(uid).set({ ...updates, ...nowTimestamps() }, { merge: true });
  const doc = await db.collection('users').doc(uid).get();
  res.status(200).json({ id: doc.id, ...doc.data() });
});

app.post('/users/me/favourites', authenticateUser, async (req, res) => {
  const uid = requireAuth(req, res);
  if (!uid) return;

  const body = req.body as FavouritesRequest;
  if (!body || !isNonEmptyString(body.providerId)) return void badRequest(res, 'providerId is required');
  if (body.action !== 'add' && body.action !== 'remove') return void badRequest(res, 'action must be add|remove');

  const providerId = body.providerId.trim();
  const providerSnap = await db.collection('providers').doc(providerId).get();
  if (!providerSnap.exists) return void badRequest(res, 'Provider not found');

  const update =
    body.action === 'add'
      ? { favourites: admin.firestore.FieldValue.arrayUnion(providerId) }
      : { favourites: admin.firestore.FieldValue.arrayRemove(providerId) };

  await db.collection('users').doc(uid).set({ ...update, ...nowTimestamps() }, { merge: true });
  const doc = await db.collection('users').doc(uid).get();
  res.status(200).json({ id: doc.id, ...doc.data() });
});

app.get('/providers', async (req, res) => {
  try {
    let query: FirebaseFirestore.Query = db.collection('providers');

    const city = isNonEmptyString(req.query.city) ? String(req.query.city).trim() : null;
    const category = isNonEmptyString(req.query.category) ? String(req.query.category).trim() : null;
    const limit = asNumber(req.query.limit) ?? 20;

    if (city) query = query.where('location.city', '==', city);
    if (category) query = query.where('categories', 'array-contains', category);

    query = query.limit(Math.min(Math.max(limit, 1), 50));

    const snap = await query.get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.status(200).json(items);
  } catch (err) {
    console.error('GET /providers error:', err);
    res.status(500).json({ error: 'Failed to list providers' });
  }
});

app.get('/providers/:id', async (req, res) => {
  const id = req.params.id;
  const doc = await db.collection('providers').doc(id).get();
  if (!doc.exists) return void res.status(404).json({ error: 'Provider not found' });
  res.status(200).json({ id: doc.id, ...doc.data() });
});

app.post('/providers/me', authenticateUser, async (req, res) => {
  const uid = requireAuth(req, res);
  if (!uid) return;

  const role = await getUserRole(uid);
  if (role !== 'provider') {
    await db.collection('users').doc(uid).set({ role: 'provider', ...nowTimestamps() }, { merge: true });
  }

  const body = req.body as UpsertProviderRequest;

  if (!body || !isNonEmptyString(body.name)) return void badRequest(res, 'name is required');
  if (!body.location || !isNonEmptyString(body.location.city)) return void badRequest(res, 'location.city is required');
  const lat = asNumber(body.location.lat);
  const lng = asNumber(body.location.lng);
  if (lat === null || lng === null) return void badRequest(res, 'location.lat and location.lng must be numbers');
  if (!isNonEmptyString(body.bio)) return void badRequest(res, 'bio is required');
  if (!Array.isArray(body.categories) || body.categories.length === 0) return void badRequest(res, 'categories must be a non-empty array');
  if (!Array.isArray(body.services) || body.services.length === 0) return void badRequest(res, 'services must be a non-empty array');

  for (const s of body.services) {
    if (!isNonEmptyString(s.name)) return void badRequest(res, 'service.name must be a non-empty string');
    if (!isNonEmptyString(s.category)) return void badRequest(res, 'service.category must be a non-empty string');
    const price = asNumber(s.price);
    const dur = asNumber(s.durationMins);
    if (price === null || price < 0) return void badRequest(res, 'service.price must be a non-negative number');
    if (dur === null || dur <= 0) return void badRequest(res, 'service.durationMins must be a positive number');
  }

  const provider: Provider = {
    id: uid,
    name: body.name.trim(),
    photoUrl: body.photoUrl?.trim(),
    location: { city: body.location.city.trim(), lat, lng },
    bio: body.bio.trim(),
    categories: body.categories.map(String),
    services: body.services.map(s => ({
      name: String(s.name).trim(),
      price: asNumber(s.price) ?? 0,
      category: String(s.category).trim(),
      durationMins: asNumber(s.durationMins) ?? 0,
    })),
    availability: body.availability,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = db.collection('providers').doc(uid);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      tx.set(ref, { ...provider, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } else {
      tx.set(ref, provider, { merge: true });
    }
  });

  const fresh = await ref.get();
  res.status(200).json({ id: fresh.id, ...fresh.data() });
});

/** ──── Quasar Staff endpoints ──── */

/** GET /staff — list all active staff (public) */
app.get('/staff', async (_req, res) => {
  try {
    const snap = await db.collection('staff').get();
    const staff = snap.docs.map(d => ({ id: d.id, ...d.data() } as QuasarStaff));
    res.status(200).json(staff);
  } catch (err) {
    console.error('GET /staff error:', err);
    res.status(500).json({ error: 'Failed to list staff' });
  }
});

/**
 * Shared handler for GET /staff/:id/slots and GET /staff/:id/availability.
 * Supports ?date=YYYY-MM-DD&duration=<minutes>
 * Returns start slots where there are enough consecutive unblocked 30-min windows to cover `duration`.
 */
async function getStaffAvailabilityHandler(req: express.Request, res: express.Response): Promise<void> {
  const staffId = req.params.id;
  const dateStr = req.query.date as string;

  if (!isNonEmptyString(dateStr) || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    badRequest(res, 'date query param required in YYYY-MM-DD format');
    return;
  }

  const rawDuration = asNumber(req.query.duration) ?? 30;
  const slotsNeeded = Math.max(1, Math.ceil(rawDuration / 30));

  try {
    const staffDoc = await db.collection('staff').doc(staffId).get();
    if (!staffDoc.exists) { res.status(404).json({ error: 'Staff member not found' }); return; }

    const staff = staffDoc.data() as QuasarStaff;
    if (!staff.available) { res.status(200).json({ staffId, date: dateStr, duration: rawDuration, slots: [] }); return; }

    const dayName = getDayName(dateStr);
    const daySchedule = staff.schedule?.[dayName];

    if (!daySchedule) {
      res.status(200).json({ staffId, date: dateStr, duration: rawDuration, slots: [] });
      return;
    }

    const { start: scheduleStart, end: scheduleEnd } = daySchedule;

    const slotsInSchedule = new Set(
      QUASAR_TIME_SLOTS.filter(s => {
        const s24 = slotTo24h(s);
        return s24 >= scheduleStart && s24 < scheduleEnd;
      })
    );

    const blockedSnap = await db.collection('blocked_slots')
      .where('staffId', '==', staffId)
      .where('date', '==', dateStr)
      .get();

    const blockedSlotSet = new Set(blockedSnap.docs.map(d => d.data().timeSlot as string));

    /** A start slot is available only if all slotsNeeded consecutive 30-min windows are within schedule + unblocked */
    const availableSlots = QUASAR_TIME_SLOTS.filter(startSlot => {
      if (!slotsInSchedule.has(startSlot)) return false;
      const startIdx = QUASAR_TIME_SLOTS.indexOf(startSlot);
      for (let i = 0; i < slotsNeeded; i++) {
        const checkSlot = QUASAR_TIME_SLOTS[startIdx + i];
        if (!checkSlot) return false;
        if (!slotsInSchedule.has(checkSlot)) return false;
        if (blockedSlotSet.has(checkSlot)) return false;
      }
      return true;
    });

    res.status(200).json({ staffId, date: dateStr, duration: rawDuration, slots: availableSlots });
  } catch (err) {
    console.error('GET /staff/:id/slots error:', err);
    res.status(500).json({ error: 'Failed to get slots' });
  }
}

/** GET /staff/:id/slots?date=YYYY-MM-DD[&duration=<minutes>] */
app.get('/staff/:id/slots', getStaffAvailabilityHandler);

/** GET /staff/:id/availability?date=YYYY-MM-DD[&duration=<minutes>] (preferred contract) */
app.get('/staff/:id/availability', getStaffAvailabilityHandler);

/** ──── Bookings ──── */

app.post('/bookings', authenticateUser, async (req, res) => {
  const uid = requireAuth(req, res);
  if (!uid) return;

  const body = req.body;

  /** Quasar Salon booking format: staffId + timeSlot + services[] */
  if (isNonEmptyString(body.staffId) && isNonEmptyString(body.timeSlot)) {
    const quasarBody = body as CreateQuasarBookingRequest;

    if (!isNonEmptyString(quasarBody.date)) return void badRequest(res, 'date is required (YYYY-MM-DD)');
    if (!isNonEmptyString(quasarBody.dateLabel)) return void badRequest(res, 'dateLabel is required');
    if (!Array.isArray(quasarBody.services) || quasarBody.services.length === 0) {
      return void badRequest(res, 'services must be a non-empty array');
    }
    const total = asNumber(quasarBody.total);
    if (total === null || total < 0) return void badRequest(res, 'total must be a non-negative number');

    const staffId = quasarBody.staffId.trim();
    const timeSlot = quasarBody.timeSlot.trim();
    const dateStr = quasarBody.date.trim();

    const staffDoc = await db.collection('staff').doc(staffId).get();
    if (!staffDoc.exists) return void badRequest(res, 'Staff member not found');

    const staff = staffDoc.data() as QuasarStaff;
    if (!staff.available) return void badRequest(res, 'This staff member is not currently available for bookings');

    // Validate day schedule
    const dayName = getDayName(dateStr);
    const daySchedule = staff.schedule?.[dayName];
    if (!daySchedule) {
      return void badRequest(res, `${staff.name ?? 'This stylist'} does not work on ${dayName}s`);
    }
    const { start: scheduleStart, end: scheduleEnd } = daySchedule;

    // Determine how many 30-min slots the booking spans; multiply durationMins by qty
    const totalDuration = quasarBody.services.reduce(
      (sum, s) => sum + (s.durationMins ?? 30) * Math.max(1, s.qty ?? 1),
      0
    );
    const slotsNeeded = Math.max(1, Math.ceil(totalDuration / 30));

    const startIdx = QUASAR_TIME_SLOTS.indexOf(timeSlot);
    if (startIdx === -1) return void badRequest(res, 'Invalid time slot');
    if (startIdx + slotsNeeded > QUASAR_TIME_SLOTS.length) {
      return void badRequest(res, 'Booking would extend past closing time. Please choose an earlier slot.');
    }

    // Verify all consecutive slots fall within the staff member's working hours
    for (let i = 0; i < slotsNeeded; i++) {
      const checkSlot = QUASAR_TIME_SLOTS[startIdx + i];
      const slot24 = slotTo24h(checkSlot);
      if (slot24 < scheduleStart || slot24 >= scheduleEnd) {
        return void badRequest(res, 'One or more slots fall outside the stylist\'s working hours. Please choose a different time.');
      }
    }

    const slotsToBlock = QUASAR_TIME_SLOTS.slice(startIdx, startIdx + slotsNeeded);
    const blockedRefs = slotsToBlock.map(slot =>
      db.collection('blocked_slots').doc(blockedSlotDocId(staffId, dateStr, slot))
    );
    const bookingRef = db.collection('bookings').doc();

    try {
      await db.runTransaction(async tx => {
        // Check all consecutive slots are unblocked
        const snapshots = await Promise.all(blockedRefs.map(r => tx.get(r)));
        for (const snap of snapshots) {
          if (snap.exists) throw Object.assign(new Error('SLOT_TAKEN'), { code: 409 });
        }

        // Block all consecutive slots
        for (let i = 0; i < slotsToBlock.length; i++) {
          tx.set(blockedRefs[i], {
            staffId,
            date: dateStr,
            timeSlot: slotsToBlock[i],
            bookingId: bookingRef.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        tx.set(bookingRef, {
          userId: uid,
          staffId,
          timeSlot,
          date: dateStr,
          dateLabel: quasarBody.dateLabel.trim(),
          services: quasarBody.services,
          total,
          totalDuration,
          slotsBlocked: slotsToBlock,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      const created = await bookingRef.get();
      res.status(201).json({ id: created.id, ...created.data() });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'SLOT_TAKEN') {
        return void res.status(409).json({ error: 'One or more time slots in your booking window are no longer available. Please choose another time.' });
      }
      console.error('POST /bookings (quasar) transaction error:', err);
      res.status(500).json({ error: 'Failed to create booking' });
    }
    return;
  }

  /** Legacy booking format: providerId + service (single) */
  const legacyBody = body as CreateBookingRequest;

  if (!legacyBody || !isNonEmptyString(legacyBody.providerId)) return void badRequest(res, 'providerId is required');
  if (!legacyBody.service || !isNonEmptyString(legacyBody.service.name)) return void badRequest(res, 'service is required');
  if (!isNonEmptyString(legacyBody.date)) return void badRequest(res, 'date is required (ISO string)');

  const providerId = legacyBody.providerId.trim();
  const providerSnap = await db.collection('providers').doc(providerId).get();
  if (!providerSnap.exists) return void badRequest(res, 'Provider not found');

  const service = legacyBody.service;
  const price = asNumber(service.price);
  const dur = asNumber(service.durationMins);
  if (!isNonEmptyString(service.category)) return void badRequest(res, 'service.category is required');
  if (price === null || price < 0) return void badRequest(res, 'service.price must be a non-negative number');
  if (dur === null || dur <= 0) return void badRequest(res, 'service.durationMins must be a positive number');

  const bookingData = {
    userId: uid,
    providerId,
    service: {
      name: String(service.name).trim(),
      category: String(service.category).trim(),
      price,
      durationMins: dur,
    },
    date: legacyBody.date,
    notes: isNonEmptyString(legacyBody.notes) ? legacyBody.notes.trim() : undefined,
    status: 'pending' as BookingStatus,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await db.collection('bookings').add(bookingData);
  const created = await ref.get();
  res.status(201).json({ id: created.id, ...created.data() });
});

app.get('/bookings', authenticateUser, async (req, res) => {
  const uid = requireAuth(req, res);
  if (!uid) return;

  try {
    const role = await getUserRole(uid);
    const status = isNonEmptyString(req.query.status) ? (String(req.query.status).trim() as BookingStatus) : null;

    if (role === 'provider') {
      // Support both legacy providerId bookings and new Quasar staffId bookings
      const [staffSnap, providerSnap] = await Promise.all([
        db.collection('bookings').where('staffId', '==', uid).get(),
        db.collection('bookings').where('providerId', '==', uid).get(),
      ]);

      const seen = new Set<string>();
      const merged = [...staffSnap.docs, ...providerSnap.docs].filter(d => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      });

      const items = merged
        .map(d => ({ id: d.id, ...d.data() } as Record<string, unknown>))
        .filter(d => !status || d.status === status)
        .sort((a, b) => {
          const ta = (a.createdAt as FirebaseFirestore.Timestamp)?.toMillis?.() ?? 0;
          const tb = (b.createdAt as FirebaseFirestore.Timestamp)?.toMillis?.() ?? 0;
          return tb - ta;
        })
        .slice(0, 50);

      res.status(200).json(items);
      return;
    }

    // Client: query by userId, sort + limit server-side
    let clientQuery: FirebaseFirestore.Query = db.collection('bookings')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50);

    const snap = await clientQuery.get();
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, unknown>));
    const filtered = status ? docs.filter(d => d.status === status) : docs;
    res.status(200).json(filtered);
  } catch (err) {
    console.error('GET /bookings error:', err);
    res.status(500).json({ error: 'Failed to list bookings' });
  }
});

app.patch('/bookings/:id/status', authenticateUser, async (req, res) => {
  const uid = requireAuth(req, res);
  if (!uid) return;

  const bookingId = req.params.id;
  const body = req.body as UpdateBookingStatusRequest;
  if (!body || !isNonEmptyString(body.status)) return void badRequest(res, 'status is required');

  const status = body.status as BookingStatus;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return void badRequest(res, 'Invalid status');
  }

  const ref = db.collection('bookings').doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists) return void res.status(404).json({ error: 'Booking not found' });

  const data = snap.data()!;
  const canEdit = data.userId === uid || data.staffId === uid || data.providerId === uid;
  if (!canEdit) return void forbidden(res, 'Not allowed to update this booking');

  await ref.set({ status, ...nowTimestamps() }, { merge: true });

  // When cancelling a Quasar booking, free the blocked time slots so they become available again
  if (status === 'cancelled') {
    const slotsBlocked = data.slotsBlocked as string[] | undefined;
    const staffId = data.staffId as string | undefined;
    const dateStr = data.date as string | undefined;
    if (Array.isArray(slotsBlocked) && isNonEmptyString(staffId) && isNonEmptyString(dateStr)) {
      const deleteOps = slotsBlocked.map(slot =>
        db.collection('blocked_slots').doc(blockedSlotDocId(staffId!, dateStr!, slot)).delete()
      );
      await Promise.all(deleteOps);
    }
  }

  const updated = await ref.get();
  res.status(200).json({ id: updated.id, ...updated.data() });
});
