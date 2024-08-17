import React from 'react';
import { View, Text, Image, TouchableOpacity, Clipboard, Alert } from 'react-native';
import { Linking } from 'react-native';
import { images } from "../constants";

const ProfileHeader = ({ userData }) => {
  const profileImage = images.defaultpicture; //   const profileImage = userData && userData.picture ? userData.picture : images.defaultpicture;


  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const handleCopyToClipboard = async (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied to Clipboard', 'Discord has been copied!');
  };

  return (
    <View className="items-center mb-5">
      <Image source={profileImage} className="w-36 h-36 rounded-full" />
      <Text className="text-3xl font-bold mt-4 text-white">{userData?.username || 'Unknown User'}</Text>
      <Text className="text-lg text-white">{userData?.age || 'N/A'}</Text>
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