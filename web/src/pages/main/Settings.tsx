import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Bell, Lock, Shield, LogOut, MessageSquare, Brush, Palette, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

const Settings = () => {
  const { theme, toggleTheme, chatBackground, setChatBackground, accentColor, setAccentColor } = useTheme();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'privacy' | 'sound'>('appearance');
  
  const chatBackgrounds = [
    { id: 'default', name: 'Default' },
    { id: 'bubbles', name: 'Bubbles' },
    { id: 'geometric', name: 'Geometric' },
    { id: 'gradient', name: 'Gradient' },
  ];
  
  const accentColors = [
    { id: 'primary-500', name: 'Blue', color: '#0ea5e9' },
    { id: 'purple-500', name: 'Purple', color: '#8b5cf6' },
    { id: 'pink-500', name: 'Pink', color: '#ec4899' },
    { id: 'green-500', name: 'Green', color: '#22c55e' },
    { id: 'amber-500', name: 'Amber', color: '#f59e0b' },
    { id: 'red-500', name: 'Red', color: '#ef4444' },
  ];
  
  const renderAppearanceSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="flex space-x-4">
          <div
            onClick={() => toggleTheme()}
            className={`relative rounded-lg p-4 border flex flex-col items-center cursor-pointer transition duration-200 w-32
              ${theme === 'light' 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                : 'border-gray-300 dark:border-dark-700 hover:border-gray-400 dark:hover:border-dark-600'
              }`}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm mb-3">
              <Sun className="h-6 w-6 text-amber-500" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Light</span>
          </div>
          
          <div
            onClick={() => toggleTheme()}
            className={`relative rounded-lg p-4 border flex flex-col items-center cursor-pointer transition duration-200 w-32
              ${theme === 'dark' 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                : 'border-gray-300 dark:border-dark-700 hover:border-gray-400 dark:hover:border-dark-600'
              }`}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-dark-800 shadow-sm mb-3">
              <Moon className="h-6 w-6 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Dark</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Chat Background</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {chatBackgrounds.map((bg) => (
            <div
              key={bg.id}
              onClick={() => setChatBackground(bg.id as any)}
              className={`relative rounded-lg p-3 border flex flex-col items-center cursor-pointer transition duration-200
                ${chatBackground === bg.id 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                  : 'border-gray-300 dark:border-dark-700 hover:border-gray-400 dark:hover:border-dark-600'
                }`}
            >
              <div className={`w-full h-16 rounded-md mb-2 ${
                bg.id === 'default' ? 'bg-white dark:bg-dark-800' :
                bg.id === 'bubbles' ? 'bg-white dark:bg-dark-800 bg-[url("/images/chat-bubbles-bg.svg")] dark:bg-[url("/images/chat-bubbles-bg-dark.svg")]' :
                bg.id === 'geometric' ? 'bg-white dark:bg-dark-800 bg-[url("/images/chat-geo-bg.svg")] dark:bg-[url("/images/chat-geo-bg-dark.svg")]' :
                'bg-gradient-to-b from-primary-50 to-white dark:from-dark-800 dark:to-dark-900'
              }`} />
              <span className="font-medium text-gray-900 dark:text-white text-sm">{bg.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Accent Color</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => setAccentColor(color.id)}
              className={`relative rounded-lg flex flex-col items-center cursor-pointer transition duration-200 p-1
                ${accentColor === color.id ? 'ring-2 ring-gray-400 dark:ring-white' : ''}`}
            >
              <div 
                className="w-10 h-10 rounded-full mb-1" 
                style={{ backgroundColor: color.color }}
              />
              <span className="font-medium text-gray-900 dark:text-white text-xs">{color.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Push Notifications</h3>
        
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">New messages</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive a new message</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
          
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Friend requests</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified for new friend requests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
          
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Group activity</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about group changes and messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Notifications</h3>
        
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Friend requests</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive email when someone sends you a friend request</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
          
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Missed messages</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive email for messages you missed while offline</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
  
  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy</h3>
        
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Online status</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Show when you're active on the platform</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
          
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Read receipts</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Let others see when you've read their messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
          
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Profile visibility</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Who can see your profile information</p>
            </div>
            <select className="input-base py-2 px-4 w-40">
              <option>Everyone</option>
              <option>Contacts only</option>
              <option>Nobody</option>
            </select>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security</h3>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Manage Sessions
          </Button>
        </div>
      </div>
    </div>
  );
  
  const renderSoundSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sound Settings</h3>
        
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Message sounds</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds when receiving messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
          
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Call sounds</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for incoming calls</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
          
          <li className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 dark:text-gray-200">Notification sounds</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for other notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-primary-300 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
            </label>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sound Volume</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 dark:text-gray-300">Message Volume</span>
              <span className="text-gray-500 dark:text-gray-400">75%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="75" 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-dark-700"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 dark:text-gray-300">Call Volume</span>
              <span className="text-gray-500 dark:text-gray-400">100%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="100" 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-dark-700"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-dark-900 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4">
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-dark-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center px-3 py-2 w-full rounded-lg transition-colors duration-200
                  ${activeTab === 'appearance' 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
                  }`}
              >
                <Brush className="h-5 w-5 mr-3" />
                <span>Appearance</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center px-3 py-2 w-full rounded-lg transition-colors duration-200
                  ${activeTab === 'notifications' 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
                  }`}
              >
                <Bell className="h-5 w-5 mr-3" />
                <span>Notifications</span>
              </button>
              
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center px-3 py-2 w-full rounded-lg transition-colors duration-200
                  ${activeTab === 'privacy' 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
                  }`}
              >
                <Shield className="h-5 w-5 mr-3" />
                <span>Privacy & Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('sound')}
                className={`flex items-center px-3 py-2 w-full rounded-lg transition-colors duration-200
                  ${activeTab === 'sound' 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
                  }`}
              >
                <Volume2 className="h-5 w-5 mr-3" />
                <span>Sound</span>
              </button>
            </nav>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-700">
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 w-full text-error-600 hover:bg-error-50 dark:hover:bg-error-900/10 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
          
          <div className="p-6 md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'appearance' && renderAppearanceSettings()}
                {activeTab === 'notifications' && renderNotificationSettings()}
                {activeTab === 'privacy' && renderPrivacySettings()}
                {activeTab === 'sound' && renderSoundSettings()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;