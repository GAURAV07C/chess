import { useEffect, useState, useMemo } from 'react';
import { User, BACKEND_URL } from '@repo/store';

const useUserStore = (window as any).__USER_STORE__;

export const prefetchUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (response.ok) {
      return (await response.json()) as User;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const ensureHydrated = async (store: any) => {
  if (!store) return;
  if (!store.getState().hydrated) {
    await store.getState().refreshUser();
  }
};

export const useHydratedUser = () => {
  const store = useUserStore;
  const [hydrated, setHydrated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!store) {
        if (!cancelled) setMounted(true);
        return;
      }
      await ensureHydrated(store);
      if (!cancelled) {
        setHydrated(store.getState().hydrated);
        setMounted(true);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const user = store ? store.getState().user : null;

  return { user, hydrated, mounted };
};
