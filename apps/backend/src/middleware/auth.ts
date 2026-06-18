import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '6db7925a10e8f86e718f4fdd9f35dac75d0ce5582df0c8a01c69e2d7977e1ad1';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cookies = req.cookies;
    console.log('[authMiddleware] cookies:', cookies);

    if (req.user) {
      req.userId = (req.user as any).id;
      console.log('[authMiddleware] using req.user, userId:', req.userId);
      return next();
    }

    const token = cookies?.guest;
    if (!token) {
      console.log('[authMiddleware] no guest token');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    console.log('[authMiddleware] guest token ok, userId:', req.userId);
    next();
  } catch (err) {
    console.error('[authMiddleware] error:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export default authMiddleware;
