import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, Clipboard, Alert } from 'react-native';
import { Linking } from 'react-native';
import { images } from "../constants";
import { icons } from "../constants";
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { SessionContext } from '../context/SessionContext';
import axios from 'axios';

const ProfileHeader = ({ userData, isProfile }) => {
  const { colorScheme } = useColorScheme();
  const { sessions } = useContext(SessionContext);
  const { t } = useTranslation();
  const profileImage = images.defaultpicture; 
  const addImage = colorScheme === 'dark' ? icons.addImageDark : icons.addImage;
  const [ownedItems, setOwnedItems] = useState([]);

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const handleCopyToClipboard = async (text) => {
    Clipboard.setString(text);
    Alert.alert(t('copied-clipboard'), t('discord-copied'));
  };

  const handlePictureUpdate = () => {
    router.push("/(auth)/update-picture");
  };
  
  const fetchOwnedItems = async () => {
    try {
      const response = await axios.post('https://ur-sg.com/getOwnedItems', {
        userId: userData.userId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const itemsData = response.data;
      console.log('Items data:', itemsData);
      if (itemsData.message === 'Success') {
        setOwnedItems(itemsData.items);
      } else {
        setOwnedItems([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
      fetchOwnedItems();
  }, [userData]); 

  const profileFrames = ownedItems.filter(item => item.items_category === 'profile Picture' && item.userItems_isUsed === 1);

  return (
    <View className="items-center mb-2">
      <View className="relative" style={{ overflow: 'visible' }}>
        {/* Profile frame image if available */}
        {profileFrames.length > 0 && (
          <Image
            source={{
              uri: `https://ur-sg.com/public/images/store/${profileFrames[0].items_picture.replace('.jpg', '.png')}`
            }}
            className="absolute w-52 h-52" 
            style={{ top: -20, left: -30, zIndex: 1 }} 
          />
        )}
        
        {/* Profile picture */}
        <Image
          source={
            userData.picture
              ? { uri: `https://ur-sg.com/public/upload/${userData.picture}` }
              : profileImage
          }
          className="w-36 h-36 rounded-full mb-7"
        />
        
        {/* Button to update picture */}
        {isProfile && userData.userId === sessions.userSession.userId && (
          <TouchableOpacity onPress={handlePictureUpdate} className="absolute top-0 -right-14">
            <Image 
              source={addImage} 
              className="w-6 h-6" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* User information */}
      <View className="items-center flex-row gap-3 my-3">
        <Text className="text-3xl font-bold mt-4 text-white dark:text-blackPerso">
          {userData?.username || 'Unknown User'}
        </Text>

        {/* VIP badge if applicable */}
        {userData?.isVip && (
          <Image 
            source={{ uri: "https://ur-sg.com/public/images/premium-badge.png" }} 
            style={{ width: 30, height: 30 }} 
          />
        )}
      </View>

      {/* User age */}
      <Text className="text-lg text-white dark:text-blackPerso">{userData?.age || 'N/A'}</Text>

      {/* Social media links */}
      <View className="flex-row mt-3 space-x-3">
        {userData?.twitter && (
          <TouchableOpacity onPress={() => handleOpenLink(`https://twitter.com/${userData.twitter}`)}>
            <Image source={images.twitter} className="w-10 h-10" />
          </TouchableOpacity>
        )}
        {userData?.discord && (
          <TouchableOpacity onPress={() => handleCopyToClipboard(userData.discord)}>
            <Image source={images.discord} className="w-10 h-10" />
          </TouchableOpacity>
        )}
        {userData?.instagram && (
          <TouchableOpacity onPress={() => handleOpenLink(`https://instagram.com/${userData.instagram}`)}>
            <Image source={images.instagram} className="w-10 h-10" />
          </TouchableOpacity>
        )}
        {userData?.twitch && (
          <TouchableOpacity onPress={() => handleOpenLink(`https://twitch.tv/${userData.twitch}`)}>
            <Image source={images.twitch} className="w-10 h-10" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;
