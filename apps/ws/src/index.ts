import dotenv from 'dotenv';
import path from 'path';
import { WebSocketServer } from 'ws';

// Resolve .env from the project root (three levels up from dist)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('🔐 WS JWT_SECRET loaded:', process.env.JWT_SECRET);

import { GameManager } from './GameManager';

import { extractAuthUser } from './auth';

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const gameManager = new GameManager();

wss.on('connection', function connection(ws, req) {
  const token = (() => {
    try {
      // req.url may be a relative URL; construct a base to use WHATWG URL API
      const base = `http://localhost:${wss.options?.port ?? 8080}`;
      const urlObj = new URL(req.url ?? '', base);
      return urlObj.searchParams.get('token') ?? '';
    } catch (e) {
      console.error('🔧 URL parsing error:', e);
      return '';
    }
  })();
  const user = extractAuthUser(token, ws);
  gameManager.addUser(user);

  ws.on('close', () => {
    gameManager.removeUser(ws);
  });
});

console.log('done');
