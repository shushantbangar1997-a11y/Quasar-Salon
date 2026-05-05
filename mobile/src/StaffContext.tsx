import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { QUASAR_STAFF, StaffMember } from './quasarData';
import { fetchAllStaff } from './api';

interface StaffContextValue {
  staffList: StaffMember[];
  staffLoading: boolean;
  refreshStaff: () => Promise<void>;
  toggleAvailability: (id: string) => void;
  addStaff: (member: StaffMember) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
}

const StaffContext = createContext<StaffContextValue>({
  staffList: QUASAR_STAFF,
  staffLoading: false,
  refreshStaff: async () => {},
  toggleAvailability: () => {},
  addStaff: () => {},
  updateStaff: () => {},
});

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staffList, setStaffList] = useState<StaffMember[]>([...QUASAR_STAFF]);
  const [staffLoading, setStaffLoading] = useState(true);

  const refreshStaff = useCallback(async () => {
    try {
      const live = await fetchAllStaff();
      if (live && live.length > 0) {
        setStaffList(live);
      }
    } catch {
      // fall back to whatever is already in local state
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStaff();
  }, [refreshStaff]);

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
    <StaffContext.Provider value={{ staffList, staffLoading, refreshStaff, toggleAvailability, addStaff, updateStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  return useContext(StaffContext);
}
