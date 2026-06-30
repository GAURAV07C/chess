import { motion } from 'motion/react';

export const SocialLoginButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-white text-sm font-bold transition-all cursor-pointer"
  >
    {children}
  </motion.button>
);
