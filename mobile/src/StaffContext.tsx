import React, { createContext, useContext, useState } from 'react';
import { QUASAR_STAFF, StaffMember } from './quasarData';

interface StaffContextValue {
  staffList: StaffMember[];
  toggleAvailability: (id: string) => void;
  addStaff: (member: StaffMember) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
}

const StaffContext = createContext<StaffContextValue>({
  staffList: QUASAR_STAFF,
  toggleAvailability: () => {},
  addStaff: () => {},
  updateStaff: () => {},
});

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staffList, setStaffList] = useState<StaffMember[]>([...QUASAR_STAFF]);

  const toggleAvailability = (id: string) => {
    setStaffList(prev =>
      prev.map(st => st.id === id ? { ...st, available: !st.available } : st)
    );
  };

  const addStaff = (member: StaffMember) => {
    setStaffList(prev => [...prev, member]);
  };

  const updateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaffList(prev =>
      prev.map(st => st.id === id ? { ...st, ...updates } : st)
    );
  };

  return (
    <StaffContext.Provider value={{ staffList, toggleAvailability, addStaff, updateStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  return useContext(StaffContext);
}
