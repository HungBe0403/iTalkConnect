import { create } from 'zustand';
import { notificationApi } from '../lib/api';

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  data: any;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  
  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const { data } = await notificationApi.getNotifications();
      
      set({
        notifications: data.notifications || [],
        unreadCount: data.notifications?.filter((n: Notification) => !n.isRead).length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  markAsRead: async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      
      const updatedNotifications = get().notifications.map(notif => {
        if (notif.id === id) {
          return { ...notif, isRead: true };
        }
        return notif;
      });
      
      set({
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length,
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },
  
  addNotification: (notification: Notification) => {
    const { notifications } = get();
    
    set({
      notifications: [notification, ...notifications],
      unreadCount: get().unreadCount + (notification.isRead ? 0 : 1),
    });
  },
}));

export default useNotificationStore;