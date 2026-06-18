import jwt from 'jsonwebtoken';
import { User } from '../SocketManager';
import { WebSocket } from 'ws';

export interface userJwtClaims {
  userId: string;
  name: string;
  isGuest?: boolean;
}

/**
 * Verify the JWT token using the secret from process.env at runtime.
 * Throws on failure and closes the WebSocket with an appropriate code.
 */
export const extractAuthUser = (token: string, ws: WebSocket): User => {
  const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
    ws.close(1011, 'Server configuration error');
    throw new Error('JWT_SECRET not defined');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as userJwtClaims;
    return new User(ws, decoded);
  } catch (err) {
    ws.close(1008, 'Invalid token');
    throw err;
  }
};
