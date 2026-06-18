# Chess

> A real-time, multiplayer online chess platform. Users can sign up, create/join matches, play moves in real time via WebSocket, and compete on a global rating system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS 3.4, Radix UI, Lucide React, Chess.js, Zustand, React Router DOM 6, Framer Motion |
| **Backend (REST API)** | Express 4, Passport.js, JWT, cookie-session, CORS, dotenv |
| **Realtime Game Server** | WebSocket (`ws` v8), port 8080, Chess.js for in-memory game state |
| **Realtime Communication** | WebRTC for in-game voice & video between opponents |
| **Database** | PostgreSQL via Prisma ORM 5.12 |
| **Cache / Session Layer** | Redis for session management, rate limiting, matchmaking queue, and hot data caching |
| **Mobile** | React Native via Expo 50, expo-router, react-native-reanimated, react-native-gesture-handler |
| **Monorepo / Tooling** | Turborepo, Yarn 1 workspaces, Husky + lint-staged, Prettier, ESLint (`@vercel/style-guide`), esbuild |

---

## Monorepo Structure

```
chess-monorepo/
├── apps/
│   ├── backend/       # Express REST API (auth, profile, stats)
│   ├── frontend/      # React + Vite web client
│   ├── ws/            # WebSocket server (real-time game engine)
│   └── native/        # React Native (Expo) mobile client
├── packages/
│   ├── db/            # Prisma client & schema
│   ├── store/         # Zustand stores (user, chessBoard)
│   ├── ui/            # Shared UI components (Button, Card, Code)
│   ├── tailwind-config/ # Shared Tailwind + PostCSS config
│   ├── typescript-config/ # Shared TSConfig references
│   └── eslint-config/    # Shared ESLint rules
├── package.json       # Root workspace config
├── turbo.json         # Turborepo pipeline config
└── tsconfig.json      # Root TypeScript references
```

---

## Database Schema (Prisma / PostgreSQL)

### Enums

| Enum | Values |
|---|---|
| `AuthProvider` | `EMAIL`, `GOOGLE`, `GITHUB`, `GUEST` |
| `GameStatus` | `IN_PROGRESS`, `COMPLETED`, `ABANDONED`, `TIME_UP`, `PLAYER_EXIT` |
| `GameResult` | `WHITE_WINS`, `BLACK_WINS`, `DRAW` |
| `TimeControl` | `CLASSICAL`, `RAPID`, `BLITZ`, `BULLET` |

### Models

- **User** — `id` (UUID PK), `username` (unique), `name`, `email` (unique), `provider`, `password`, `rating` (default 1200), relations to Game as white/black, `createdAt`, `lastLogin`. Indexed on `rating`.
- **Game** — `id` (UUID PK), `whitePlayerId`, `blackPlayerId`, `status`, `result`, `timeControl`, `startingFen`, `currentFen`, `startAt`, `endAt`, `moves` relation, `opening`, `event`. Indexed on `[status, result]`.
- **Move** — `id` (UUID PK), `gameId` (FK), `moveNumber`, `from`, `to`, `san`, `before`, `after`, `timeTaken`, `createdAt`, `comments`. Indexed on `gameId`.

### Migrations

Init → Update schema → Add name → Add from/to → Add time up → Add SAN → Rename columns → Remove Facebook login → Add player exit

---

## Authentication Flow

| Provider | Method | Description |
|---|---|---|
| **Google** | OAuth 2.0 via Passport | `GET /auth/google` → callback → JWT in `guest` cookie |
| **GitHub** | OAuth 2.0 via Passport | `GET /auth/github` → callback → JWT in `guest` cookie |
| **Guest** | `POST /auth/guest` | Creates user with `provider: GUEST`, returns JWT cookie |
| **Refresh** | `GET /auth/refresh` | Rotates JWT for session & guest users (COOKIE_MAX_AGE: 24h) |
| **Logout** | `GET /auth/logout` | Clears cookies & destroys session |

---

## REST API Endpoints (Backend)

| Route | Method | Auth | Description |
|---|---|---|---|
| `/auth/google` | GET | — | Initiate Google OAuth |
| `/auth/google/callback` | GET | — | Google OAuth callback |
| `/auth/github` | GET | — | Initiate GitHub OAuth |
| `/auth/github/callback` | GET | — | GitHub OAuth callback |
| `/auth/guest` | POST | — | Create guest account |
| `/auth/refresh` | GET | JWT | Refresh JWT token |
| `/auth/logout` | GET | Session | Logout / clear session |
| `/v1/` | GET | — | Health check stub |
| `/v1/profile/me` | GET | JWT | User profile + stats (total games, wins, losses, draws, best streak, current streak, recent 20 games) |

---

## WebSocket Server (Real-time Game Engine)

**Server:** `ws` v8 on port 8080  
**Game logic:** In-memory `Chess` instance per game, moves broadcast to room, persisted to Postgres via Prisma.

### Message Types

| Message | Direction | Description |
|---|---|---|
| `init_game` | Client → Server | Start matchmaking or join friend game (with `gameId`) |
| `INIT_GAME` | Internal | Triggers matchmaking queue or friend join |
| `MOVE` | Client → Server | Submit a chess move |
| `move` | Server → Client | Broadcast validated move to room |
| `EXIT_GAME` | Client → Server | Player exits game |
| `exit_game` | Server → Client | Notify opponent of exit |
| `JOIN_ROOM` | Client → Server | Reconnect to ongoing game |
| `join_room` / `game_joined` | Server → Client | Room join confirmation |
| `game_time` | Server → Client | Timer update broadcast |
| `game_over` | Server → Client | Game ended (checkmate, draw, etc.) |
| `opponent_disconnected` | Server → Client | Opponent left |
| `game_not_found` | Server → Client | Invalid game ID |
| `game_ended` | Server → Client | Game already finished on rejoin |
| `game_alert` | Server → Client | General alert |
| `game_added` | Server → Client | Game record created/updated |

### Game Logic

- **10-minute time control** per player (hardcoded `CLASSICAL`)
- **Abandon timer:** 60s disconnect timeout → opponent wins
- **Move validation:** Turn-based via `chess.js` legal move check
- **DB writes:** Prisma transaction — insert Move + update Game `currentFen`
- **Matchmaking:** Queue-based; pending game held until second player connects

---

## Frontend Routes

| Route | Screen | Description |
|---|---|---|
| `/` | Landing | Public landing page |
| `/login` | Login | Guest or OAuth login |
| `/dashboard` | Dashboard | Main dashboard (protected) |
| `/profile` | Profile | User stats & history |
| `/game/:gameId` | Live Game | Real-time online game with WS |
| `/game/friend/:inviteId?` | Friend Match | Join via invite link |
| `/game/local` | Local Play | Two players on same device |
| `/game/bot` | Bot Play | Single player vs engine (frontend ready, WS handler pending) |
| `/puzzle` | Puzzle Rush | UI ready |
| `/leaderboard` | Leaderboard | UI ready |
| `/tournaments` | Tournaments | UI ready |
| `/settings` | Settings | Theme & preferences |

---

## Live Game Features

- Real-time move broadcast via WebSocket
- Chess board rendering with piece movement
- Move audio feedback via WebRTC — low-latency audio streams between opponents instead of static files
- Multiplayer voice & video chat during live games (WebRTC peer-to-peer)
- Moves table / log sidebar with navigation
- Turn indicator, board flip toggle
- Per-player 10-minute timers
- Move replay (prev/next) via `chessBoardStore`
- Game end modal (checkmate, draw, timeout, player exit)
- Confetti animation on win
- Wait opponent loading + share game link
- Opponent disconnect handling

---

## Environment Variables

| Variable | Used In | Purpose |
|---|---|---|
| `DATABASE_URL` | Backend, WS, DB package | PostgreSQL connection string |
| `JWT_SECRET` | Backend, WS | JWT signing/verification secret |
| `COOKIE_SECRET` | Backend | Session cookie secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Backend | GitHub OAuth credentials |
| `AUTH_REDIRECT_URL` | Backend | OAuth success redirect (default `http://localhost:5173/game/random`) |
| `ALLOWED_HOSTS` | Backend | Comma-separated CORS origins |
| `PORT` | Backend | API server port (default 3000) |
| `VITE_APP_WS_URL` | Frontend | WebSocket URL (default `ws://localhost:8080`) |
| `REDIS_URL` | Backend, WS | Redis connection string |
| `REDIS_MAX_MEMORY` | Backend, WS | Redis memory eviction policy (default `allkeys-lru`) |
| `REDIS_TTL` | Backend, WS | TTL for session/matchmaking keys (default 24h) |

---

## Local Setup

```bash
# 1. Clone the repo
git clone <repo-url> && cd chess

# 2. Install dependencies
yarn install

# 3. Copy .env.example to .env in each app/package and update values

# 4. Start WebSocket server (real-time games)
cd apps/ws && yarn dev

# 5. Start Backend REST API (in a new terminal)
cd apps/backend && yarn dev

# 6. Start Frontend (in a new terminal)
cd apps/frontend && yarn dev
```

---

## Development Roadmap

> **Note:** All features listed below are currently in active development and will be rolled out incrementally. The project is under heavy development and the list will keep growing.

### Phase 1 — Core Infrastructure
- [ ] **Redis Integration** — In-memory caching for session management, JWT blacklisting, rate limiting, and real-time matchmaking queue. Reduces DB load and enables horizontal scaling of WS and backend instances.
- [ ] **Scalable Architecture** — Redis-backed pub/sub for multi-instance WebSocket server coordination, enabling horizontal scaling without sticky sessions.

### Phase 2 — Audio & Communication
- [ ] **WebRTC Signaling Server** — Lightweight signaling layer (integrated into existing WS server) for peer-to-peer connection negotiation.
- [ ] **WebRTC Voice & Video** — In-game voice and video calling between opponents; replaces static `move.wav` audio with live low-latency streams.
- [ ] **In-Game Chat** — Pre-defined quick messages + free-text chat during live matches with moderation and reporting.

### Phase 3 — Match Modes
- [ ] **Bot Matchmaking** — WS server will handle `BOT_JOIN` messages with difficulty levels (beginner, intermediate, expert).
- [ ] **Time Controls** — Selectable time formats (Blitz, Bullet, Rapid, Classical) with per-player clocks on the board.
- [ ] **Email/Password Auth** — Registration & login flow with traditional credentials.
- [ ] **Friends System** — Add friends, challenge directly, invite links, online presence indicators via Redis pub/sub.

### Phase 4 — Content & Competition
- [ ] **Puzzle Rush Mode** — Timed puzzle solving with rating adjustments and leaderboards.
- [ ] **Online Tournaments** — Bracket-based Swiss & round-robin tournaments with live pairings.
- [ ] **Global Leaderboard** — ELO-based ranking with season resets and tier progression (Bronze to Grandmaster).
- [ ] **Spectator Mode** — Watch ongoing high-rated games live with WebRTC stream relay.

### Phase 5 — Analysis & Polish
- [ ] **Game Analysis & Replay** — Post-game FEN/SAN analysis, opening detection, mistake highlighting with Stockfish integration.
- [ ] **AI Move Suggestion** — Optional engine hints during practice modes with difficulty tiers.
- [ ] **PGN Import/Export** — Full PGN support for saving and sharing games.
- [ ] **Spectator Replays & Share** — Shareable game links and embedded replay viewers.
- [ ] **Match History & Stats** — Detailed per-game analysis, win streaks, opening repertoire stats, performance charts.
- [ ] **Dark/Light/Custom Themes** — Multiple board themes (chess.com-style, classic wood, minimal, etc.).

### Phase 6 — Platform & Quality of Life
- [ ] **Mobile Experience** — Full React Native (Expo) app with native board gestures, haptics, and push notifications.
- [ ] **Achievements & Badges** — Unlockable milestones and visual rewards.
- [ ] **Admin Panel** — User management, tournament moderation, cheating reports, server health dashboard.
- [ ] **Multi-Region Deployment** — CDN-backed static assets, edge-cached API responses, geo-distributed WebSocket servers.
- [ ] **Rate Limiting & Anti-Cheat** — Request throttling with Redis sliding window, move-sanity checks, and suspicious pattern detection.

> The platform is built to scale — from casual play to competitive tournaments. Every feature is designed around a fast, real-time chess experience.

---

## Contributing

This is a open-source project. Contributions are welcome — whether it's a new feature, bug fix, or documentation improvement.
