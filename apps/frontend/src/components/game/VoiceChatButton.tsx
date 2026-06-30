import { Mic, MicOff } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from 'sonner';

const VoiceChatButton = ({
  gameId,
  socket,
  user,
  opponentId,
}: {
  gameId: string;
  socket: WebSocket | null;
  user: { id: string; name: string } | null;
  opponentId: string | null;
}) => {
  const { isMicOn, isConnecting, toggleMic } = useWebRTC(gameId, socket, user, opponentId);

  const handleToggle = async () => {
    try {
      await toggleMic();
    } catch (err) {
      toast.error('Microphone access denied or unavailable');
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isConnecting}
      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
        isMicOn
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
      }`}
    >
      {isConnecting ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Connecting...
        </span>
      ) : isMicOn ? (
        <span className="flex items-center justify-center gap-2">
          <Mic size={16} /> Voice On
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <MicOff size={16} /> Voice Off
        </span>
      )}
    </button>
  );
};

export { VoiceChatButton };
