import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SessionProvider } from '../context/SessionContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';
import i18n from '../services/i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
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

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      return;
    }

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

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
  }, [toggleColorScheme, colorScheme]);

  if (!fontsLoaded || !initialLoadDone) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </SessionProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
