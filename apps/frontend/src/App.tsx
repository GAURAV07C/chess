import { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';
import { Dashboard } from './screens/Dashboard';
import { Profile } from './screens/Profile';
import Login from './screens/Login';
import { Settings } from './screens/Settings';
import { Themes } from "./components/themes";
import { ThemesProvider } from "./context/themeContext";
import { Loader } from './components/Loader';
import { Layout } from './layout';
import { useHydratedUser } from './hooks/useHydratedUser';

import "./App.css";
import "./themes.css";
import { FriendMatch } from './screens/FriendMatch';
import { LocalPlay } from './screens/LocalPlay';
import { BotPlay } from './screens/BotPlay';
import { PuzzleRush } from './screens/PuzzleRush';
import { Leaderboard } from './screens/Leaderboard';
import Tournaments from './screens/Tournaments';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, mounted } = useHydratedUser();
  if (!mounted) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, mounted } = useHydratedUser();
  if (!mounted) return <Loader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-bgMain text-textMain">
      <Suspense fallback={<Loader />}>
        <ThemesProvider>
          <AuthApp />
        </ThemesProvider>
      </Suspense>
    </div>
  );
}

function AuthApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Layout><Landing /></Layout>}
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:gameId"
          element={<Layout><Game /></Layout>}
        />
        <Route
          path="/game/friend/:inviteId?"
          element={<Layout><FriendMatch /></Layout>}
        />
        <Route
          path="/game/local"
          element={<Layout><LocalPlay /></Layout>}
        />
        <Route
          path="/game/bot"
          element={<Layout><BotPlay /></Layout>}
        />
        <Route
          path="/puzzle"
          element={<Layout><PuzzleRush /></Layout>}
        />
        <Route
          path="/leaderboard"
          element={<Layout><Leaderboard /></Layout>}
        />
        <Route
          path="/tournaments"
          element={<Layout><Tournaments /></Layout>}
        />
        <Route
          path="/settings"
          element={<Layout><Settings /></Layout>}
        >
          <Route path="themes" element={<Themes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
