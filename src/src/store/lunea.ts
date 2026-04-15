import { create } from 'zustand';

export const useLuneaStore = create((set) => ({
  role: null,
  setRole: (newRole: string) => set({ role: newRole }),
}));
