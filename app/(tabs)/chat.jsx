import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, FlatList, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionContext } from '../../context/SessionContext';
import { UserDataChat, CustomButton } from '../../components';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { images, icons, emotes } from "../../constants";
import badWordsList from '../../constants/chatFilter';
import { useData } from '../../context/DataContext';
import { useFriendList } from '../../context/FriendListContext'; 
import { Modal } from 'react-native';
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
  const [isEmotePickerVisible, setIsEmotePickerVisible] = useState(false);
  const [ownVIPEmotes, setownVIPEmotes] = useState(false);

  const scrollViewRef = useRef();

  useEffect(() => {
    fetchChatData();
    fetchOwnVIPEmotes();
  }, [friendList]);

  const fetchChatData = async () => {
    setFriends(friendList);

    const savedFriendId = await AsyncStorage.getItem('selectedFriendId');
    if (savedFriendId) {
      const lastFriend = friendList.find(f => f.friend_id === Number(savedFriendId));
      if (lastFriend) {
        await AsyncStorage.removeItem('selectedFriendId');
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

  const fetchOwnVIPEmotes = async () => {
    try {
      const response = await axios.post('https://ur-sg.com/ownVIPEmotesPhone', {
        userId: userId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
        }
      });
      const emoteOwnershipData = response.data;
      if (emoteOwnershipData.message === 'Success') {
        if (emoteOwnershipData.ownVIPEmotes) {
          setownVIPEmotes(true);
        } else {
          setownVIPEmotes(false);
        }
      }
    } catch (error) {
      console.error('Error fetching status of ownership:', error);
    }
  };

  const fetchMessages = async (userId, friendId) => {
    const token = sessions.googleSession.token;
  
    try {
      const messagesResponse = await axios.post(
        'https://ur-sg.com/getMessageDataPhone',
        new URLSearchParams({ userId, friendId, token }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${sessions.googleSession.token}`,
          },
        }
      );
  
      if (messagesResponse.data.success) {
        const { user, friend, messages } = messagesResponse.data;
        const formattedMessages = messages.map((message) => {
          const isSenderCurrentUser = message.chat_senderId === user.user_id;
  
          const senderOwnsVIPEmotes = isSenderCurrentUser ? user.ownVIPEmotes : friend.ownVIPEmotes;
  
          return {
            ...message,
            formattedTime: formatTimestamp(message.chat_date),
            senderOwnsVIPEmotes,  
          };
        });
  
        setMessages(formattedMessages);
      } else {
        console.log('Error getting messages:', messagesResponse.error);
      }
    } catch (error) {
      console.log('Error fetching messages');
    }
  };
  

  const chatfilter = (textToFilter) => {
    const allBadWords = badWordsList.flatMap(([, badWords]) => badWords);

    const badWordsRegex = new RegExp(allBadWords.join('|'), 'gi');

    const filteredText = textToFilter.replace(badWordsRegex, (match) => {
        return '*'.repeat(match.length);
    });

    return filteredText;
}


const renderEmotes = (message, textStyle, isVIPAllowed) => {
  const emoteMap = {
    ':surprised-cat:': emotes.surprisedCat,
    ':cat-smile:': emotes.catSmile,
    ':cat-cute:': emotes.catcute,
    ':goofy-ah-cat:': emotes.goofyAhCat,
    ':cat-surprised:': emotes.catSurprised,
    ':cat-liked:': emotes.catliked,
    ':cat-sus:': emotes.catSus,
    ':cat-bruh:': emotes.catbruh,
    ':cat-licking:': emotes.catlicking,
    ':cat-laugh:': emotes.catLaugh,
    ':cat-crying:': emotes.catCrying,
    ':cat-love:': emotes.catLove,
  };

  const vipEmoteMap = {
    ':vipurpe-stonk:': emotes.VIPurpeStonks,
    ':urpe-stonks:': emotes.VIPurpeStonks,
    ':vipurpe-blanket:': emotes.VIPurpeBlanket,
    ':urpe-blanket:': emotes.VIPurpeBlanket,
    ':vipurpe-blush:': emotes.VIPurpeBlush,
    ':urpe-blush:': emotes.VIPurpeBlush,
    ':vipurpe-cool:': emotes.VIPurpeCool,
    ':urpe-cool:': emotes.VIPurpeCool,
    ':vipurpe-cry:': emotes.VIPurpeCry,
    ':urpe-cry:': emotes.VIPurpeCry,
    ':vipurpe-dead:': emotes.VIPurpeDead,
    ':urpe-dead:': emotes.VIPurpeDead,
    ':vipurpe-eat:': emotes.VIPurpeEat,
    ':urpe-eat:': emotes.VIPurpeEat,
    ':vipurpe-heart:': emotes.VIPurpeHeart,
    ':urpe-heart:': emotes.VIPurpeHeart,
    ':vipurpe-hide:': emotes.VIPurpeHide,
    ':urpe-hide:': emotes.VIPurpeHide,
    ':vipurpe-hype:': emotes.VIPurpeHype,
    ':urpe-hype:': emotes.VIPurpeHype,
    ':vipurpe-jesus:': emotes.VIPurpeJesus,
    ':urpe-jesus:': emotes.VIPurpeJesus,
    ':vipurpe-not-stonks:': emotes.VIPurpeNotStonks,
    ':urpe-notstonks:': emotes.VIPurpeNotStonks,
    ':vipurpe-sip:': emotes.VIPurpeSip,
    ':urpe-sip:': emotes.VIPurpeSip,
    ':urpe-sad:': emotes.VIPurpeSad,
    ':vipurpe-sad:': emotes.VIPurpeSad,
    ':urpe-run:': emotes.VIPurpeRun,
    ':vipurpe-run:': emotes.VIPurpeRun,
  };

  return message.split(/(:[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*:)/g).map((part, index) => {
    const cleanedPart = part.replace(/::.*$/g, '');
    if (emoteMap[cleanedPart]) {
      return (
        <Image
          key={`emote-${index}`}
          source={emoteMap[cleanedPart]}
          style={{ width: 30, height: 30 }}
          resizeMode="contain"
        />
      );
    }
    if (vipEmoteMap[cleanedPart] && isVIPAllowed) {
      return (
        <Image
          key={`vipemote-${index}`}
          source={vipEmoteMap[cleanedPart]}
          style={{ width: 30, height: 30 }}
          resizeMode="contain"
        />
      );
    }
    return <Text key={`text-${index}`} style={textStyle}>{part}</Text>;
  });
};

const sanitizeUrl = (url) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const urlLower = url.toLowerCase();

  const isValidImage = imageExtensions.some(ext => urlLower.endsWith(ext));
  if (!isValidImage) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  } else {
    return `https://ur-sg.com/${url.replace(/^\//, '')}`;
  }
};


const processMessageContent = (content, textStyle, isVIPAllowed) => {
  const imageRegex = /\[img\](.*?)\[\/img\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(...renderEmotes(textBefore, textStyle, isVIPAllowed));
    }

    const url = match[1];
    const sanitizedUrl = sanitizeUrl(url);
    if (sanitizedUrl) {
      parts.push(
        <TouchableOpacity key={`img-${parts.length}`} onPress={() => Linking.openURL(sanitizedUrl)}>
          <Image 
            source={{ uri: sanitizedUrl }} 
            style={{ width: 100, height: 100, resizeMode: 'contain', marginVertical: 4 }} 
          />
        </TouchableOpacity>
      );
    } else {
      parts.push(
        <Text key={`invalid-${parts.length}`} style={[textStyle, { color: 'red' }]}>
          Invalid image URL
        </Text>
      );
    }

    lastIndex = imageRegex.lastIndex;
  }

  const textAfter = content.slice(lastIndex);
  if (textAfter) {
    parts.push(...renderEmotes(textAfter, textStyle, isVIPAllowed));
  }

  return parts;
};

const toggleEmotePicker = () => {
  setIsEmotePickerVisible(!isEmotePickerVisible);
};

const addEmoteToMessage = (emoteCode) => {
  setNewMessage(newMessage + emoteCode);
  setIsEmotePickerVisible(false); 
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

      const response = await fetch('https://ur-sg.com/sendMessageDataPhone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
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

        console.log('Error sending message:', responseData.message);

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
        setScrollOnLoad(false);
      }, 500);
  
      return () => clearTimeout(timer);
    }
  }, [messages, scrollOnLoad]);

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

  const convertCamelToDashCase = (camelCaseKey) => {
    const dashCaseModel = {
      'surprisedCat': 'surprised-cat',
      'catSmile': 'cat-smile',
      'catcute': 'cat-cute',
      'goofyAhCat': 'goofy-ah-cat',
      'catSurprised': 'cat-surprised',
      'catliked': 'cat-liked',
      'catSus': 'cat-sus',
      'catbruh': 'cat-bruh',
      'catlicking': 'cat-licking',
      'catLaugh': 'cat-laugh',
      'catCrying': 'cat-crying',
      'catLove': 'cat-love',
      'VIPurpeStonks': 'vipurpe-stonk',
    };
  
    const dashCaseKey = dashCaseModel[camelCaseKey] || camelCaseKey
      .replace(/([a-z])([A-Z])/g, '$1-$2') 
      .toLowerCase(); 
  
    return dashCaseKey;
  };
  
  return (
    <View className="flex-1 bg-gray-900 p-4 dark:bg-whitePerso">
{friendPage && (
  friends.length > 0 ? (
    <View className="flex-1">
      <Text className="text-mainred text-3xl mb-2 font-bold">{t('friends-list')}</Text>
      {/* FlatList for Friends */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => String(item.fr_id)}
        renderItem={({ item: friend }) => (
          <TouchableOpacity
            className="my-2"
            onPress={() => handleSelectFriend(friend)}
          >
            <View
              className={`p-3 rounded relative flex-row items-center ${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800'}`}
            >
              {/* Profile Image */}
              <Image
                source={
                  friend.friend_picture
                    ? { uri: `https://ur-sg.com/public/upload/${friend.friend_picture}` }
                    : profileImage
                }
                className="w-10 h-10 rounded-full mr-4"
              />

              {/* Username and Online Indicator */}
              <View className="flex-row items-center flex-1">
                <Text className="text-white dark:text-blackPerso text-xl">
                  {friend.friend_username}
                </Text>

                {/* Online Icon */}
                {friend.friend_online === 1 && (
                  <View className="w-3 h-3 bg-green-500 rounded-full ml-2" />
                )}
              </View>

              {/* Game Logo */}
              <Image
                source={friend.friend_game === 'League of Legends' ? icons.lolLogo : icons.valorantLogo}
                className="w-12 h-12 ml-2"
              />

              {/* Unread Messages Badge */}
              {unreadMessageFriends[friend.friend_id] > 0 && (
                <View className="w-4 h-4 bg-red-600 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {unreadMessageFriends[friend.friend_id]}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
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
        }
      />
    </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white dark:text-blackPerso text-center mb-5 text-2xl ">{t('no-friends')}</Text>
            <Image
              source={images.sadBee}
              className="w-50 h-50 rounded-md mb-5"
              resizeMode="contain"
            />
            <CustomButton
              title={t('to-swiping')}
              handlePress={() => router.push('/swiping')}
              containerStyles="w-full mt-7"
            />
          </View>
        )
      )}

      {chatPage && (
        <>
          <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} stickyHeaderIndices={[0]} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
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
            {messages.map((message) => {
              const textStyle = {
                color: message.chat_senderId === userId ? 'white' : (colorScheme === 'dark' ? '#000' : '#fff'),
                fontSize: 16,
                paddingBottom: 4,
              };

              return (
                <View
                  key={message.chat_id}
                  className={`mb-2 p-3 rounded relative ${
                    message.chat_senderId === userId
                      ? 'bg-mainred self-end'
                      : `${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800'} self-start`
                  }`}
                  style={{ maxWidth: '80%', paddingHorizontal: 10, minWidth: '20%' }}
                >
                  {/* Message Content */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {sessions.userSession.hasChatFilter 
                      ? processMessageContent(chatfilter(he.decode(message.chat_message)), textStyle, message.senderOwnsVIPEmotes)
                      : processMessageContent(he.decode(message.chat_message), textStyle, message.senderOwnsVIPEmotes)}
                  </View>

                  {/* Time + Read/Unread status */}
                  <View className="absolute bottom-0 right-1 flex-row items-center space-x-1">
                    <Text className={`text-white ${message.chat_senderId === userId ? 'text-white' : 'dark:text-blackPerso'} text-xs opacity-50`}>
                      {message.formattedTime}
                    </Text>

                    {/* Show only for sender */}
                    {message.chat_senderId === userId && (
                      message.chat_status === 'read' ? (
                        <Text className="text-xs text-white opacity-50">✓✓</Text> // read
                      ) : (
                        <Text className="text-xs text-white opacity-50">✓</Text>  // sent but not read
                      )
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Modal visible={isEmotePickerVisible} transparent={true} animationType="slide">
            <View className="flex-1 justify-center items-center">
              <View className="w-3/4 p-5 bg-gray-800 rounded-lg">
                <Text className="text-white text-center mb-4">Select an Emote</Text>
                <ScrollView>
                  <View className="flex-row flex-wrap justify-around">
                    {Object.keys(emotes)
                      .filter(emoteKey => {
                        const isVIP = emoteKey.startsWith('VIP');
                        if (isVIP && !ownVIPEmotes) {
                          return false; 
                        }
                        return true;
                      })
                      .map((emoteKey) => (
                        <TouchableOpacity
                          key={emoteKey}
                          onPress={() => addEmoteToMessage(`:${convertCamelToDashCase(emoteKey)}:`)}
                        >
                          <Image source={emotes[emoteKey]} style={{ width: 50, height: 50 }} />
                        </TouchableOpacity>
                      ))}
                  </View>
                </ScrollView>
                <CustomButton title="Close" handlePress={toggleEmotePicker} />
              </View>
            </View>
          </Modal>

          <View className="flex-row items-center">
            {/* Emote Button */}
          <TouchableOpacity onPress={toggleEmotePicker}>
            <Image source={emotes.catSmile} className="w-8 h-8 mr-2" />
          </TouchableOpacity>
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
