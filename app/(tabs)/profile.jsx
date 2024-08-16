import { Text, View, Button, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';

import { icons } from "../../constants";

const profile = () => {
  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('Logged out');
      router.push("/");
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
      <TouchableOpacity
        onPress={handleLogout}
        className="flex w-full items-end mb-10"
      >
        <Image
          source={icons.logout}
          resizeMode="contain"
          className="w-6 h-6"
        />
      </TouchableOpacity>
    </View>
  );
};

export default profile;
