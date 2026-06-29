const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
import passport from 'passport';
import dotenv from 'dotenv';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

interface GithubEmailRes {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: 'private' | 'public';
}

dotenv.config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'your_github_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret';

export function initPassport() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('Missing environment variables for authentication providers');
  }

  passport.use(
    new GoogleStrategy(
      { clientID: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, callbackURL: '/auth/google/callback' },
      async function (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google profile has no email'));
        let guestUUID = 'google-' + uuidv4();

        const derivedUsername = (profile.displayName + guestUUID || email.split('@')[0] || `google-${email}`)
          .replace(/\s+/g, '')
          .slice(0, 30);

        const user = await db.user.upsert({
          create: { username: derivedUsername, email, name: profile.displayName, provider: 'GOOGLE' },
          update: { name: profile.displayName },
          where: { email },
        });

        done(null, user);
      }
    )
  );

  passport.use(
    new GithubStrategy(
      { clientID: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET, callbackURL: '/auth/github/callback' },
      async function (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) {
        const res = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${accessToken}` },
        });
        const data: GithubEmailRes[] = await res.json();
        const primaryEmail = data.find((item) => item.primary === true);

        const email = primaryEmail?.email;
        if (!email) return done(new Error('GitHub primary email not found'));

        let guestUUID = 'github-' + uuidv4();

        const derivedUsername = (
          profile.displayName + guestUUID ||
          profile.username ||
          email.split('@')[0] ||
          `github-${email}`
        )
          .replace(/\s+/g, '')
          .slice(0, 30);

        const user = await db.user.upsert({
          create: { username: derivedUsername, email, name: profile.displayName, provider: 'GITHUB' },
          update: { name: profile.displayName },
          where: { email },
        });

        done(null, user);
      }
    )
  );

  passport.serializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, { id: user.id, username: user.username, picture: user.picture });
    });
  });

  passport.deserializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
}
