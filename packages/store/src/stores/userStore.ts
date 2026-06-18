import { create } from 'zustand';

export interface User {
  token: string;
  id: string;
  name: string;
}

export const BACKEND_URL = 'http://localhost:3000';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
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
      } else {
        set({ user: null });
      }
    } catch (e) {
      console.error(e);
      set({ user: null });
    }
  },
}));

export const selectUser = (state: UserState) => state.user;
export const selectSetUser = (state: UserState) => state.setUser;

