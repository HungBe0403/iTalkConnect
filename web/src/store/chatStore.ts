import { create } from 'zustand';
import { chatApi } from '../lib/api';

interface Conversation {
  id: string;
  name?: string;
  type: 'private' | 'group';
  lastMessage?: Message;
  unreadCount: number;
  participants: User[];
  updatedAt: string;
  isGroup: boolean;
  avatar?: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: string;
  [key: string]: any;
}

interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  createdAt: string;
  updatedAt: string;
  isRecalled: boolean;
  isRead: boolean;
  media?: Media[];
  reactions?: Record<string, string[]>;
  [key: string]: any;
}

interface Media {
  id: string;
  url: string;
  type: string;
  name: string;
  size: number;
  [key: string]: any;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  messageLoading: boolean;
  hasMore: Record<string, boolean>;
  
  fetchConversations: () => Promise<void>;
  setActiveConversation: (id: string | null) => Promise<void>;
  fetchMessages: (conversationId: string, before?: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, mediaIds?: string[]) => Promise<void>;
  readMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: string) => Promise<void>;
  recallMessage: (messageId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessageStatus: (conversationId: string, messageId: string, isRead: boolean) => void;
  resetUnreadCount: (conversationId: string) => void;
}

const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  loading: false,
  messageLoading: false,
  hasMore: {},

  fetchConversations: async () => {
    try {
      set({ loading: true });
      const { data } = await chatApi.getConversations();
      set({ conversations: data.conversations || [] });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      set({ loading: false });
    }
  },

  setActiveConversation: async (id: string | null) => {
    if (!id) {
      set({ activeConversation: null });
      return;
    }

    const { conversations } = get();
    const conversation = conversations.find(c => c.id === id);

    if (conversation) {
      set({ activeConversation: conversation });
      
      // Reset unread count
      if (conversation.unreadCount > 0) {
        get().resetUnreadCount(id);
      }
      
      // Fetch messages if not already loaded
      if (!get().messages[id] || get().messages[id].length === 0) {
        await get().fetchMessages(id);
      }
    }
  },

  fetchMessages: async (conversationId: string, before?: string) => {
    try {
      set({ messageLoading: true });
      const { data } = await chatApi.getMessages(conversationId, 20, before);
      
      const currentMessages = get().messages[conversationId] || [];
      const newMessages = data.messages || [];
      
      // Check if there are more messages to load
      set({
        hasMore: {
          ...get().hasMore,
          [conversationId]: newMessages.length === 20,
        }
      });
      
      if (before) {
        // If loading older messages, append them at the beginning
        set({
          messages: {
            ...get().messages,
            [conversationId]: [...newMessages, ...currentMessages],
          }
        });
      } else {
        // If initial load, replace all messages
        set({
          messages: {
            ...get().messages,
            [conversationId]: newMessages,
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      set({ messageLoading: false });
    }
  },

  sendMessage: async (conversationId: string, content: string, mediaIds?: string[]) => {
    try {
      const { data } = await chatApi.sendMessage(conversationId, content, mediaIds);
      
      // Add new message to the conversation
      get().addMessage(data.message);
      
      // Update conversation's last message
      const updatedConversations = get().conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: data.message,
            updatedAt: new Date().toISOString(),
          };
        }
        return conv;
      });
      
      // Sort conversations by updatedAt
      updatedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      set({ conversations: updatedConversations });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  readMessage: async (messageId: string) => {
    try {
      await chatApi.readMessage(messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  },

  addReaction: async (messageId: string, reaction: string) => {
    try {
      await chatApi.addReaction(messageId, reaction);
      
      // Update message reaction locally
      const { messages } = get();
      
      // Find the conversation that contains this message
      let conversationId = '';
      for (const [convId, msgs] of Object.entries(messages)) {
        const msg = msgs.find(m => m.id === messageId);
        if (msg) {
          conversationId = convId;
          break;
        }
      }
      
      if (!conversationId) return;
      
      const updatedMessages = messages[conversationId].map(msg => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || {};
          return {
            ...msg,
            reactions: {
              ...currentReactions,
              [reaction]: [...(currentReactions[reaction] || []), get().activeConversation?.participants[0].id || ''],
            },
          };
        }
        return msg;
      });
      
      set({
        messages: {
          ...messages,
          [conversationId]: updatedMessages,
        }
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  },

  recallMessage: async (messageId: string) => {
    try {
      await chatApi.recallMessage(messageId);
      
      // Update message status locally
      const { messages } = get();
      
      // Find the conversation that contains this message
      let conversationId = '';
      for (const [convId, msgs] of Object.entries(messages)) {
        const msg = msgs.find(m => m.id === messageId);
        if (msg) {
          conversationId = convId;
          break;
        }
      }
      
      if (!conversationId) return;
      
      const updatedMessages = messages[conversationId].map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            isRecalled: true,
          };
        }
        return msg;
      });
      
      set({
        messages: {
          ...messages,
          [conversationId]: updatedMessages,
        }
      });
      
      // Update conversation's last message if needed
      const updatedConversations = get().conversations.map(conv => {
        if (conv.id === conversationId && conv.lastMessage?.id === messageId) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              isRecalled: true,
            },
          };
        }
        return conv;
      });
      
      set({ conversations: updatedConversations });
    } catch (error) {
      console.error('Failed to recall message:', error);
    }
  },

  addMessage: (message: Message) => {
    const { messages, conversations } = get();
    const conversationId = message.conversationId;
    
    // Add message to conversation
    const conversationMessages = messages[conversationId] || [];
    
    set({
      messages: {
        ...messages,
        [conversationId]: [...conversationMessages, message],
      }
    });
    
    // Update conversation unread count if not active
    if (get().activeConversation?.id !== conversationId) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: conv.unreadCount + 1,
            lastMessage: message,
            updatedAt: message.createdAt,
          };
        }
        return conv;
      });
      
      // Sort conversations by updatedAt
      updatedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      set({ conversations: updatedConversations });
    }
  },

  updateMessageStatus: (conversationId: string, messageId: string, isRead: boolean) => {
    const { messages } = get();
    
    if (!messages[conversationId]) return;
    
    const updatedMessages = messages[conversationId].map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          isRead,
        };
      }
      return msg;
    });
    
    set({
      messages: {
        ...messages,
        [conversationId]: updatedMessages,
      }
    });
  },

  resetUnreadCount: (conversationId: string) => {
    const { conversations } = get();
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
        };
      }
      return conv;
    });
    
    set({ conversations: updatedConversations });
  }
}));

export default useChatStore;