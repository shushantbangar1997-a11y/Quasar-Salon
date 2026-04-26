import React, { createContext, useContext, useState } from 'react';
import { QUASAR_STAFF, StaffMember } from './quasarData';

interface StaffContextValue {
  staffList: StaffMember[];
  toggleAvailability: (id: string) => void;
  addStaff: (member: StaffMember) => void;
}

const StaffContext = createContext<StaffContextValue>({
  staffList: QUASAR_STAFF,
  toggleAvailability: () => {},
  addStaff: () => {},
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

  return (
    <StaffContext.Provider value={{ staffList, toggleAvailability, addStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  return useContext(StaffContext);
}
