import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, Image, Smile, Send, Phone, Video, Info, MoreVertical } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { useAuth } from '../../hooks/useAuth';
import useChatStore from '../../store/chatStore';
import Avatar from '../../components/ui/Avatar';
import { formatDate, getOtherParticipant } from '../../lib/utils';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { useTheme } from '../../hooks/useTheme';

const Chats = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { theme, chatBackground } = useTheme();
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    messageLoading,
    hasMore,
    fetchConversations,
    setActiveConversation,
    fetchMessages,
    sendMessage,
  } = useChatStore();
  
  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  // Set active conversation when id param changes
  useEffect(() => {
    if (id) {
      setActiveConversation(id);
    } else if (conversations.length > 0 && !activeConversation) {
      // Set the first conversation as active if none selected
      setActiveConversation(conversations[0].id);
    }
  }, [id, conversations, activeConversation, setActiveConversation]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && !isLoadingMoreMessages) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation, isLoadingMoreMessages]);
  
  // Handle scroll to load more messages
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (
        container.scrollTop <= 100 &&
        activeConversation &&
        hasMore[activeConversation.id] &&
        !messageLoading &&
        messages[activeConversation.id]?.length > 0
      ) {
        const oldestMessage = messages[activeConversation.id][0];
        setIsLoadingMoreMessages(true);
        fetchMessages(activeConversation.id, oldestMessage.id)
          .then(() => {
            setIsLoadingMoreMessages(false);
          });
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeConversation, messages, hasMore, messageLoading, fetchMessages]);
  
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    // For private chats, search by the other user's name
    if (!conversation.isGroup) {
      const otherUser = getOtherParticipant(conversation.participants, user?.id || '');
      return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    // For group chats, search by group name
    return conversation.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      await sendMessage(activeConversation.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const getChatBgClass = () => {
    switch (chatBackground) {
      case 'bubbles':
        return 'bg-white dark:bg-dark-900 bg-[url("/images/chat-bubbles-bg.svg")] dark:bg-[url("/images/chat-bubbles-bg-dark.svg")]';
      case 'geometric':
        return 'bg-white dark:bg-dark-900 bg-[url("/images/chat-geo-bg.svg")] dark:bg-[url("/images/chat-geo-bg-dark.svg")]';
      case 'gradient':
        return theme === 'dark' 
          ? 'bg-gradient-to-b from-dark-800 to-dark-900' 
          : 'bg-gradient-to-b from-primary-50 to-white';
      default:
        return 'bg-white dark:bg-dark-900';
    }
  };
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'text-success-500';
      case 'away':
        return 'text-warning-500';
      case 'busy':
        return 'text-error-500';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };
  
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-full flex">
      {/* Conversation list */}
      <div className="w-80 border-r border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 h-full flex flex-col overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10 py-2"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
              <Search className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-semibold text-gray-800 dark:text-white">Messages</h2>
            <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
            </div>
          ) : (
            <ul>
              {filteredConversations.map((conversation) => {
                const isActive = activeConversation?.id === conversation.id;
                const otherUser = conversation.isGroup 
                  ? null 
                  : getOtherParticipant(conversation.participants, user?.id || '');
                const displayName = conversation.isGroup 
                  ? conversation.name 
                  : otherUser?.name;
                const avatar = conversation.isGroup 
                  ? conversation.avatar 
                  : otherUser?.avatar;
                
                return (
                  <li 
                    key={conversation.id}
                    className={`px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-dark-800 relative
                      ${isActive ? 'bg-gray-100 dark:bg-dark-800' : ''}
                    `}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-center">
                      <Avatar 
                        src={avatar} 
                        alt={displayName} 
                        size="md"
                        status={conversation.isGroup ? undefined : otherUser?.status as any}
                      />
                      
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {displayName}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(conversation.updatedAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[140px]">
                            {conversation.lastMessage?.isRecalled
                              ? 'This message was recalled'
                              : conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                          
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-500 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="py-3 px-4 border-b border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar 
                  src={
                    activeConversation.isGroup
                      ? activeConversation.avatar
                      : getOtherParticipant(activeConversation.participants, user?.id || '')?.avatar
                  }
                  alt={
                    activeConversation.isGroup
                      ? activeConversation.name
                      : getOtherParticipant(activeConversation.participants, user?.id || '')?.name
                  }
                  size="md"
                  status={
                    activeConversation.isGroup
                      ? undefined
                      : getOtherParticipant(activeConversation.participants, user?.id || '')?.status as any
                  }
                />
                
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activeConversation.isGroup
                      ? activeConversation.name
                      : getOtherParticipant(activeConversation.participants, user?.id || '')?.name}
                  </p>
                  {!activeConversation.isGroup && (
                    <p className={`text-xs ${
                      getStatusColor(getOtherParticipant(activeConversation.participants, user?.id || '')?.status)
                    }`}>
                      {getOtherParticipant(activeConversation.participants, user?.id || '')?.status || 'Offline'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800">
                  <Video className="h-5 w-5" />
                </button>
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800">
                  <Info className="h-5 w-5" />
                </button>
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div 
              ref={messageContainerRef}
              className={`flex-1 overflow-y-auto p-4 ${getChatBgClass()}`}
            >
              {messageLoading && messages[activeConversation.id]?.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex space-x-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {isLoadingMoreMessages && (
                    <div className="text-center py-2">
                      <div className="inline-flex space-x-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {messages[activeConversation.id]?.map((message, index) => {
                    const isSender = message.sender.id === user?.id;
                    const showAvatar = !isSender && (
                      index === 0 || 
                      messages[activeConversation.id][index - 1].sender.id !== message.sender.id
                    );
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isSender && (
                          <div className="mr-2 w-8">
                            {showAvatar && (
                              <Avatar 
                                src={message.sender.avatar} 
                                alt={message.sender.name} 
                                size="sm" 
                              />
                            )}
                          </div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`
                            ${isSender ? 'chat-bubble-sent' : 'chat-bubble-received'}
                            ${message.isRecalled ? 'opacity-60 italic' : ''}
                          `}
                        >
                          {activeConversation.isGroup && !isSender && showAvatar && (
                            <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">
                              {message.sender.name}
                            </div>
                          )}
                          
                          {message.isRecalled ? (
                            <span className="text-gray-500 dark:text-gray-400">
                              This message was recalled
                            </span>
                          ) : (
                            <>
                              {message.content}
                              
                              <div className={`text-xs mt-1 text-right ${
                                isSender 
                                  ? 'text-primary-100 dark:text-primary-300/70' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatDate(message.createdAt, 'time')}
                                {isSender && (
                                  <span className="ml-1">
                                    {message.isRead ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Message input */}
            <div className="p-3 border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900">
              <div className="flex items-end bg-gray-100 dark:bg-dark-800 rounded-lg px-3 py-2">
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1">
                  <Image className="h-5 w-5" />
                </button>
                
                <TextareaAutosize
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="ml-2 flex-1 bg-transparent outline-none resize-none text-gray-800 dark:text-white py-1 max-h-32"
                  maxRows={4}
                />
                
                <div className="flex items-center ml-2">
                  <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 mr-1">
                    <Smile className="h-5 w-5" />
                  </button>
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-full ${
                      newMessage.trim() 
                        ? 'bg-primary-500 text-white hover:bg-primary-600' 
                        : 'bg-gray-300 dark:bg-dark-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center max-w-md p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                  <MessageSquare className="h-12 w-12 text-primary-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Your Messages
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Send private messages to a friend or group
              </p>
              <button className="btn-primary px-4 py-2">
                Start a Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;