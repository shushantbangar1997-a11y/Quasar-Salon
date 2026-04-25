import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from './CartContext';
import { StaffMember } from './quasarData';

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
    <BookingsContext.Provider value={{ bookings, addBooking }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used inside BookingsProvider');
  return ctx;
}
