import { ClipboardCopyIcon } from 'lucide-react';

type ShareLinkInputProps = {
  gameId: string;
  onCopy: () => void;
};

export const ShareLinkInput = ({ gameId, onCopy }: ShareLinkInputProps) => {
  const link = `${window.location.origin}/game/friend/${gameId}`;
  return (
    <div className="flex items-center justify-center space-x-2">
      <input
        readOnly
        value={link}
        className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded w-full"
      />
      <button onClick={onCopy} className="p-2 bg-amber-500 rounded hover:bg-amber-600">
        <ClipboardCopyIcon size={20} className="text-white" />
      </button>
    </div>
  );
};
