import { View, Text, Image, TouchableOpacity, Modal, Button } from 'react-native';
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { images } from '../constants';
import { router } from 'expo-router';
import { SessionContext } from '../context/SessionContext';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

const UserDataChat = ({ userData }) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const { setSession, sessions } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const profileImage = images.defaultpicture; 
  
  const openBlockPopup = () => {
    setModalVisible(true);
  };

  const handleBlockUser = (userId, friendId) => {
    setModalVisible(false);

    const userData = {
      senderId: userId,
      receiverId: friendId
    }

    axios.post('https://ur-sg.com/blockPersonPhone', {
      userData: JSON.stringify(userData)
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => {
        const data = response.data;
        if (data.message !== 'Success') {
          setErrors(data.message);
        } else {
          router.push(`/swiping`);
        }
      })
      .catch(error => {
        if (axios.isAxiosError(error)) {
          console.error("Error submitting form:", error.message);
          console.error("Error details:", {
            message: error.message,
            code: error.code,
            config: error.config,
            response: error.response ? {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers
            } : undefined
          });
        } else {
          console.error("Error submitting form:", error);
        }
        setErrors('Error submitting form');
      });
  };

  const redirectToProfile = (friendId) => {
    setSession('friendId', friendId);
    router.push(`/profile`);
  };

  return (
    <View className={`${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800' } flex-row items-center justify-between p-4 mb-2 rounded`}>
      {/* User Profile Image */}
      <Image 
      source={
        userData.friend_picture
          ? { uri: `https://ur-sg.com/public/upload/${userData.friend_picture}` }
          : profileImage}  
      className="w-10 h-10 rounded-full" />

      {/* Username */}
      <Text className="text-white ml-4 dark:text-blackPerso" onPress={() => redirectToProfile(userData.friend_id)}>
        {userData.friend_username}
      </Text>

      {/* 3-dot Icon */}
      <TouchableOpacity onPress={openBlockPopup} className="ml-auto">
        <Text className="text-mainred text-xl">⋮</Text>
      </TouchableOpacity>

      {/* Block User Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-gray-900 dark:bg-white bg-opacity-50">
          <View className={`${colorScheme === 'dark' ? 'bg-gray-500' : 'bg-gray-800' }  p-6 rounded-lg w-4/5`}>
            <Text className="text-white text-lg mb-4">{t('block-user')}</Text>
            <View className="flex-row justify-end">
              <Button title={t('cancel')} onPress={() => setModalVisible(false)} color="#aaa" />
              <Button title={t('block')} onPress={() => handleBlockUser(sessions.userSession.userId, userData.friend_id)} color="#e74057" />
            </View>
          </View>
        </View>
      </Modal>
      {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
    </View>
  );
};

export default UserDataChat;
