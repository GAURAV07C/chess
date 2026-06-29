import { useEffect, useState } from 'react';
import { useUser } from '@repo/store/useUser';

const WS_URL = import.meta.env.VITE_APP_WS_URL ?? 'ws://localhost:8080';

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const user = useUser();

  useEffect(() => {
    if (!user) {
      console.warn('🔌 useSocket – no user, aborting socket creation');
      return;
    }
    const ws = new WebSocket(`${WS_URL}?token=${user.token}`);

    ws.onopen = () => {
      console.log('🔌 WebSocket opened');
      setSocket(ws);
    };

    ws.onclose = (event) => {
      console.warn('🔌 WebSocket closed', event);
      setSocket(null);
    };

    ws.onerror = (err) => {
      console.error('🔌 WebSocket error', err);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return socket;
};
