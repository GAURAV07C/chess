import { useUser } from '@repo/store/useUser';
import { Metadata } from '@/screens/gameConstants';
import { UserAvatar } from '../UserAvatar';
import { getTimer } from './gameHelpers';

interface PlayerPanelProps {
  gameMetadata: Metadata | null;
  player1TimeConsumed: number;
  player2TimeConsumed: number;
  self?: boolean;
}

const PlayerPanel = ({ gameMetadata, player1TimeConsumed, player2TimeConsumed, self }: PlayerPanelProps) => {
  const user = useUser();

  if (!gameMetadata || !user) return null;

  return (
    <div className="rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 p-4 shadow-lg flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start gap-4">
      <UserAvatar gameMetadata={gameMetadata} self={self} />
      <div className="lg:mt-auto lg:pt-4 lg:border-t lg:border-slate-800/60 flex lg:justify-center">
        {getTimer(
          self
            ? user?.id === gameMetadata?.whitePlayer?.id
              ? player1TimeConsumed
              : player2TimeConsumed
            : user?.id === gameMetadata?.whitePlayer?.id
              ? player2TimeConsumed
              : player1TimeConsumed
        )}
      </div>
    </div>
  );
};

export { PlayerPanel };
