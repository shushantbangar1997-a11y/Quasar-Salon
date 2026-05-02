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
import { apiPatch } from './api';
import { logger } from './logger';

export interface BookingGuest {
  name: string;
  services: CartItem[];
}

export interface ConfirmedBooking {
  id: string;
  services: CartItem[];
  guests?: BookingGuest[];
  date: string;
  dateIso?: string;
  time: string;
  stylist: StaffMember | null;
  total: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  createdAt: number;
}

interface BookingsContextType {
  bookings: ConfirmedBooking[];
  addBooking: (booking: Omit<ConfirmedBooking, 'id' | 'createdAt'>) => ConfirmedBooking;
  cancelBooking: (bookingId: string) => Promise<void>;
  isRealTime: boolean;
}

const BookingsContext = createContext<BookingsContextType | null>(null);

type FlatService = { id?: string; name?: string; price?: number; durationMins?: number; category?: string; qty?: number };

function flatToCartItem(s: FlatService): CartItem {
  return {
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
      imageUrl: '',
      services: [],
    },
    qty: s.qty ?? 1,
  };
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
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
        setBookings([]);
        return;
      }

      const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));

      const unsubBookings = onSnapshot(
        q,
        snap => {
          const firestoreBookings: ConfirmedBooking[] = snap.docs.map(doc => {
            const data = doc.data();
            const rawServices = (data.services as FlatService[] | undefined) ?? [];
            const services: CartItem[] = rawServices.map(flatToCartItem);

            const rawGuests = data.guests as Array<{ name?: string; services?: FlatService[] }> | undefined;
            const guests: BookingGuest[] | undefined = Array.isArray(rawGuests) && rawGuests.length > 0
              ? rawGuests.map(g => ({
                  name: typeof g.name === 'string' && g.name.length > 0 ? g.name : 'Guest',
                  services: (g.services ?? []).map(flatToCartItem),
                }))
              : undefined;

            return {
              id: doc.id,
              services,
              guests,
              date: (data.dateLabel as string) ?? (data.date as string) ?? '',
              dateIso: (data.date as string | undefined),
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
          setBookings(firestoreBookings);
          setIsRealTime(true);
        },
        err => {
          logger.warn('[BookingsContext] onSnapshot error:', err);
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

  const cancelBooking = async (bookingId: string): Promise<void> => {
    await apiPatch(`/bookings/${bookingId}/status`, { status: 'cancelled' }, true);
    // onSnapshot will reflect the updated status automatically.
  };

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking, isRealTime }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used inside BookingsProvider');
  return ctx;
}
