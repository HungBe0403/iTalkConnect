import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, Users, User, Settings } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useNotificationStore from '../../store/notificationStore';
import useContactStore from '../../store/contactStore';
import { motion } from 'framer-motion';

interface SidebarProps {
  user: any;
}

const Sidebar = ({ user }: SidebarProps) => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  const { pendingRequests } = useContactStore();
  
  const navItems = useMemo(() => [
    {
      icon: MessageSquare,
      label: 'Messages',
      path: '/chats',
      badge: unreadCount,
    },
    {
      icon: Users,
      label: 'Contacts',
      path: '/contacts',
      badge: pendingRequests.length,
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
    },
  ], [unreadCount, pendingRequests.length]);

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700">
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center">
          <Avatar 
            src={user.avatar} 
            alt={user.name} 
            size="md" 
            status="online" 
          />
          <div className="ml-3">
            <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 pt-4 pb-4">
        <ul>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <li key={item.path} className="px-2 mb-1">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center py-3 px-4 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'}`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                  
                  {item.badge ? (
                    <motion.div 
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="ml-auto bg-primary-500 text-white text-xs font-medium rounded-full px-2 py-0.5 min-w-5 text-center"
                    >
                      {item.badge}
                    </motion.div>
                  ) : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;