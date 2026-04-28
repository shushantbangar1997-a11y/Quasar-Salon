import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { QuasarService, QuasarCategory } from './quasarData';

export interface CartItem {
  service: QuasarService;
  category: QuasarCategory;
  qty: number;
}

export interface Guest {
  id: string;
  name: string;
  items: CartItem[];
}

export const SELF_GUEST_ID = 'self';

interface CartContextType {
  guests: Guest[];
  activeGuestId: string;
  setActiveGuestId: (id: string) => void;
  addGuest: (name: string) => string;
  removeGuest: (guestId: string) => void;
  addItemForGuest: (service: QuasarService, category: QuasarCategory, guestId: string) => void;
  removeItemForGuest: (serviceId: string, guestId: string) => void;
  addItem: (service: QuasarService, category: QuasarCategory) => void;
  removeItem: (serviceId: string) => void;
  items: CartItem[];
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

function makeGuest(id: string, name: string): Guest {
  return { id, name, items: [] };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [guests, setGuests] = useState<Guest[]>([makeGuest(SELF_GUEST_ID, 'You')]);
  const [activeGuestId, setActiveGuestId] = useState<string>(SELF_GUEST_ID);

  const addItemForGuest = useCallback(
    (service: QuasarService, category: QuasarCategory, guestId: string) => {
      setGuests(prev =>
        prev.map(g => {
          if (g.id !== guestId) return g;
          const existing = g.items.find(i => i.service.id === service.id);
          if (existing) {
            return {
              ...g,
              items: g.items.map(i =>
                i.service.id === service.id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { ...g, items: [...g.items, { service, category, qty: 1 }] };
        })
      );
    },
    []
  );

  const removeItemForGuest = useCallback((serviceId: string, guestId: string) => {
    setGuests(prev =>
      prev.map(g => {
        if (g.id !== guestId) return g;
        const existing = g.items.find(i => i.service.id === serviceId);
        if (existing && existing.qty > 1) {
          return {
            ...g,
            items: g.items.map(i =>
              i.service.id === serviceId ? { ...i, qty: i.qty - 1 } : i
            ),
          };
        }
        return { ...g, items: g.items.filter(i => i.service.id !== serviceId) };
      })
    );
  }, []);

  const addItem = useCallback(
    (service: QuasarService, category: QuasarCategory) => {
      addItemForGuest(service, category, SELF_GUEST_ID);
    },
    [addItemForGuest]
  );

  const removeItem = useCallback(
    (serviceId: string) => {
      removeItemForGuest(serviceId, SELF_GUEST_ID);
    },
    [removeItemForGuest]
  );

  const addGuest = useCallback((name: string): string => {
    const id = `guest-${Date.now()}`;
    setGuests(prev => [...prev, makeGuest(id, name.trim())]);
    return id;
  }, []);

  const removeGuest = useCallback((guestId: string) => {
    if (guestId === SELF_GUEST_ID) return;
    setGuests(prev => prev.filter(g => g.id !== guestId));
    setActiveGuestId(prev => (prev === guestId ? SELF_GUEST_ID : prev));
  }, []);

  const clearCart = useCallback(() => {
    setGuests([makeGuest(SELF_GUEST_ID, 'You')]);
    setActiveGuestId(SELF_GUEST_ID);
  }, []);

  const items = guests.find(g => g.id === activeGuestId)?.items ?? [];
  const totalItems = guests.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.qty, 0),
    0
  );
  const totalPrice = guests.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.service.price * i.qty, 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        guests,
        activeGuestId,
        setActiveGuestId,
        addGuest,
        removeGuest,
        addItemForGuest,
        removeItemForGuest,
        addItem,
        removeItem,
        items,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
