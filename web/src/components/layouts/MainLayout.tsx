import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import MobileNav from '../navigation/MobileNav';
import useChatStore from '../../store/chatStore';
import useContactStore from '../../store/contactStore';
import useNotificationStore from '../../store/notificationStore';
import { useSocket } from '../../hooks/useSocket';

const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { socket } = useSocket();
  
  const {
    fetchConversations,
    addMessage,
    updateMessageStatus
  } = useChatStore();
  
  const { fetchContacts } = useContactStore();
  const { fetchNotifications, addNotification } = useNotificationStore();
  
  useEffect(() => {
    // Fetch initial data
    fetchConversations();
    fetchContacts();
    fetchNotifications();
  }, [fetchConversations, fetchContacts, fetchNotifications]);
  
  // Socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // New message received
    socket.on('new_message', (data) => {
      addMessage(data.message);
    });
    
    // Message read status update
    socket.on('message_read', (data) => {
      updateMessageStatus(
        data.conversationId,
        data.messageId,
        true
      );
    });
    
    // New notification
    socket.on('notification', (data) => {
      addNotification(data.notification);
    });
    
    // Contact request events
    socket.on('contact_request', () => {
      fetchContacts();
    });
    
    socket.on('contact_update', () => {
      fetchContacts();
    });
    
    return () => {
      socket.off('new_message');
      socket.off('message_read');
      socket.off('notification');
      socket.off('contact_request');
      socket.off('contact_update');
    };
  }, [
    socket, 
    addMessage, 
    updateMessageStatus, 
    fetchContacts, 
    addNotification
  ]);
  
  // Close mobile nav when location changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);
  
  // Return base layout in case user is null
  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-dark-800">
      <Header 
        toggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={user} />
        
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      <MobileNav isOpen={isMobileNavOpen} user={user} />
    </div>
  );
};

export default MainLayout;