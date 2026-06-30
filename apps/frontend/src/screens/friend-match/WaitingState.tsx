import { ShareLinkInput } from './ShareLinkInput';

type WaitingStateProps = {
  gameId: string;
  onCopy: () => void;
};

export const WaitingState = ({ gameId, onCopy }: WaitingStateProps) => (
  <div className="text-center">
    <h2 className="text-2xl font-bold text-white mb-4">Create a Friend Match</h2>
    <p className="text-slate-300 mb-4">Share the link below with a friend. When they open it, the game will start.</p>
    <ShareLinkInput gameId={gameId} onCopy={onCopy} />
  </div>
);
