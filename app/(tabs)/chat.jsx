import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import he from 'he';
import { SessionContext } from '../../context/SessionContext';
import { UserDataChat } from '../../components';

const ChatPage = () => {
  const { sessions } = useContext(SessionContext);
  const { userId } = sessions.userSession;

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  
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
          console.error('Error fetching friends:', friendsResponse.data.error);
          setErrors(friendsResponse.data.error);
        }
      } catch (error) {
        console.error('Error fetching friends', error);
        setErrors('Error fetching friends');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, []);

  const fetchMessages = async (userId, friendId) => {
    try {
      const messagesResponse = await axios.post('https://ur-sg.com/getMessageData', new URLSearchParams({ userId, friendId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (messagesResponse.data.success) {
        setMessages(messagesResponse.data.messages);
      } else {
        console.error('Error fetching messages:', messagesResponse.data.error);
        setErrors(messagesResponse.data.error);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrors('Error fetching messages');
    }
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
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
        const newMessageObject = {
          chat_id: responseData.newChatId,
          chat_senderId: userId,
          chat_receiverId: selectedFriend.friend_id,
          chat_message: newMessage,
          chat_date: new Date().toISOString(),
          chat_status: 'unread',
        };

        setMessages([...messages, newMessageObject]);
        setNewMessage('');

        // Scroll to the end after sending a message
        scrollViewRef.current?.scrollToEnd({ animated: true });
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
    const intervalId = setInterval(() => {
      if (selectedFriend) {
        fetchMessages(userId, selectedFriend.friend_id);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [userId, selectedFriend]);

  useEffect(() => {
    if (messages) {
      if (messages.length > 0) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    }
  }, [messages, selectedFriend]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900 p-4">
      {/* Friend List */}
      <ScrollView horizontal className="flex-row max-h-20">
        {friends.map((friend) => (
          <TouchableOpacity
            key={friend.fr_id}
            className="mr-3"
            onPress={() => handleSelectFriend(friend)}
          >
            <View className="p-3 bg-gray-800 rounded">
              <Text className="text-white">{friend.friend_username}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Chat Messages */}
      <View className="flex-1">
        <ScrollView className="flex-1" ref={scrollViewRef}>
          <UserDataChat userData={selectedFriend} />
        {messages ? (
          messages.map((message) => {
            const chatId = message.chat_id || `${message.chat_senderId}-${message.chat_date}`;

            return (
              <View
                key={chatId}
                className={`mb-2 p-3 rounded ${message.chat_senderId === userId ? 'bg-mainred' : 'bg-gray-800'}`}
              >
                <Text className="text-white">
                  {message.chat_senderId === userId ? 'You' : selectedFriend.friend_username}: {he.decode(message.chat_message)}
                </Text>
              </View>
            );
          })
        ) : (
          <Text className="text-white">No messages yet.</Text>
        )}
        </ScrollView>
      </View>

      {/* New Message Input */}
      <View className="flex-row items-center">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          className="flex-1 bg-gray-800 text-white p-2 rounded-l"
        />
        <TouchableOpacity 
          onPress={handleSendMessage}
          className="bg-mainred p-3 rounded-r"
        >
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {errors && <Text className="text-red-500 mt-4">{errors}</Text>}
    </View>
  );
};

export default ChatPage;
