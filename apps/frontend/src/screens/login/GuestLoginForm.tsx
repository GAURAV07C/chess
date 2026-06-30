import { motion } from 'motion/react';
import { useState } from 'react';
type LoginFormProps = {
  onGuestSubmit: (name: string) => void;
};

export const GuestLoginForm = ({ onGuestSubmit }: LoginFormProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuestSubmit(name);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Choose a username"
        className="w-full bg-slate-950/60 border border-slate-900 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-white pl-4 pr-4 py-3 rounded-xl text-sm placeholder:text-slate-600 focus:outline-none transition-all"
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 text-sm font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 tracking-wide cursor-pointer"
      >
        Enter Arena
      </button>
    </motion.form>
  );
};
