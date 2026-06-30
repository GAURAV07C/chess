import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isOwn: boolean;
}

interface User {
  id: string;
  name: string;
}

export const Chat = ({
  gameId,
  socket,
  messages,
  onSendMessage,
  user,
}: {
  gameId?: string;
  socket: WebSocket | null;
  messages: Message[];
  onSendMessage: (msg: Message) => void;
  user: User | null;
}) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = user?.id ?? null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !gameId) return;
    const messageText = input.trim();
    const senderName = user?.name || 'Me';

    socket.send(
      JSON.stringify({
        type: 'CHAT',
        payload: {
          gameId,
          message: messageText,
          senderId: currentUser,
          senderName,
        },
      })
    );

    onSendMessage({
      id: Date.now().toString(),
      sender: senderName,
      text: messageText,
      timestamp: Date.now(),
      isOwn: true,
    });

    setInput('');
    setIsOpen(false);

    toast.success(`You: ${messageText}`, {
      duration: 3000,
      position: 'top-center',
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
      >
        💬 Chat
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Chat</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xl px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="h-[300px] overflow-y-auto p-3 space-y-2 custom-scrollbar mb-3">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-500 mb-0.5">{msg.sender}</span>
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-1.5 text-xs ${
                        msg.isOwn
                          ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-sm font-bold rounded-lg transition-all"
              >
                Send
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
