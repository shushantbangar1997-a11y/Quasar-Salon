import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QuasarService, QuasarCategory } from './quasarData';

export interface CartItem {
  service: QuasarService;
  category: QuasarCategory;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (service: QuasarService, category: QuasarCategory) => void;
  removeItem: (serviceId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (service: QuasarService, category: QuasarCategory) => {
    setItems(prev => {
      const existing = prev.find(i => i.service.id === service.id);
      if (existing) {
        return prev.map(i => i.service.id === service.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { service, category, qty: 1 }];
    });
  };

  const removeItem = (serviceId: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.service.id === serviceId);
      if (existing && existing.qty > 1) {
        return prev.map(i => i.service.id === serviceId ? { ...i, qty: i.qty - 1 } : i);
      }
      return prev.filter(i => i.service.id !== serviceId);
    });
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.service.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
