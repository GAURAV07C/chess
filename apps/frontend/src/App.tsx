import { RecoilRoot } from 'recoil';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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

import "./App.css";
import "./themes.css";

export default function App() {
  return (
    <div className="min-h-screen bg-bgMain text-textMain">
      <RecoilRoot>
        <Suspense fallback={<Loader />}>
          <ThemesProvider>
            <AuthApp />
          </ThemesProvider>
        </Suspense>
      </RecoilRoot>
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
          element={<Login />}
        />
        <Route
          path="/game/:gameId"
          element={<Layout><Game /></Layout>}
        />
        <Route
          path='/settings'
          element={<Layout><Settings /></Layout>}
        >
          <Route path="themes" element={<Themes />} />
        </Route>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/profile"
          element={<Profile />}
        />
      </Routes>
    </BrowserRouter>
  );
}
