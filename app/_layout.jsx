import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { SessionProvider } from '../context/SessionContext';
import { DataProvider } from '../context/DataContext';
import { FriendListProvider } from '../context/FriendListContext';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../services/i18next';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const backgroundColorClass = colorScheme === 'dark' ? '#ffffff' : '#111827';
  const backgroundColorClassBottom = colorScheme === 'dark' ? '#595b5e' : '#302e31';

  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  const [initialLoadDone, setInitialLoadDone] = React.useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const lng = await AsyncStorage.getItem('user-language');
        if (!lng) {
          i18n.changeLanguage('en');
        }

        const savedMode = await AsyncStorage.getItem('mode');
        if (savedMode && savedMode !== colorScheme) {
          toggleColorScheme(savedMode);
          console.log(`Mode loaded and applied: ${savedMode}`);
        } else {
          console.log(`Mode already set: ${colorScheme}`);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setInitialLoadDone(true);
      }
    };

    loadSettings();
  }, [colorScheme, toggleColorScheme]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      changeNavigationBarColor(backgroundColorClassBottom, true);
    }
  }, [backgroundColorClassBottom]);

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      return;
    }

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded || !initialLoadDone) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor={backgroundColorClass}
        translucent={Platform.OS === 'android'}
      />
      <SessionProvider>
        <DataProvider>
          <FriendListProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  tabBarShowLabel: false,
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
              </Stack>
          </FriendListProvider>
        </DataProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
