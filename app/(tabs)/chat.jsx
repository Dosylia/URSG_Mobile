import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionContext } from '../../context/SessionContext';
import { UserDataChat, CustomButton } from '../../components';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { images, icons } from "../../constants";
import { useData } from '../../context/DataContext';
import { useFriendList } from '../../context/FriendListContext'; 
import he from 'he';

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
  const [friendPage, setFriendPage] = useState(true);
  const [chatPage, setChatPage] = useState(false);
  const backgroundColorClass = colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800';
  const placeholderColor = colorScheme === 'dark' ? '#2f2f30' : '#bcb0b0';
  const profileImage = images.defaultpicture; 
  const [searchQuery, setSearchQuery] = useState('');
  const { unreadMessageFriends } = useData();
  const [scrollOnLoad, setScrollOnLoad] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const { friendList } = useFriendList();

  const scrollViewRef = useRef();

  useEffect(() => {
    fetchChatData();
  }, [friendList]);

  const fetchChatData = async () => {
    setFriends(friendList);
  
    const savedFriendId = await AsyncStorage.getItem('selectedFriendId');
    if (savedFriendId) {
      const lastFriend = friendList.find(f => f.friend_id === savedFriendId);
      if (lastFriend) {
        handleSelectFriend(lastFriend);
      }
    } else if (friendList.length > 0) {
      setFriendPage(true);
    }
  
    setIsLoading(false);
  };


  const handleBlockUser = (blockStatus) => {
    setIsBlocked(blockStatus);

    if (blockStatus) {
      fetchChatData();  
      setFriendPage(true); 
      setChatPage(false);
    }
  };

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

  const handleSelectFriend = async (friend) => {
    setSelectedFriend(friend);
    setFriendPage(false);
    setChatPage(true);
    setMessages([]);
    await AsyncStorage.setItem('selectedFriendId', String(friend.friend_id));
    fetchMessages(userId, friend.friend_id);
  };

  const handleBackToFriendList = () => {
    setChatPage(false);
    setFriendPage(true);
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

  useEffect(() => {
    if (scrollOnLoad) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        console.log('Scrolling to end');
        setScrollOnLoad(false);
      }, 500);
  
      return () => clearTimeout(timer);
    }
  }, [messages, scrollOnLoad]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [selectedFriend]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 dark:bg-whitePerso">
        <ActivityIndicator size="large" color="#e74057" />
      </View>
    );
  }

  const filteredFriends = friends.filter(friend =>
    friend.friend_username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-900 p-4 dark:bg-whitePerso">
      {friendPage && friends.length > 0 && (
        <View className="flex-1">
          <ScrollView>
            <Text className="text-mainred text-3xl mb-2 font-bold">{t('friends-list')}</Text>
            {filteredFriends.map((friend) => (
              <TouchableOpacity
                key={friend.fr_id}
                className="my-2"
                onPress={() => handleSelectFriend(friend)}
              >
                <View className={`p-3 rounded relative flex-row items-center ${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800'}`}>
                  <Image 
                    source={
                      friend.friend_picture
                        ? { uri: `https://ur-sg.com/public/upload/${friend.friend_picture}` }
                        : profileImage}  
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <Text className="text-white dark:text-blackPerso flex-1">{friend.friend_username}</Text>
                  {unreadMessageFriends[friend.friend_id] > 0 && (
                    <View className="w-4 h-4 bg-red-600 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">{unreadMessageFriends[friend.friend_id]}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Search bar */}
          <View className={`flex-row items-center p-2 ${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800'} mt-3`}>
            <TextInput
              placeholder={t('search-friends')}
              placeholderTextColor={colorScheme === 'dark' ? '#2f2f30' : '#ffffff'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-white dark:text-blackPerso p-2 rounded-l"
            />
            <Image
              source={colorScheme === 'dark' ? icons.searchBlack : icons.search}
              className="w-6 h-6 ml-2"
            />
          </View>
        </View>
      )}

      {chatPage && (
        <>
          <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} stickyHeaderIndices={[0]}>
            <View className="sticky top-0 bg-gray-900 dark:bg-whitePerso z-10">
              <TouchableOpacity>
                <CustomButton
                    title={t('back-to-friends')}
                    handlePress={handleBackToFriendList}
                    containerStyles="w-full mb-2"
                  />
              </TouchableOpacity>
              <UserDataChat userData={selectedFriend} onBlock={handleBlockUser} />
            </View>
            {messages.map((message) => (
              <View
                key={message.chat_id}
                className={`mb-2 p-3 rounded ${message.chat_senderId === userId ? 'bg-mainred self-end' : `${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800'} self-start`}`}
                style={{ maxWidth: '80%', paddingHorizontal: 10 }}
              >
                <Text className={`text-white text-base pb-1 ${message.chat_senderId === userId ? 'text-white' : 'dark:text-blackPerso'}`}>
                  {message.chat_senderId === userId ? t('you') : selectedFriend.friend_username}: {he.decode(message.chat_message)}
                </Text>
                <Text className={`text-white ${message.chat_senderId === userId ? 'text-white' : 'dark:text-blackPerso'} text-xs absolute bottom-0 right-0 pr-1 pt-1 opacity-50`}>{message.formattedTime}</Text>
              </View>
            ))}
          </ScrollView>

          <View className="flex-row items-center">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={t('type-message')}
              placeholderTextColor={placeholderColor}
              className={`flex-1 ${backgroundColorClass} text-white dark:text-blackPerso p-2 rounded-l`}
            />
          <TouchableOpacity 
            onPress={handleSendMessage}
            className="bg-mainred p-3 rounded-r"
          >
            <Text className="text-white">{t('send-message')}</Text>
          </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ChatPage;
