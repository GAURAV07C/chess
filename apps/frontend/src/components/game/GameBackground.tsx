import { ReactNode } from 'react';

interface GameBackgroundProps {
  children: ReactNode;
}

const GameBackground = ({ children }: GameBackgroundProps) => (
  <div className="min-h-screen bg-[#030611] text-white relative overflow-hidden selection:bg-amber-500/30 selection:text-white">
    <div className="absolute top-[-200px] left-[10%] w-[700px] h-[700px] rounded-full bg-amber-500/[0.05] blur-[120px] pointer-events-none -z-10" />
    <div className="absolute bottom-[15%] right-[5%] w-[600px] h-[600px] rounded-full bg-sky-500/[0.04] blur-[130px] pointer-events-none -z-10" />
    <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.03] blur-[100px] pointer-events-none -z-10" />
    <div
      className="absolute inset-0 opacity-[0.2] -z-20"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    />
    {children}
  </div>
);

export { GameBackground };
