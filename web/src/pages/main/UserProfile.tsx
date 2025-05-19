import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Calendar, MessageSquare, UserPlus, UserMinus, UserX } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { userApi } from '../../lib/api';
import useContactStore from '../../store/contactStore';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactStatus, setContactStatus] = useState<
    'none' | 'pending' | 'accepted' | 'blocked' | 'outgoing'
  >('none');
  
  const {
    contacts,
    pendingRequests,
    blockedUsers,
    fetchContacts,
    sendContactRequest,
    acceptContactRequest,
    cancelContactRequest,
    blockUser,
    unblockUser,
    removeContact,
  } = useContactStore();
  
  // Fetch user profile
  useEffect(() => {
    if (!id) return;
    
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data } = await userApi.getUserProfile(id);
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id]);
  
  // Determine contact status
  useEffect(() => {
    if (!user) return;
    
    // Check if in contacts
    const isContact = contacts.some(contact => contact.user.id === user.id);
    if (isContact) {
      setContactStatus('accepted');
      return;
    }
    
    // Check if in pending requests
    const incomingRequest = pendingRequests.some(
      req => req.user.id === user.id && !req.isOutgoing
    );
    if (incomingRequest) {
      setContactStatus('pending');
      return;
    }
    
    // Check if outgoing request
    const outgoingRequest = pendingRequests.some(
      req => req.user.id === user.id && req.isOutgoing
    );
    if (outgoingRequest) {
      setContactStatus('outgoing');
      return;
    }
    
    // Check if blocked
    const isBlocked = blockedUsers.some(blocked => blocked.user.id === user.id);
    if (isBlocked) {
      setContactStatus('blocked');
      return;
    }
    
    setContactStatus('none');
  }, [user, contacts, pendingRequests, blockedUsers]);
  
  // Handle actions
  const handleSendRequest = async () => {
    try {
      await sendContactRequest(user.id);
      setContactStatus('outgoing');
      toast.success('Contact request sent');
    } catch (error) {
      console.error('Failed to send contact request:', error);
      toast.error('Failed to send contact request');
    }
  };
  
  const handleAcceptRequest = async () => {
    try {
      await acceptContactRequest(user.id);
      setContactStatus('accepted');
      toast.success('Contact request accepted');
    } catch (error) {
      console.error('Failed to accept contact request:', error);
      toast.error('Failed to accept contact request');
    }
  };
  
  const handleCancelRequest = async () => {
    try {
      await cancelContactRequest(user.id);
      setContactStatus('none');
      toast.success('Contact request cancelled');
    } catch (error) {
      console.error('Failed to cancel contact request:', error);
      toast.error('Failed to cancel contact request');
    }
  };
  
  const handleRemoveContact = async () => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      try {
        await removeContact(user.id);
        setContactStatus('none');
        toast.success('Contact removed');
      } catch (error) {
        console.error('Failed to remove contact:', error);
        toast.error('Failed to remove contact');
      }
    }
  };
  
  const handleBlockUser = async () => {
    if (window.confirm('Are you sure you want to block this user?')) {
      try {
        await blockUser(user.id);
        setContactStatus('blocked');
        toast.success('User blocked');
      } catch (error) {
        console.error('Failed to block user:', error);
        toast.error('Failed to block user');
      }
    }
  };
  
  const handleUnblockUser = async () => {
    try {
      await unblockUser(user.id);
      setContactStatus('none');
      toast.success('User unblocked');
    } catch (error) {
      console.error('Failed to unblock user:', error);
      toast.error('Failed to unblock user');
    }
  };
  
  const handleMessage = () => {
    // Navigate to chat with this user
    navigate(`/chats/${user.id}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary-500 animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <div className="bg-white dark:bg-dark-900 rounded-lg shadow p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-dark-800 rounded-full mb-4">
            <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The user you're looking for doesn't exist or may have been removed.
          </p>
          <Button variant="primary" onClick={() => navigate('/contacts')}>
            Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <div className="bg-white dark:bg-dark-900 rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-40 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors duration-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="absolute -bottom-16 left-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar 
                src={user.avatar} 
                alt={user.name} 
                size="xl"
                status={user.status as any}
                className="border-4 border-white dark:border-dark-900"
              />
            </motion.div>
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {user.name}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-gray-600 dark:text-gray-400 flex items-center mt-1"
              >
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mt-4 md:mt-0 flex flex-wrap gap-2"
            >
              {contactStatus === 'accepted' && (
                <>
                  <Button
                    variant="primary"
                    leftIcon={<MessageSquare className="h-4 w-4" />}
                    onClick={handleMessage}
                  >
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<UserMinus className="h-4 w-4" />}
                    onClick={handleRemoveContact}
                  >
                    Remove
                  </Button>
                </>
              )}
              
              {contactStatus === 'none' && (
                <>
                  <Button
                    variant="primary"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                    onClick={handleSendRequest}
                  >
                    Add Contact
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<UserX className="h-4 w-4" />}
                    onClick={handleBlockUser}
                  >
                    Block
                  </Button>
                </>
              )}
              
              {contactStatus === 'pending' && (
                <>
                  <Button
                    variant="primary"
                    onClick={handleAcceptRequest}
                  >
                    Accept Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelRequest}
                  >
                    Decline
                  </Button>
                </>
              )}
              
              {contactStatus === 'outgoing' && (
                <Button
                  variant="outline"
                  onClick={handleCancelRequest}
                >
                  Cancel Request
                </Button>
              )}
              
              {contactStatus === 'blocked' && (
                <Button
                  variant="outline"
                  onClick={handleUnblockUser}
                >
                  Unblock User
                </Button>
              )}
            </motion.div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-dark-700 pt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Info</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.createdAt && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Joined {formatDate(user.createdAt, 'date')}</span>
                  </div>
                )}
              </div>
              
              {user.bio && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Bio</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {user.bio}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;