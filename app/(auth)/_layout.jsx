import { Stack } from "expo-router";
import React from 'react'
import { SafeAreaView } from 'react-native';
import { useColorScheme } from 'nativewind';

const AuthLayout = () => {
  const { colorScheme } = useColorScheme();
  const backgroundColorHeader = colorScheme === 'dark' ? '#ffffff' : '#111827';
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 50, backgroundColor: backgroundColorHeader }}>
        <Stack
            screenOptions={{
              headerShown: false, 
              tabBarShowLabel: false, 
            }}
          >
            <Stack.Screen 
              name="basic-info"
              option={{ headerShown: false }}
            />
            <Stack.Screen 
              name="league-data"
              option={{ headerShown: false }}
            />
            <Stack.Screen 
              name="lookingfor-data"
              option={{ headerShown: false }}
            />
            <Stack.Screen 
              name="update-profile"
              option={{ headerShown: false }}
            />
        </Stack>
    </SafeAreaView>
  )
}

export default AuthLayout