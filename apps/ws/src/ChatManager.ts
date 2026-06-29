import { SocketManager } from './SocketManager';
import { ChatRoom, ChatMessage } from './chat/types';

const PREDEFINED_MESSAGES = [
  { id: 'good_luck', text: 'Good luck!' },
  { id: 'well_played', text: 'Well played!' },
  { id: 'nice_move', text: 'Nice move!' },
  { id: 'thanks', text: 'Thanks!' },
  { id: 'good_game', text: 'Good game!' },
];

export class ChatManager {
  private static instance: ChatManager;
  private chats: Map<string, ChatRoom>;
  private userChats: Map<string, string[]>;
  private socketManager: SocketManager;

  private constructor(socketManager: SocketManager) {
    this.chats = new Map();
    this.userChats = new Map();
    this.socketManager = socketManager;
  }

  static getInstance(socketManager?: SocketManager): ChatManager {
    if (!ChatManager.instance) {
      if (!socketManager) throw new Error('SocketManager required for first init');
      ChatManager.instance = new ChatManager(socketManager);
    }
    return ChatManager.instance;
  }

  createDefaultChat(user1Id: string, user2Id: string): ChatRoom {
    const chat: ChatRoom = {
      id: `chat_${user1Id}_${user2Id}`,
      user1Id,
      user2Id,
      isCustom: false,
      status: 'accepted',
      blockedBy: null,
      emojiBlockedBy: null,
      messages: [],
    };
    this.chats.set(chat.id, chat);
    this.addToUserChats(user1Id, chat.id);
    this.addToUserChats(user2Id, chat.id);

    this.socketManager.sendToUser(
      user1Id,
      JSON.stringify({
        type: 'chat_created',
        chatId: chat.id,
        isCustom: false,
        status: 'accepted',
        predefinedMessages: PREDEFINED_MESSAGES,
      })
    );
    this.socketManager.sendToUser(
      user2Id,
      JSON.stringify({
        type: 'chat_created',
        chatId: chat.id,
        isCustom: false,
        status: 'accepted',
        predefinedMessages: PREDEFINED_MESSAGES,
      })
    );

    return chat;
  }

  requestCustomChat(fromUserId: string, toUserId: string): ChatRoom | null {
    const chatId = `chat_${fromUserId}_${toUserId}`;
    const existing = this.chats.get(chatId);
    if (existing) {
      if (existing.isCustom && existing.status === 'pending') {
        return existing;
      }
      if (existing.isCustom && existing.status === 'accepted') {
        return existing;
      }
      return null;
    }

    const chat: ChatRoom = {
      id: chatId,
      user1Id: fromUserId,
      user2Id: toUserId,
      isCustom: true,
      status: 'pending',
      blockedBy: null,
      emojiBlockedBy: null,
      messages: [],
    };
    this.chats.set(chat.id, chat);
    this.addToUserChats(fromUserId, chat.id);
    this.addToUserChats(toUserId, chat.id);

    this.socketManager.sendToUser(
      toUserId,
      JSON.stringify({
        type: 'custom_chat_request',
        chatId: chat.id,
        fromUserId,
      })
    );
    return chat;
  }

  acceptCustomChat(chatId: string, userId: string): boolean {
    const chat = this.chats.get(chatId);
    if (!chat || chat.status !== 'pending') return false;
    chat.status = 'accepted';
    this.socketManager.sendToUser(
      chat.user1Id,
      JSON.stringify({
        type: 'custom_chat_accepted',
        chatId,
      })
    );
    this.socketManager.sendToUser(
      chat.user2Id,
      JSON.stringify({
        type: 'custom_chat_accepted',
        chatId,
      })
    );
    return true;
  }

  rejectCustomChat(chatId: string, userId: string): boolean {
    const chat = this.chats.get(chatId);
    if (!chat || chat.status !== 'pending') return false;
    chat.status = 'rejected';
    const requesterId = chat.user1Id;
    this.socketManager.sendToUser(
      requesterId,
      JSON.stringify({
        type: 'custom_chat_rejected',
        chatId,
      })
    );
    this.socketManager.sendToUser(
      chat.user2Id,
      JSON.stringify({
        type: 'custom_chat_rejected',
        chatId,
      })
    );
    return true;
  }

  sendPredefinedMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    predefinedId: string
  ): ChatMessage | null {
    const chat = this.chats.get(chatId);
    if (!chat || chat.isCustom) return null;
    if (chat.blockedBy) return null;

    const predefined = PREDEFINED_MESSAGES.find((m) => m.id === predefinedId);
    if (!predefined) return null;

    const receiverId = chat.user1Id === senderId ? chat.user2Id : chat.user1Id;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      chatId,
      senderId,
      senderName,
      content: predefined.text,
      hasEmoji: false,
      createdAt: Date.now(),
    };
    chat.messages.push(msg);

    this.socketManager.sendToUser(senderId, JSON.stringify({ type: 'chat_message', ...msg }));
    this.socketManager.sendToUser(receiverId, JSON.stringify({ type: 'chat_message', ...msg }));
    return msg;
  }

  sendCustomMessage(chatId: string, senderId: string, senderName: string, content: string): ChatMessage | null {
    const chat = this.chats.get(chatId);
    if (!chat || !chat.isCustom || chat.status !== 'accepted') return null;
    if (chat.blockedBy) return null;

    const receiverId = chat.user1Id === senderId ? chat.user2Id : chat.user1Id;

    const hasEmoji =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(
        content
      );
    if (hasEmoji && chat.emojiBlockedBy) return null;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      chatId,
      senderId,
      senderName,
      content,
      hasEmoji,
      createdAt: Date.now(),
    };
    chat.messages.push(msg);

    this.socketManager.sendToUser(senderId, JSON.stringify({ type: 'chat_message', ...msg }));
    this.socketManager.sendToUser(receiverId, JSON.stringify({ type: 'chat_message', ...msg }));
    return msg;
  }

  sendSystemMessage(chatId: string, content: string) {
    const chat = this.chats.get(chatId);
    if (!chat) return;
    const msg: ChatMessage = {
      id: `sys_${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'System',
      content,
      hasEmoji: false,
      createdAt: Date.now(),
    };
    chat.messages.push(msg);
    this.broadcastChat(chatId, { type: 'chat_message', ...msg });
  }

  blockChat(blockerId: string, targetId: string) {
    const chat = this.getChatBetween(blockerId, targetId);
    if (!chat || chat.blockedBy) return;
    chat.blockedBy = blockerId;
    this.socketManager.sendToUser(
      blockerId,
      JSON.stringify({ type: 'chat_blocked', targetUserId: targetId, byUserId: blockerId })
    );
    this.socketManager.sendToUser(
      targetId,
      JSON.stringify({ type: 'chat_blocked', targetUserId: blockerId, byUserId: blockerId })
    );
  }

  unblockChat(unblockerId: string, targetId: string) {
    const chat = this.getChatBetween(unblockerId, targetId);
    if (!chat || chat.blockedBy !== unblockerId) return;
    chat.blockedBy = null;
    this.socketManager.sendToUser(unblockerId, JSON.stringify({ type: 'chat_unblocked', targetUserId: targetId }));
    this.socketManager.sendToUser(targetId, JSON.stringify({ type: 'chat_unblocked', targetUserId: unblockerId }));
  }

  blockEmoji(blockerId: string, targetId: string) {
    const chat = this.getChatBetween(blockerId, targetId);
    if (!chat || chat.emojiBlockedBy) return;
    chat.emojiBlockedBy = blockerId;
    this.socketManager.sendToUser(
      blockerId,
      JSON.stringify({ type: 'emoji_blocked', targetUserId: targetId, byUserId: blockerId })
    );
    this.socketManager.sendToUser(
      targetId,
      JSON.stringify({ type: 'emoji_blocked', targetUserId: blockerId, byUserId: blockerId })
    );
  }

  unblockEmoji(unblockerId: string, targetId: string) {
    const chat = this.getChatBetween(unblockerId, targetId);
    if (!chat || chat.emojiBlockedBy !== unblockerId) return;
    chat.emojiBlockedBy = null;
    this.socketManager.sendToUser(unblockerId, JSON.stringify({ type: 'emoji_unblocked', targetUserId: targetId }));
    this.socketManager.sendToUser(targetId, JSON.stringify({ type: 'emoji_unblocked', targetUserId: unblockerId }));
  }

  getChatBetween(user1Id: string, user2Id: string): ChatRoom | undefined {
    const id1 = `chat_${user1Id}_${user2Id}`;
    const id2 = `chat_${user2Id}_${user1Id}`;
    return this.chats.get(id1) || this.chats.get(id2);
  }

  getChat(chatId: string): ChatRoom | undefined {
    return this.chats.get(chatId);
  }

  removeChat(chatId: string) {
    this.chats.delete(chatId);
  }

  private addToUserChats(userId: string, chatId: string) {
    if (!this.userChats.has(userId)) {
      this.userChats.set(userId, []);
    }
    this.userChats.get(userId)!.push(chatId);
  }

  private broadcastChat(chatId: string, payload: any) {
    const chat = this.chats.get(chatId);
    if (!chat) return;
    this.socketManager.sendToUser(chat.user1Id, JSON.stringify(payload));
    this.socketManager.sendToUser(chat.user2Id, JSON.stringify(payload));
  }
}
