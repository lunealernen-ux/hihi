import { create } from 'zustand';

interface LuneaState {
  role: 'teacher' | 'student' | null;
  sessionCode: string | null;
  setRole: (role: 'teacher' | 'student') => void;
  setSessionCode: (code: string) => void;
}

export const useLuneaStore = create<LuneaState>((set) => ({
  role: null,
  sessionCode: null,
  setRole: (role) => set({ role }),
  setSessionCode: (code) => set({ sessionCode: code }),
}));
