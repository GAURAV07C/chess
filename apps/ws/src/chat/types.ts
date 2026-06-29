export interface ChatRoom {
  id: string;
  user1Id: string;
  user2Id: string;
  isCustom: boolean;
  status: 'pending' | 'accepted' | 'rejected';
  blockedBy: string | null;
  emojiBlockedBy: string | null;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  hasEmoji: boolean;
  createdAt: number;
}
