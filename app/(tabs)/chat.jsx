import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import he from 'he';
import { SessionContext } from '../../context/SessionContext';
import { UserDataChat } from '../../components';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';

const ChatPage = () => {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const { sessions } = useContext(SessionContext);
  const { userId } = sessions.userSession;
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [scrollOnLoad, setScrollOnLoad] = useState(true);
  const [unreadMessage, setUnreadMessage] = useState({});
  const backgroundColorClass = colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800';
  const placeholderColor = colorScheme === 'dark' ? '#2f2f30' : '#bcb0b0';

  const scrollViewRef = useRef();

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const friendsResponse = await axios.post('https://ur-sg.com/getFriendlist', new URLSearchParams({ userId }).toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (friendsResponse.data.success) {
          const friendlist = friendsResponse.data.friendlist;
          setFriends(friendlist);

          if (friendlist.length > 0) {
            setSelectedFriend(friendlist[0]);
            fetchMessages(userId, friendlist[0].friend_id);
          }
        } else {
          setErrors(friendsResponse.data.error);
        }
      } catch (error) {
        setErrors('Error fetching friends');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, []);

  useEffect(() => {
    setErrors(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchChatData = async () => {
        try {
          const friendsResponse = await axios.post('https://ur-sg.com/getFriendlist', new URLSearchParams({ userId }).toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          if (friendsResponse.data.success) {
            const friendlist = friendsResponse.data.friendlist;
            setFriends(friendlist);

            if (friendlist.length > 0 && selectedFriend === null) {
              setSelectedFriend(friendlist[0]);
              fetchMessages(userId, friendlist[0].friend_id);
            }
          } else {
            setErrors(friendsResponse.data.error);
          }
        } catch (error) {
          setErrors('Error fetching friends');
        } finally {
          setIsLoading(false);
        }
      };

      fetchChatData();
    }, [])
  );

  const fetchMessages = async (userId, friendId) => {
    try {
      const messagesResponse = await axios.post('https://ur-sg.com/getMessageData', new URLSearchParams({ userId, friendId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (messagesResponse.data.success) {
        const formattedMessages = messagesResponse.data.messages.map((message) => ({
          ...message,
          formattedTime: formatTimestamp(message.chat_date),
        }));
        setMessages(formattedMessages);
      } else {
        console.log(messagesResponse.data.error);
      }
    } catch (error) {
      console.log('Error fetching messages');
    }
  };

  const formatTimestamp = (dateString) => {
    const utcDate = new Date(dateString);
    const localOffset = new Date().getTimezoneOffset();
    const localDate = new Date(utcDate.getTime() + localOffset * 60000 * -1);
    return localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setMessages([]);
    fetchMessages(userId, friend.friend_id);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedFriend) return;
  
    try {
      const dataToSend = {
        senderId: userId,
        receiverId: selectedFriend.friend_id,
        message: newMessage,
      };
  
      const jsonData = JSON.stringify(dataToSend);
  
      const response = await fetch('https://ur-sg.com/sendMessageData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: "param=" + encodeURIComponent(jsonData),
      });
  
      const responseData = await response.json();
  
      if (responseData.success) {

        const currentDate = new Date();
        
        const formattedTime = formatTimestamp(currentDate);
  
        const newMessageObject = {
          chat_id: responseData.newChatId,
          chat_senderId: userId,
          chat_receiverId: selectedFriend.friend_id,
          chat_message: newMessage,
          chat_date: currentDate.toISOString(),
          chat_status: 'unread',
          formattedTime: formattedTime,
        };
  
        setMessages((prevMessages) => [...prevMessages, newMessageObject]);
        setNewMessage('');
      } else {
        console.error('Error sending message:', responseData.message);
        setErrors(responseData.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setErrors('Error sending message');
    }
  };

  const fetchUnreadMessage = async () => { 
    try {
      const response = await axios.post('https://ur-sg.com/getUnreadMessage', 
        new URLSearchParams({ userId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = response.data;
      if (data.success) {
        const unreadCountByFriend = {};
        data.unreadCount.forEach(item => {
          unreadCountByFriend[item.chat_senderId] = item.unread_count;
        });
        setUnreadMessage(unreadCountByFriend);
      } else {
        console.log('Failed to fetch unread messages:', data.error);
        setUnreadMessage({});
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error.message);
    }
  };

  useEffect(() => {
    fetchUnreadMessage();

    const intervalId = setInterval(() => {
      fetchUnreadMessage();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []); 

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedFriend) {
        fetchMessages(userId, selectedFriend.friend_id);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [userId, selectedFriend]);

  useEffect(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [selectedFriend]);

  useEffect(() => {
    if (scrollOnLoad) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        setScrollOnLoad(false);
      }, 500);
  
      return () => clearTimeout(timer);
    }
  }, [messages, scrollOnLoad]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 dark:bg-whitePerso">
        <ActivityIndicator size="large" color="#e74057" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900 p-4 dark:bg-whitePerso">
      {friends.length > 0 ? (
        <>
          <ScrollView horizontal className="flex-row max-h-20">
            {friends.map((friend) => (
              <TouchableOpacity
                key={friend.fr_id}
                className="mr-3"
                onPress={() => handleSelectFriend(friend)}
              >
                <View className={`p-3 rounded relative ${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800'}`}>
                  <Text className="text-white dark:text-blackPerso">{friend.friend_username}</Text>
                  {unreadMessage[friend.friend_id] > 0 && (
                    <View className="absolute -top-0 -right-1 w-4 h-4 bg-red-600 rounded-full items-center justify-center z-10">
                      <Text className="text-white text-xs font-bold">{unreadMessage[friend.friend_id]}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className="flex-1">
            <ScrollView className="flex-1" ref={scrollViewRef}>
              <UserDataChat userData={selectedFriend} />
              {Array.isArray(messages) && messages.length > 0 ? (
                messages.map((message) => {
                  const chatId = message.chat_id || `${message.chat_senderId}-${message.chat_date}`;
  
                  return (
                    <View
                      key={chatId}
                      className={`mb-2 p-3 rounded ${message.chat_senderId === userId ? 'bg-mainred self-end' : `${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800'}   self-start`}`}
                      style={{ 
                        maxWidth: '80%', 
                        alignSelf: message.chat_senderId === userId ? 'flex-end' : 'flex-start',
                        paddingHorizontal: 10, 
                        flexShrink: 1   
                      }}
                    >
                      <Text className={`text-white text-base pb-1 ${message.chat_senderId === userId ? 'text-white' : 'dark:text-blackPerso'}`}>
                        {message.chat_senderId === userId ? t('you') : selectedFriend.friend_username}: {he.decode(message.chat_message)}
                      </Text>
                      <Text className={`text-white ${message.chat_senderId === userId ? 'text-white' : 'dark:text-blackPerso'} text-xs absolute bottom-0 right-0 pr-1 pt-1 opacity-50`}>{message.formattedTime}</Text>
                    </View>
                  );
                })
              ) : (
                <Text className="text-white dark:text-blackPerso">{t('no-message')}</Text>
              )}
            </ScrollView>
          </View>
        </>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-center">{t('no-friends')}</Text>
          {selectedFriend && (
            <View className="flex-1 justify-center">
              <Text className="text-white text-center">{t('select-friend')}</Text>
            </View>
          )}
        </View>
      )}
      {friends.length > 0 && (
        <View className="flex-row items-center">
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={t('type-message')}
            placeholderTextColor={placeholderColor}
            className={`flex-1 ${backgroundColorClass} text-white p-2 rounded-l`}
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            className="bg-mainred p-3 rounded-r"
          >
            <Text className="text-white">{t('send-message')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {errors && <Text className="text-red-500 mt-4">{errors}</Text>}
    </View>
  );
};

export default ChatPage;
