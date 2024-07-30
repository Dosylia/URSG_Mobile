import { View, Text, Image } from 'react-native'
import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";

import { icons } from "../../constants";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-2">
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
  return (
    <>
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
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon={icons.home}
              color={color}
              name="Home"
              focused={focused}
            />
          )
        }}
      />
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