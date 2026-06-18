import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isGame = location.pathname.startsWith('/game/');
  const isPuzzle = location.pathname === '/puzzle';
  const isTournaments = location.pathname === '/tournaments';

  if (isLanding || isGame || isPuzzle || isTournaments) {
    return <>{children}</>;
  }

  return (
    <div className="flex border-collapse">
      <Sidebar />
      <main className="flex-1 pt-[2rem] pb-1 mx-auto max-w-[1100px]">
        {children}
      </main>
    </div>
  );
};
