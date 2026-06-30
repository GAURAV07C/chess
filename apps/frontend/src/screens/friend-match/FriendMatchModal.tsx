import { type ReactNode } from 'react';

type ModalProps = {
  children: ReactNode;
};

export const Modal = ({ children }: ModalProps) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-6 shadow-xl max-w-md w-full">{children}</div>
  </div>
);
