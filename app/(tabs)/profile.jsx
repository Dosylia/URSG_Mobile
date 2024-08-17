import { Text, View, Button, TouchableOpacity, Image, ScrollView } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';

import { icons } from "../../constants";
import { SessionContext } from '../../context/SessionContext';
import { ProfileHeader } from "../../components";
import { RiotProfileSection } from "../../components";
import { LookingForSection } from "../../components";
import { UserDataComponent } from "../../components";

const profile = () => {
  const { sessions, setSession } = useContext(SessionContext);
  const [userData, setUserData] = useState(null);
  console.log('userData:', userData);
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
    <ScrollView className="flex-1 bg-gray-900 p-4">
        <UserDataComponent sessions={sessions} onUserDataChange={setUserData} />
       <TouchableOpacity
        onPress={handleLogout}
        className="flex w-full items-end mb-7"
      >
        <Image
          source={icons.logout}
          resizeMode="contain"
          className="w-6 h-6"
        />
      </TouchableOpacity>
     <ProfileHeader userData={userData} />
     <RiotProfileSection userData={userData} />
     <LookingForSection userData={userData} />
   </ScrollView>
  );
};

export default profile;
