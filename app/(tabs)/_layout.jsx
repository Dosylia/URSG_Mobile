import { View, Text, Image, TouchableOpacity } from 'react-native'
import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs, router } from "expo-router";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { icons } from "../../constants";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-2 ">
      <Image 
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
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
    <>
      <View className="flex w-full flex-row justify-between items-center p-5 bg-gray-900">
        <TouchableOpacity onPress={handleProfileUpdate}>
          <Image
            source={icons.gear}
            resizeMode="contain"
            className="w-6 h-6"
            style={{ transform: [{ rotateY: '180deg' }] }} // Mirror the gear icon
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
          tabBarIcon: ({ color, focused}) => (
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
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon={icons.bubbleChat}
              color={color}
              name="Chat"
              focused={focused}
            />
          )
        }}
      />
      <Tabs.Screen 
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon={icons.profile}
              color={color}
              name="Profile"
              focused={focused}
            />
          )
        }}
      />
    </Tabs>
    </>
  )
}

export default TabsLayout