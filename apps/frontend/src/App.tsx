import { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';
import { Dashboard } from './screens/Dashboard';
import { Profile } from './screens/Profile';
import Login from './screens/Login';
import AuthCallback from './screens/AuthCallback';
import { ThemesProvider } from './context/themeContext';
import { Loader } from './components/Loader';
import { Layout } from './layout';
import { useHydratedUser } from './hooks/useHydratedUser';
import { Toaster } from 'sonner';

import './App.css';
import './themes.css';
import { FriendMatch } from './screens/FriendMatch';
import { BotPlay } from './screens/BotPlay';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, mounted } = useHydratedUser();
  const location = useLocation();
  if (!mounted) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
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
      <Toaster />
    </div>
  );
}

function AuthApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Landing />
            </Layout>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
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
          element={
            <ProtectedRoute>
              <Layout>
                <Game />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/friend/:inviteId?"
          element={
            <ProtectedRoute>
              <Layout>
                <FriendMatch />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/bot"
          element={
            <ProtectedRoute>
              <Layout>
                <BotPlay />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
