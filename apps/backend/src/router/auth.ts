import { Request, Response, Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { COOKIE_MAX_AGE } from '../consts';
const router = Router();

const CLIENT_URL = process.env.AUTH_REDIRECT_URL ?? 'http://localhost:5173/auth/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const isProduction = process.env.NODE_ENV === 'production';

const cookieSettings = {
  maxAge: COOKIE_MAX_AGE,
  httpOnly: false,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  path: '/',
};

interface userJwtClaims {
  userId: string;
  name: string;
  isGuest?: boolean;
}

interface UserDetails {
  id: string;
  token?: string;
  name: string;
  isGuest?: boolean;
}

// this route is to be hit when the user wants to login as a guest
router.post('/guest', async (req: Request, res: Response) => {
  try {
    const bodyData = req.body;
    let guestUUID = 'guest-' + uuidv4();

    const user = await db.user.create({
      data: {
        username: guestUUID,
        email: guestUUID + '@cheakmate.com',
        name: bodyData.name || guestUUID,
        provider: 'GUEST',
      },
    });

    const token = jwt.sign({ userId: user.id, name: user.name, isGuest: true }, JWT_SECRET);
    const UserDetails: UserDetails = {
      id: user.id,
      name: user.name!,
      token: token,
      isGuest: true,
    };

    res.cookie('guest', token, cookieSettings);
    res.json(UserDetails);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create guest account' });
  }
});

router.get('/refresh', async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as UserDetails;

    const userDb = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    const token = jwt.sign({ userId: user.id, name: userDb?.name }, JWT_SECRET);
    res.json({
      token,
      id: user.id,
      name: userDb?.name,
    });
  } else if (req.cookies && req.cookies.guest) {
    const decoded = jwt.verify(req.cookies.guest, JWT_SECRET) as userJwtClaims;
    const token = jwt.sign({ userId: decoded.userId, name: decoded.name, isGuest: true }, JWT_SECRET);
    let User: UserDetails = {
      id: decoded.userId,
      name: decoded.name,
      token: token,
      isGuest: true,
    };
    res.cookie('guest', token, cookieSettings);
    res.json(User);
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

router.get('/login/failed', (req: Request, res: Response) => {
  res.status(401).json({ success: false, message: 'failure' });
});

router.get('/logout', (req: Request, res: Response) => {
  const cookieClearOptions = {
    path: '/',
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };
  res.clearCookie('guest', cookieClearOptions);
  res.clearCookie('jwt', cookieClearOptions);
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
    }
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: true,
    failureRedirect: '/auth/login/failed',
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (!user?.id) return res.redirect('/login/failed');

      const token = jwt.sign({ userId: user.id, name: user.name ?? user.username ?? '' }, JWT_SECRET);
      res.cookie('guest', token, cookieSettings);

      const redirectUrl = new URL(CLIENT_URL);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('userId', user.id);
      redirectUrl.searchParams.set('name', user.name ?? user.username ?? '');
      return res.redirect(redirectUrl.toString());
    } catch {
      return res.redirect('/login/failed');
    }
  }
);

router.get('/github', passport.authenticate('github', { scope: ['read:user', 'user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: true,
    failureRedirect: '/auth/login/failed',
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (!user?.id) return res.redirect('/login/failed');

      const token = jwt.sign({ userId: user.id, name: user.name ?? user.username ?? '' }, JWT_SECRET);
      res.cookie('guest', token, cookieSettings);

      const redirectUrl = new URL(CLIENT_URL);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('userId', user.id);
      redirectUrl.searchParams.set('name', user.name ?? user.username ?? '');
      return res.redirect(redirectUrl.toString());
    } catch {
      return res.redirect('/login/failed');
    }
  }
);

export default router;
