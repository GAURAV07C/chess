type DividerProps = {
  title: string;
};

export const Divider = ({ title }: DividerProps) => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-slate-900/80" />
    </div>
    <div className="relative flex justify-center text-xs">
      <span className="px-4 bg-[#0b0f1f] text-slate-500 font-mono">{title}</span>
    </div>
  </div>
);
