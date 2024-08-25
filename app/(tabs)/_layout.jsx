import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { Tabs, router } from "expo-router";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SessionContext } from '../../context/SessionContext';
import axios from 'axios';

import { icons } from "../../constants";

const TabIcon = ({ icon, color, name, focused, badgeCount }) => {  
  return (
    <View className="items-center justify-center gap-2 relative">
      <View className="relative">
        <Image 
          source={icon}
          resizeMode="contain"
          tintColor={color}
          className="w-6 h-6"
        />
        {/* Badge rendering */}
        {badgeCount > 0 && (
          <View className="absolute -top-1 -right-5 w-5 h-5 bg-red-600 rounded-full items-center justify-center z-10">
            <Text className="text-white text-xs font-bold">{badgeCount}</Text>
          </View>
        )}
      </View>
      <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  );
};


const TabsLayout = () => {
  const { sessions, setSession } = useContext(SessionContext);
  const [unreadMessage, setUnreadMessage] = useState(0);
  const [pendingFriendRequest, setPendingFriendRequest] = useState(0);

  const fetchUnreadMessage = async () => { 
    const { userId } = sessions.userSession;
    try {
      const response = await axios.post('https://ur-sg.com/getUnreadMessage', 
        new URLSearchParams({ userId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = response.data;
      if (data.success) {
        // Normalize the unread count to a single number
        const unreadCount = data.unreadCount.length > 0 ? data.unreadCount[0].unread_count : 0;
        setUnreadMessage(unreadCount);
      } else {
        console.log('Failed to fetch unread messages:', data.error);
        setUnreadMessage(0);
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error.message);
    }
  };

  const fetchFriendRequest = async () => { 
    const { userId } = sessions.userSession;
    try {
      const response = await axios.post('https://ur-sg.com/getFriendRequest', 
        new URLSearchParams({ userId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = response.data;
      if (data.success) {
        // Normalize pending friend requests count
        setPendingFriendRequest(data.pendingCount.pendingFriendRequest || 0);
      } else {
        console.log('Failed to fetch friend requests:', data.error);
        setPendingFriendRequest(0);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error.message);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchFriendRequest();
    fetchUnreadMessage();

    const intervalId = setInterval(() => {
      fetchFriendRequest();
      fetchUnreadMessage();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []); // 

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('Logged out');
      setSession('reset');
      router.replace("/");
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileUpdate = () => {
    router.push("/(auth)/update-profile");
  };

  return (
    <>
      <View className="flex w-full flex-row justify-between items-center p-5 bg-gray-900">
        <TouchableOpacity onPress={handleProfileUpdate}>
          <Image
            source={icons.gear}
            resizeMode="contain"
            className="w-6 h-6"
            style={{ transform: [{ rotateY: '180deg' }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Image
            source={icons.logout}
            resizeMode="contain"
            className="w-6 h-6"
          />
        </TouchableOpacity>
      </View>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#e74057',
          tabBarInactiveTintColor: '#CDCDE0',
          tabBarStyle: {
            backgroundColor: '#302e31',
            borderTopWidth: 1,
            borderTopColor: '#232533',
            height: 84,
          }
        }}
      >
        <Tabs.Screen 
          name="swiping"
          options={{
            title: 'Swiping',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.swipeIcon}
                color={color}
                name="Swiping"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen 
          name="chat"
          options={{
            title: 'Chat',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.bubbleChat}
                color={color}
                name="Chat"
                focused={focused}
                badgeCount={unreadMessage}
              />
            )
          }}
        />
        <Tabs.Screen 
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}
                badgeCount={pendingFriendRequest} // Pass pendingFriendRequest count
              />
            )
          }}
        />
      </Tabs>
    </>
  );
}

export default TabsLayout;
