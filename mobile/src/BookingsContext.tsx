import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { CartItem } from './CartContext';
import { StaffMember } from './quasarData';
import { auth, db, isFirebaseConfigured } from './firebase';

export interface ConfirmedBooking {
  id: string;
  services: CartItem[];
  date: string;
  time: string;
  stylist: StaffMember | null;
  total: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  createdAt: number;
}

interface BookingsContextType {
  bookings: ConfirmedBooking[];
  addBooking: (booking: Omit<ConfirmedBooking, 'id' | 'createdAt'>) => ConfirmedBooking;
  isRealTime: boolean;
}

const BookingsContext = createContext<BookingsContextType | null>(null);

const DEMO_BOOKINGS: ConfirmedBooking[] = [
  {
    id: 'demo-b3',
    services: [
      { service: { id: 'hc-8', name: "Men's Haircut", price: 599, durationMins: 30, gender: 'Men' }, category: { id: 'hair-care', name: 'Hair Care', icon: '💇‍♀️', services: [] }, qty: 1 },
      { service: { id: 'hc-10', name: 'Beard Color', price: 999, durationMins: 30, gender: 'Men' }, category: { id: 'hair-care', name: 'Hair Care', icon: '💇‍♀️', services: [] }, qty: 1 },
    ],
    date: 'Mon, Apr 14',
    time: '10:00 AM',
    stylist: { id: 'staff-2', name: 'Rahul Verma', role: 'Expert Barber', emoji: '✂️', specialties: ['Hair Care'], experience: '6 years', available: true, schedule: {} },
    total: 1598,
    status: 'completed',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'demo-b4',
    services: [
      { service: { id: 'mu-3', name: 'HD Make-Up (Party)', price: 4499, durationMins: 75, gender: 'Women' }, category: { id: 'makeup', name: 'Make-Up', icon: '💄', services: [] }, qty: 1 },
      { service: { id: 'mu-12', name: 'Hair Do (With Bun)', price: 1499, durationMins: 60, gender: 'Women' }, category: { id: 'makeup', name: 'Make-Up', icon: '💄', services: [] }, qty: 1 },
    ],
    date: 'Sat, Apr 5',
    time: '8:00 AM',
    stylist: { id: 'staff-7', name: 'Kavita Joshi', role: 'Makeup Artist', emoji: '💄', specialties: ['Make-Up'], experience: '12 years', available: true, schedule: {} },
    total: 5998,
    status: 'completed',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
];

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<ConfirmedBooking[]>(DEMO_BOOKINGS);
  const [isRealTime, setIsRealTime] = useState(false);
  const bookingsUnsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) return;

    const unsubAuth = onAuthStateChanged(auth, (user: User | null) => {
      if (bookingsUnsubRef.current) {
        bookingsUnsubRef.current();
        bookingsUnsubRef.current = null;
      }

      if (!user || !db) {
        setIsRealTime(false);
        setBookings(DEMO_BOOKINGS);
        return;
      }

      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );

      const unsubBookings = onSnapshot(
        q,
        snap => {
          const firestoreBookings: ConfirmedBooking[] = snap.docs.map(doc => {
            const data = doc.data();

            // Backend stores services as flat objects: {id,name,price,durationMins,category,qty}
            // UI expects CartItem shape: {service:{id,name,price,durationMins,gender}, category:{id,name,icon,services[]}, qty}
            type FlatService = { id?: string; name?: string; price?: number; durationMins?: number; category?: string; qty?: number };
            const rawServices = (data.services as FlatService[] | undefined) ?? [];
            const services: CartItem[] = rawServices.map(s => ({
              service: {
                id: s.id ?? '',
                name: s.name ?? 'Service',
                price: s.price ?? 0,
                durationMins: s.durationMins ?? 30,
                gender: 'Both' as const,
              },
              category: {
                id: s.category ?? '',
                name: s.category ?? '',
                icon: '✂️',
                services: [],
              },
              qty: s.qty ?? 1,
            }));

            return {
              id: doc.id,
              services,
              date: (data.dateLabel as string) ?? (data.date as string) ?? '',
              time: (data.timeSlot as string) ?? '',
              stylist: (data.stylist as StaffMember | null) ?? null,
              total: (data.total as number) ?? 0,
              status: (data.status as ConfirmedBooking['status']) ?? 'pending',
              createdAt: typeof data.createdAt?.toMillis === 'function'
                ? data.createdAt.toMillis()
                : Date.now(),
            };
          });

          firestoreBookings.sort((a, b) => b.createdAt - a.createdAt);
          // Show real data (even if empty) — do not fall back to DEMO_BOOKINGS
          setBookings(firestoreBookings);
          setIsRealTime(true);
        },
        err => {
          console.warn('[BookingsContext] onSnapshot error:', err);
          // Leave existing state intact on error; disable real-time indicator
          setIsRealTime(false);
        }
      );

      bookingsUnsubRef.current = unsubBookings;
    });

    return () => {
      unsubAuth();
      if (bookingsUnsubRef.current) bookingsUnsubRef.current();
    };
  }, []);

  const addBooking = (data: Omit<ConfirmedBooking, 'id' | 'createdAt'>) => {
    const booking: ConfirmedBooking = {
      ...data,
      id: `booking-${Date.now()}`,
      createdAt: Date.now(),
    };
    setBookings(prev => [booking, ...prev]);
    return booking;
  };

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, isRealTime }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used inside BookingsProvider');
  return ctx;
}
