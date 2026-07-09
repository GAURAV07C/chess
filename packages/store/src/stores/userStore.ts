import { create } from 'zustand';

export interface User {
  token: string;
  id: string;
  name: string;
}

export const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000';

interface UserState {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setHydrated: (hydrated: boolean) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  hydrated: false,
  setUser: (user: User | null) => set({ user }),
  setHydrated: (hydrated: boolean) => set({ hydrated }),
  logout: async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (e) {
      console.error(e);
    } finally {
      set({ user: null, hydrated: false });
    }
  },
  refreshUser: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = (await response.json()) as User;
        set({ user: data });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ hydrated: true });
    }
  },
}));

export const selectUser = (state: UserState) => state.user;
export const selectSetUser = (state: UserState) => state.setUser;
