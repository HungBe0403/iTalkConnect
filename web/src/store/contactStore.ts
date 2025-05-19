import { create } from 'zustand';
import { contactApi } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  [key: string]: any;
}

interface Contact {
  id: string;
  user: User;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
  isOutgoing?: boolean;
}

interface ContactState {
  contacts: Contact[];
  pendingRequests: Contact[];
  blockedUsers: Contact[];
  loading: boolean;
  
  fetchContacts: () => Promise<void>;
  sendContactRequest: (userId: string) => Promise<void>;
  acceptContactRequest: (userId: string) => Promise<void>;
  rejectContactRequest: (userId: string) => Promise<void>;
  cancelContactRequest: (userId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  removeContact: (userId: string) => Promise<void>;
}

const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  pendingRequests: [],
  blockedUsers: [],
  loading: false,
  
  fetchContacts: async () => {
    try {
      set({ loading: true });
      
      // Fetch accepted contacts
      const { data: acceptedData } = await contactApi.getContacts('accepted');
      
      // Fetch pending contacts
      const { data: pendingData } = await contactApi.getContacts('pending');
      
      // Fetch blocked contacts
      const { data: blockedData } = await contactApi.getContacts('blocked');
      
      set({
        contacts: acceptedData.contacts || [],
        pendingRequests: pendingData.contacts || [],
        blockedUsers: blockedData.contacts || [],
      });
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  sendContactRequest: async (userId: string) => {
    try {
      set({ loading: true });
      await contactApi.sendContactRequest(userId);
      await get().fetchContacts();
    } catch (error) {
      console.error('Failed to send contact request:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  acceptContactRequest: async (userId: string) => {
    try {
      set({ loading: true });
      await contactApi.acceptContactRequest(userId);
      
      const pendingRequest = get().pendingRequests.find(
        req => req.user.id === userId
      );
      
      if (pendingRequest) {
        // Remove from pending and add to contacts
        set({
          pendingRequests: get().pendingRequests.filter(
            req => req.user.id !== userId
          ),
          contacts: [...get().contacts, {
            ...pendingRequest,
            status: 'accepted',
            updatedAt: new Date().toISOString(),
          }],
        });
      } else {
        // Reload all contacts
        await get().fetchContacts();
      }
    } catch (error) {
      console.error('Failed to accept contact request:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  rejectContactRequest: async (userId: string) => {
    try {
      set({ loading: true });
      await contactApi.rejectContactRequest(userId);
      
      // Remove from pending requests
      set({
        pendingRequests: get().pendingRequests.filter(
          req => req.user.id !== userId
        ),
      });
    } catch (error) {
      console.error('Failed to reject contact request:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  cancelContactRequest: async (userId: string) => {
    try {
      set({ loading: true });
      await contactApi.cancelContactRequest(userId);
      
      // Remove from pending requests
      set({
        pendingRequests: get().pendingRequests.filter(
          req => req.user.id !== userId && !req.isOutgoing
        ),
      });
    } catch (error) {
      console.error('Failed to cancel contact request:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  blockUser: async (userId: string) => {
    try {
      set({ loading: true });
      await contactApi.blockUser(userId);
      
      // Find the contact to block
      const contactToBlock = get().contacts.find(
        contact => contact.user.id === userId
      );
      
      if (contactToBlock) {
        // Remove from contacts and add to blocked
        set({
          contacts: get().contacts.filter(
            contact => contact.user.id !== userId
          ),
          blockedUsers: [...get().blockedUsers, {
            ...contactToBlock,
            status: 'blocked',
            updatedAt: new Date().toISOString(),
          }],
        });
      } else {
        // Reload all contacts
        await get().fetchContacts();
      }
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  unblockUser: async (userId: string) => {
    try {
      set({ loading: true });
      await contactApi.unblockUser(userId);
      
      // Remove from blocked users
      set({
        blockedUsers: get().blockedUsers.filter(
          user => user.user.id !== userId
        ),
      });
    } catch (error) {
      console.error('Failed to unblock user:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  removeContact: async (userId: string) => {
    try {
      set({ loading: true });
      await contactApi.removeContact(userId);
      
      // Remove from contacts
      set({
        contacts: get().contacts.filter(
          contact => contact.user.id !== userId
        ),
      });
    } catch (error) {
      console.error('Failed to remove contact:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useContactStore;