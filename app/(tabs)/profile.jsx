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
import { CustomButton } from "../../components";

const profile = () => {
  const { sessions, setSession } = useContext(SessionContext);
  const [userData, setUserData] = useState(null);

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('Logged out');
      
      // Clear session and user data
      setSession(null);
      setUserData(null);
      
      router.push("/");
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileUpdate = () => {
    router.push("/(auth)/update-profile");
  };

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      <UserDataComponent sessions={sessions} onUserDataChange={setUserData} />


      <ProfileHeader userData={userData} />
      <CustomButton 
        title="Bind a League of Legends account"
        handlePress={() => router.push("/(auth)/bind-account")} // Handle sending data to database and router.push("/league-data")
        containerStyles ="w-full mt-7"
      />
      <CustomButton 
        title="Add social links"
        handlePress={() => router.push("/(auth)/update-social")} // Handle sending data to database and router.push("/league-data")
        containerStyles ="w-full mt-7 mb-7"
      />
      <RiotProfileSection userData={userData} isProfile={true} />
      <LookingForSection userData={userData} />
    </ScrollView>
  );
};

export default profile;