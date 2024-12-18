import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, Clipboard, Alert, Modal, TextInput} from 'react-native';
import { Linking } from 'react-native';
import { images } from "../constants";
import { icons } from "../constants";
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { SessionContext } from '../context/SessionContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileHeader = ({ userData, isProfile }) => {
  const { colorScheme } = useColorScheme();
  const { sessions } = useContext(SessionContext);
  const { t } = useTranslation();
  const profileImage = images.defaultpicture; 
  const addImage = colorScheme === 'dark' ? icons.addImageDark : icons.addImage;
  const [ownedItems, setOwnedItems] = useState([]);
  const [visibleReport, setVisibleReport] = useState(false);
  const [description, setDescription] = useState("");

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

  const reportUserOpen = () => {
    setVisibleReport(true);
  };

  const reportUserClose = () => {
    setVisibleReport(false);
  };

  const reportUser = async (userId, reportedId, reason) => {
    const status = 'pending';
    const content = 'Profile';
    const dataToSend = {
      userId,
      reportedId,
      content,
      status,
      reason
    };

    const jsonData = JSON.stringify(dataToSend);

    try {

      const reportedUsers = await AsyncStorage.getItem('reportedUsers');
      const reportedList = reportedUsers ? JSON.parse(reportedUsers) : [];

      if (reportedList.includes(reportedId)) {
        Alert.alert("You have already reported this user.");
        reportUserClose();
      }

      let response;
        response = await axios.post('https://ur-sg.com/reportUserPhone', `param=${encodeURIComponent(jsonData)}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${sessions.googleSession.token}`,
          }
        });

      console.log('Success:', response.data);

      if (response.data.success) {
        reportedList.push(reportedId);
        await AsyncStorage.setItem('reportedUsers', JSON.stringify(reportedList));
        reportUserClose();
      }
    } catch (error) {
      console.error('Error:', error);
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
        {!isProfile && (
          <TouchableOpacity onPress={reportUserOpen} className="absolute top-0 -right-14">
            <Image 
              source={images.hammer} 
              className="w-6 h-6" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* User information */}
      <View className="items-center flex-row gap-2 my-2">
      <Text className="text-3xl font-bold mt-2 text-white dark:text-blackPerso">
      <Text className="text-3xl font-bold mt-4 text-white dark:text-blackPerso">
          {userData?.username || 'Unknown User'}
        </Text>
        <Text className="text-xl pr-3">, {userData?.age || 'N/A'}</Text>
      </Text>

        {/* VIP badge if applicable */}
        {userData?.isVip && (
          <Image 
            source={images.premiumBadge} 
            style={{ width: 30, height: 30 }} 
          />
        )}
        {/* Partner badge if applicable */}
        {userData?.isPartner && (
          <Image 
            source={images.partnerBadge} 
            style={{ width: 30, height: 30 }} 
          />
        )}
        {/* Certified badge if applicable */}
        {userData?.isCertified && (
          <Image 
            source={images.certifiedBadge} 
            style={{ width: 30, height: 30 }} 
          />
        )}
      </View>

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
        {userData?.bluesky && (
          <TouchableOpacity onPress={() => handleOpenLink(`https://bsky.app/profile/${userData.bluesky}`)}>
            <Image source={images.bluesky} className="w-10 h-10" />
          </TouchableOpacity>
        )}
      </View>

      {/* Report Modal */}
      <Modal
        visible={visibleReport}
        transparent={true}
        animationType="slide"
        onRequestClose={reportUserClose}
      >
        <View className="flex-1 justify-center items-center">
          {/* Modal Container */}
            <View className={`${colorScheme === 'dark' ? 'bg-gray-500' : 'bg-gray-800'} p-6 rounded-lg w-4/5`}>
            {/* Title */}
            <TouchableOpacity 
              onPress={reportUserClose} 
              className="absolute top-4 right-4"
            >
              <Text className="text-red-500 text-2xl font-bold">✕</Text>
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold mb-4">Report User</Text>
            <Text className="text-gray-400 mb-3">Please let us know why you are reporting this user</Text>
            
            {/* User Info */}
            <View className="flex-row items-center">
            <Image
              source={
                userData.picture
                  ? { uri: `https://ur-sg.com/public/upload/${userData.picture}` }
                  : profileImage
              }
              className="w-24 h-24 rounded-full mb-7"
            />
              <Text className="text-white text-xl font-semibold pl-3">{userData?.username || 'Unknown User'}</Text>
            </View>

            {/* Description Input */}
            <Text className="text-white font-bold mb-2">
              Description <Text className="text-gray-400 font-normal">(optional)</Text>
            </Text>
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Type here..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              className="w-full bg-gray-700 text-white p-3 rounded-md mb-5"
            />

            {/* Report Button */}
            <TouchableOpacity   onPress={() => reportUser(sessions.userSession.userId, userData.userId, description)} className="w-full bg-mainred p-3 rounded-lg items-center">
              <Text className="text-white text-lg font-semibold">Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileHeader;
