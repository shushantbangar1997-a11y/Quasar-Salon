/**
 * Seed the Firestore `staff` collection with Quasar Salon staff profiles.
 *
 * Usage (targeting the local emulator):
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/seedStaff.js
 *
 * Usage (targeting production — requires FIREBASE_SERVICE_ACCOUNT env var):
 *   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' node scripts/seedStaff.js
 *
 * Must be run from the backend/ directory.
 */
const admin = require('firebase-admin');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'demo-quasar-salon';

if (admin.apps.length === 0) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountEnv) {
    try {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
      admin.initializeApp({ projectId: PROJECT_ID });
    }
  } else {
    // Emulator mode
    admin.initializeApp({ projectId: PROJECT_ID });
  }
}

const db = admin.firestore();

const QUASAR_STAFF = [
  {
    id: 'staff-1',
    name: 'Priya Sharma',
    role: 'Senior Hair Stylist',
    emoji: '💇‍♀️',
    specialties: ['Hair Care', 'Transformation', 'Bridal'],
    experience: '8 years',
    available: true,
    schedule: {
      monday: { start: '10:00', end: '20:00' },
      tuesday: { start: '10:00', end: '20:00' },
      wednesday: null,
      thursday: { start: '10:00', end: '20:00' },
      friday: { start: '10:00', end: '20:00' },
      saturday: { start: '09:00', end: '21:00' },
      sunday: { start: '09:00', end: '18:00' },
    },
  },
  {
    id: 'staff-2',
    name: 'Rahul Verma',
    role: 'Expert Barber',
    emoji: '✂️',
    specialties: ['Hair Care', 'Beard'],
    experience: '6 years',
    available: true,
    schedule: {
      monday: { start: '09:00', end: '19:00' },
      tuesday: { start: '09:00', end: '19:00' },
      wednesday: { start: '09:00', end: '19:00' },
      thursday: null,
      friday: { start: '09:00', end: '19:00' },
      saturday: { start: '09:00', end: '21:00' },
      sunday: { start: '10:00', end: '18:00' },
    },
  },
  {
    id: 'staff-3',
    name: 'Sahil Khan',
    role: 'Eyebrow Artist',
    emoji: '✨',
    specialties: ['Eyebrow Studio', 'Threading', 'Waxing'],
    experience: '10 years',
    available: true,
    schedule: {
      monday: { start: '11:00', end: '20:00' },
      tuesday: { start: '11:00', end: '20:00' },
      wednesday: { start: '11:00', end: '20:00' },
      thursday: { start: '11:00', end: '20:00' },
      friday: null,
      saturday: { start: '10:00', end: '21:00' },
      sunday: null,
    },
  },
  {
    id: 'staff-4',
    name: 'Neha Kapoor',
    role: 'Skin & Facial Expert',
    emoji: '💆‍♀️',
    specialties: ['Facials', 'Cleanups', 'Bleach / D-Tan'],
    experience: '7 years',
    available: true,
    schedule: {
      monday: { start: '10:00', end: '19:00' },
      tuesday: null,
      wednesday: { start: '10:00', end: '19:00' },
      thursday: { start: '10:00', end: '19:00' },
      friday: { start: '10:00', end: '19:00' },
      saturday: { start: '09:00', end: '20:00' },
      sunday: { start: '10:00', end: '17:00' },
    },
  },
  {
    id: 'staff-5',
    name: 'Anita Mehta',
    role: 'Nail Technician',
    emoji: '💅',
    specialties: ['Nail Studio', 'Manicure & Pedicure'],
    experience: '5 years',
    available: true,
    schedule: {
      monday: { start: '10:00', end: '20:00' },
      tuesday: { start: '10:00', end: '20:00' },
      wednesday: { start: '10:00', end: '20:00' },
      thursday: { start: '10:00', end: '20:00' },
      friday: null,
      saturday: { start: '09:00', end: '21:00' },
      sunday: { start: '10:00', end: '17:00' },
    },
  },
  {
    id: 'staff-6',
    name: 'Sunita Rao',
    role: 'Massage Therapist',
    emoji: '💆',
    specialties: ['Massages', 'Body Treatments'],
    experience: '9 years',
    available: true,
    schedule: {
      monday: null,
      tuesday: { start: '10:00', end: '20:00' },
      wednesday: { start: '10:00', end: '20:00' },
      thursday: { start: '10:00', end: '20:00' },
      friday: { start: '10:00', end: '20:00' },
      saturday: { start: '09:00', end: '21:00' },
      sunday: { start: '09:00', end: '18:00' },
    },
  },
  {
    id: 'staff-7',
    name: 'Kavita Joshi',
    role: 'Makeup Artist',
    emoji: '💄',
    specialties: ['Make-Up', 'Bridal'],
    experience: '12 years',
    available: true,
    schedule: {
      monday: { start: '09:00', end: '20:00' },
      tuesday: { start: '09:00', end: '20:00' },
      wednesday: null,
      thursday: { start: '09:00', end: '20:00' },
      friday: { start: '09:00', end: '20:00' },
      saturday: { start: '08:00', end: '22:00' },
      sunday: { start: '08:00', end: '20:00' },
    },
  },
  {
    id: 'staff-8',
    name: 'Deepa Singh',
    role: 'Waxing & Skin Specialist',
    emoji: '🌸',
    specialties: ['Waxing', 'Threading', 'Bleach / D-Tan'],
    experience: '6 years',
    available: false,
    schedule: {
      monday: { start: '10:00', end: '19:00' },
      tuesday: { start: '10:00', end: '19:00' },
      wednesday: { start: '10:00', end: '19:00' },
      thursday: null,
      friday: { start: '10:00', end: '19:00' },
      saturday: { start: '10:00', end: '20:00' },
      sunday: null,
    },
  },
];

async function main() {
  const batch = db.batch();

  for (const staff of QUASAR_STAFF) {
    const ref = db.collection('staff').doc(staff.id);
    batch.set(ref, {
      ...staff,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  await batch.commit();
  console.log(`✅ Seeded ${QUASAR_STAFF.length} staff members into Firestore.`);
  console.log(`Project: ${PROJECT_ID}`);
}

main().catch(e => {
  console.error('❌ Seed failed:', e.message);
  process.exit(1);
});
