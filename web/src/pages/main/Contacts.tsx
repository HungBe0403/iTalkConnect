import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, UserPlus, UserMinus, UserX, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import useContactStore from '../../store/contactStore';
import { userApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';

const Contacts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'contacts' | 'requests' | 'blocked'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    contacts,
    pendingRequests,
    blockedUsers,
    loading,
    fetchContacts,
    sendContactRequest,
    acceptContactRequest,
    rejectContactRequest,
    cancelContactRequest,
    blockUser,
    unblockUser,
    removeContact,
  } = useContactStore();
  
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const { data } = await userApi.searchUsers(searchQuery);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search for users');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSendRequest = async (userId: string) => {
    try {
      await sendContactRequest(userId);
      toast.success('Contact request sent');
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, requestSent: true } 
            : user
        )
      );
    } catch (error) {
      console.error('Failed to send request:', error);
      toast.error('Failed to send contact request');
    }
  };
  
  const handleViewProfile = (userId: string) => {
    navigate(`/user/${userId}`);
  };
  
  const handleRemoveContact = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      try {
        await removeContact(userId);
        toast.success('Contact removed');
      } catch (error) {
        console.error('Failed to remove contact:', error);
        toast.error('Failed to remove contact');
      }
    }
  };
  
  const handleBlockUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to block this user?')) {
      try {
        await blockUser(userId);
        toast.success('User blocked');
      } catch (error) {
        console.error('Failed to block user:', error);
        toast.error('Failed to block user');
      }
    }
  };
  
  const renderTabs = () => (
    <div className="mb-4 border-b border-gray-200 dark:border-dark-700">
      <nav className="flex -mb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'contacts'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          All Contacts
          <span className="ml-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
            {contacts.length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full px-2 py-0.5 text-xs">
              {pendingRequests.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('blocked')}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'blocked'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Blocked
          <span className="ml-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
            {blockedUsers.length}
          </span>
        </button>
      </nav>
    </div>
  );
  
  const renderSearchBar = () => (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="input-base pl-10"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <button
          onClick={handleSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3 btn-primary rounded-l-none rounded-r-lg px-4"
        >
          Search
        </button>
      </div>
    </div>
  );
  
  const renderSearchResults = () => (
    searchResults.length > 0 && (
      <div className="mb-8 bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-700">
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">Search Results</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-dark-700">
          {searchResults.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar src={user.avatar} alt={user.name} size="md" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewProfile(user.id)}
                >
                  View Profile
                </Button>
                {!user.isContact && !user.requestSent && (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                    onClick={() => handleSendRequest(user.id)}
                  >
                    Add
                  </Button>
                )}
                {user.requestSent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelContactRequest(user.id)}
                  >
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
  
  const renderContactsList = () => (
    <div className="bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-700">
      <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-white">All Contacts</h2>
        <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      {contacts.length === 0 ? (
        <div className="p-8 text-center">
          <div className="inline-flex justify-center items-center w-12 h-12 bg-gray-100 dark:bg-dark-800 rounded-full mb-4">
            <UserPlus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-2">No contacts yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Search for users to add them to your contacts
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-dark-700">
          {contacts.map((contact) => (
            <motion.li
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center cursor-pointer" onClick={() => handleViewProfile(contact.user.id)}>
                  <Avatar 
                    src={contact.user.avatar} 
                    alt={contact.user.name} 
                    size="md" 
                    status={contact.user.status as any}
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">{contact.user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{contact.user.email}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800"
                    onClick={() => handleViewProfile(contact.user.id)}
                    title="View profile"
                  >
                    <User className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-gray-500 dark:text-gray-400 hover:text-error-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800"
                    onClick={() => handleRemoveContact(contact.user.id)}
                    title="Remove contact"
                  >
                    <UserMinus className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-gray-500 dark:text-gray-400 hover:text-error-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800"
                    onClick={() => handleBlockUser(contact.user.id)}
                    title="Block user"
                  >
                    <UserX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
  
  const renderPendingRequests = () => (
    <div className="bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-700">
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <h2 className="font-semibold text-gray-800 dark:text-white">Contact Requests</h2>
      </div>
      
      {pendingRequests.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">No pending requests</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-dark-700">
          {pendingRequests.map((request) => (
            <motion.li
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center cursor-pointer" onClick={() => handleViewProfile(request.user.id)}>
                  <Avatar src={request.user.avatar} alt={request.user.name} size="md" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">{request.user.name}</p>
                    <div className="flex items-center text-sm">
                      <span className={request.isOutgoing 
                        ? "text-amber-600 dark:text-amber-400" 
                        : "text-purple-600 dark:text-purple-400"
                      }>
                        {request.isOutgoing ? 'Outgoing Request' : 'Incoming Request'}
                      </span>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!request.isOutgoing ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<Check className="h-4 w-4" />}
                        onClick={() => acceptContactRequest(request.user.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<X className="h-4 w-4" />}
                        onClick={() => rejectContactRequest(request.user.id)}
                      >
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelContactRequest(request.user.id)}
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
  
  const renderBlockedUsers = () => (
    <div className="bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-700">
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <h2 className="font-semibold text-gray-800 dark:text-white">Blocked Users</h2>
      </div>
      
      {blockedUsers.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">No blocked users</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-dark-700">
          {blockedUsers.map((user) => (
            <motion.li
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar src={user.user.avatar} alt={user.user.name} size="md" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">{user.user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Blocked on {new Date(user.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unblockUser(user.user.id)}
                >
                  Unblock
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto p-4">
      {renderSearchBar()}
      
      {isSearching ? (
        <div className="text-center py-4">
          <div className="inline-flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-primary-500 animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Searching for users...</p>
        </div>
      ) : (
        renderSearchResults()
      )}
      
      {renderTabs()}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'contacts' && renderContactsList()}
          {activeTab === 'requests' && renderPendingRequests()}
          {activeTab === 'blocked' && renderBlockedUsers()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Contacts;