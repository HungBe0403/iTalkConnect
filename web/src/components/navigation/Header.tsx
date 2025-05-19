import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import useNotificationStore from '../../store/notificationStore';

interface HeaderProps {
  toggleMobileNav: () => void;
}

const Header = ({ toggleMobileNav }: HeaderProps) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotificationStore();
  
  const title = useMemo(() => {
    const path = location.pathname;
    
    if (path.startsWith('/chats')) {
      return 'Messages';
    } else if (path.startsWith('/contacts')) {
      return 'Contacts';
    } else if (path.startsWith('/profile')) {
      return 'My Profile';
    } else if (path.startsWith('/settings')) {
      return 'Settings';
    } else if (path.startsWith('/user/')) {
      return 'User Profile';
    }
    
    return 'Chatterbox';
  }, [location.pathname]);

  return (
    <header className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 py-3 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileNav}
            className="md:hidden mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/chats" className="flex items-center">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400 hidden sm:inline-block">
              Chatterbox
            </span>
          </Link>
        </div>
        
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
          
          <div className="relative">
            <Link to="/settings">
              <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
          
          <div className="relative group">
            <button className="flex items-center focus:outline-none">
              <Avatar 
                src={user?.avatar} 
                alt={user?.name} 
                size="sm" 
                className="cursor-pointer ring-2 ring-white dark:ring-dark-900"
              />
            </button>
            
            <div className="hidden group-hover:block absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-dark-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-dark-700">
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                Your Profile
              </Link>
              <Link 
                to="/settings" 
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                Settings
              </Link>
              <button 
                onClick={logout}
                className="w-full text-left block px-4 py-2 text-sm text-error-600 hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;