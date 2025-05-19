import { NavLink } from 'react-router-dom';
import { MessageSquare, Users, User, Settings, X } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import useNotificationStore from '../../store/notificationStore';
import useContactStore from '../../store/contactStore';

interface MobileNavProps {
  isOpen: boolean;
  user: any;
}

const MobileNav = ({ isOpen, user }: MobileNavProps) => {
  const { logout } = useAuth();
  const { unreadCount } = useNotificationStore();
  const { pendingRequests } = useContactStore();
  
  const navItems = [
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
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="md:hidden fixed inset-0 z-50 bg-gray-900/50 dark:bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-900 shadow-xl overflow-y-auto"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
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
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="py-4">
              <ul>
                {navItems.map((item) => {
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
                          <div className="ml-auto bg-primary-500 text-white text-xs font-medium rounded-full px-2 py-0.5 min-w-5 text-center">
                            {item.badge}
                          </div>
                        ) : null}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            <div className="border-t border-gray-200 dark:border-dark-700 p-4">
              <button 
                onClick={logout}
                className="flex items-center text-error-600 hover:text-error-700 dark:hover:text-error-400 py-2 transition-colors duration-200"
              >
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;