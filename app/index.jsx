import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from "../components";
import React, { useState, useEffect, useContext } from 'react';
import {
  GoogleSignin,
} from "@react-native-google-signin/google-signin";
import { images, icons } from "../constants";
import axios from 'axios';
import { SessionContext } from '../context/SessionContext';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';

export default function App() {
  const { colorScheme } = useColorScheme();
  const backgroundColorClass = colorScheme === 'dark' ? '#111827' : '#ffffff';
  const { t } = useTranslation();
  const [errors, setErrors] = useState('');
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { setSession, sessions } = useContext(SessionContext);;

  const appImage = colorScheme === 'dark' ? images.logo : images.logoWhite;

  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    });
    console.log("Google Sign-In configured");
  };

  useEffect(() => {
    configureGoogleSignIn();

    if (sessions.googleSession && Object.keys(sessions.googleSession).length > 0) {
      console.log("Google session found:", sessions.googleSession);
      router.push("/swiping");
    }
  }, []);

  const signIn = async () => {
    try {
      console.log("Attempting to sign in with Google");
      await GoogleSignin.hasPlayServices();
      console.log("Google Play Services are available");
      const userInfo = await GoogleSignin.signIn();
      submitForm(userInfo);
    } catch (e) {
      await GoogleSignin.signOut();
      console.log('Logged out');
      setSession('reset');
      console.error("Error during Google sign-in:", e);
      console.error("Error code:", e.code);
      console.error("Error message:", e.message);
      setErrors(e);
    }
  };

  function submitForm(userInfo) {

    const googleId = userInfo.user.id;
    const fullName = userInfo.user.name;
    const givenName = userInfo.user.givenName;
    const familyName = userInfo.user.familyName;
    const imageUrl = userInfo.user.photo;
    const email = userInfo.user.email;

    if (googleId && fullName && givenName && familyName && imageUrl && email) {
      const userData = { googleId, fullName, givenName, familyName, imageUrl, email };
      console.log("Submitting form with user data:", userData);

      axios.post('https://ur-sg.com/googleDataPhone', {
        googleData: JSON.stringify(userData)
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(response => {
        const data = response.data;
        console.log("Response from server:", data);
        if (data.message !== "Success") {
          setErrors(data.message);
          return;
        }
        setIsLoading(true);

        setSession('googleSession', data.googleUser, (updatedSessions) => {
          console.log("Google session after setting:", updatedSessions.googleSession);
      });

        if (!data.newUser) {
          setSession('userSession', data.user, (updatedSessions) => {
            console.log("User session after setting:", updatedSessions.userSession);
          });
  

          if (data.userExists) {
            if (data.leagueUserExists) {
              setSession('leagueSession', data.leagueUser, (updatedSessions) => {
                console.log("League user session after setting:", updatedSessions.leagueSession);
            });

              if (data.lookingForUserExists) {
                setSession('lookingforSession', data.lookingForUser, (updatedSessions) => {
                  console.log("Looking for session after setting:", updatedSessions.lookingforSession);
              });
                console.log("Navigating to /swiping");
                router.push("/swiping");
              } else {
                console.log("Navigating to /lookingfor-data");
                router.push("/lookingfor-data");
              }
            } else {
              console.log("Navigating to /league-data");
              router.push("/league-data");
            }
          } else {
            console.log("Navigating to /basic-info");
            router.push("/basic-info");
          }
        } else {
          console.log("Navigating to /basic-info");
          router.push("/basic-info");
        }
      })
      .catch(error => {
        if (axios.isAxiosError(error)) {
          console.error("Error submitting form:", error.message);
          console.error("Error details:", {
            message: error.message,
            code: error.code,
            config: error.config,
            response: error.response ? {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers
            } : undefined
          });
        } else {
          console.error("Error submitting form:", error);
        }
        setErrors('Error submitting form');
      });
    }
  }

  if (
    sessions.googleSession && Object.keys(sessions.googleSession).length > 0 &&
    sessions.userSession && Object.keys(sessions.userSession).length > 0 &&
    sessions.leagueSession && Object.keys(sessions.leagueSession).length > 0 &&
    sessions.lookingforSession && Object.keys(sessions.lookingforSession).length > 0
  ) {
    console.log("Google session found:", sessions.googleSession);
    console.log("User session found:", sessions.userSession);
    console.log("League session found:", sessions.leagueSession);
    console.log("Looking for session found:", sessions.lookingforSession);
    return <Redirect href="/swiping" />;
  } else {
    console.log("Not all sessions found:", sessions);
  }

  const handleProfileUpdate = () => {
    router.push("/(auth)/settings");
  };

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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 dark:bg-whitePerso">
        <ActivityIndicator size="large" color="#e74057" />
      </View>
    );
  }
 
  return (
      <SafeAreaView className="bg-gray-900 h-full dark:bg-whitePerso">
        <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="flex w-full flex-row justify-between items-center bg-gray-900 dark:bg-whitePerso px-4">
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
          <View className="w-full flex justify-normal items-center h-full px-4">
            <Image
              source={appImage}
              className="w-[150px] h-[100px] mt-3"
              resizeMode='contain'
            />
            <Image
              source={images.ahri}
              className="max-w-[380px] w-full h-[300px] rounded-md"
              resizeMode='contain'
            />
            <View className="relative mt-4">
              <Text className="text-3xl text-white dark:text-blackPerso font-bold text-center">
                {`${t('find-perfect')} ${"\n"} ${t('soulmate')} ${""} `}
                <Text className="text-mainred">URSG</Text>
              </Text>
            </View>
            <Text className="text-center text-white dark:text-blackPerso mt-5 font-pregular mb-5">
              {t('level-up')}
            </Text>
            {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
            <CustomButton
              title={t('join-google')}
              handlePress={signIn}
              containerStyles="w-full mt-7"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}
