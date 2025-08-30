import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, AppState  } from "react-native";
import { router, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from "../components";
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  GoogleSignin,
} from "@react-native-google-signin/google-signin";
import { images, icons } from "../constants";
import axios from 'axios';
import { SessionContext } from '../context/SessionContext';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import NetInfo from '@react-native-community/netinfo';


export default function App() {
  const webClientId = process.env.EXPO_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_GOOGLE_IOS_CLIENT_ID;
  const { colorScheme } = useColorScheme();
  const backgroundColorClass = colorScheme === 'dark' ? '#111827' : '#ffffff';
  const { t } = useTranslation();
  const [errors, setErrors] = useState('');
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const { setSession, sessions } = useContext(SessionContext);
  const isProcessingDeepLink = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const appImage = colorScheme === 'dark' ? images.logo : images.logoWhite;

  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: webClientId,
      androidClientId: androidClientId,
      iosClientId: iosClientId,
    });
    console.log("Google Sign-In configured");
  };

  const parseUrlParams = (url) => {
    const params = {};
    const queryString = url.split('?')[1];
    if (!queryString) return params;
    queryString.split('&').forEach((param) => {
      const eqIdx = param.indexOf('=');
      if (eqIdx === -1) return;
      const key = param.slice(0, eqIdx);
      const value = param.slice(eqIdx + 1);
      params[key] = decodeURIComponent(value || '');
    });
    return params;
  };

 const handleUrl = async ({ url }) => {
    // Prevent multiple processing of the same URL
    if (isProcessingDeepLink.current) return;
    
    console.log("Handling URL:", url);
    if (!url.startsWith("com.dosylia.URSG://riotCallback")) return;
    
    isProcessingDeepLink.current = true;
    
    try {
      const queryParams = parseUrlParams(url);
      console.log("Raw response param:", queryParams.response);
      
      if (!queryParams.response) {
        setErrors("No response parameter found in URL");
        return;
      }
      
      const decodedResponse = decodeURIComponent(queryParams.response);
      const data = JSON.parse(decodedResponse);
      
      if (data.message !== "Success") {
        setErrors(data.message);
        return;
      }
      
      // Check network connection before proceeding
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setErrors("No internet connection");
        return;
      }
      
      // Set Google session
      await new Promise((resolve) => {
        setSession("googleSession", data.googleUser, resolve);
      });
      
      if (!data.newUser) {
        await new Promise((resolve) => {
          setSession("userSession", data.user, resolve);
        });
        
        if (data.userExists) {
          if (data.user.game === "League of Legends") {
            if (data.leagueUserExists) {
              await new Promise((resolve) => {
                setSession("leagueSession", data.leagueUser, resolve);
              });
              
              if (data.lookingForUserExists) {
                await new Promise((resolve) => {
                  setSession("lookingforSession", data.lookingForUser, resolve);
                });
                
                // Use replace instead of push to avoid adding to navigation stack
                router.replace("/swiping");
              } else {
                router.replace("/lookingfor-data");
              }
            } else {
              router.replace("/league-data");
            }
          } else {
            if (data.valorantUserExists) {
              await new Promise((resolve) => {
                setSession("valorantSession", data.valorantUser, resolve);
              });
              
              if (data.lookingForUserExists) {
                await new Promise((resolve) => {
                  setSession("lookingforSession", data.lookingForUser, resolve);
                });
                
                router.replace("/swiping");
              } else {
                router.replace("/lookingfor-data");
              }
            } else {
              router.replace("/valorant-data");
            }
          }
        } else {
          router.replace("/basic-info");
        }
      } else {
        router.replace("/basic-info");
      }
    } catch (err) {
      console.error("Failed to parse Riot response:", err);
      setErrors("Invalid response from Riot");
    } finally {
      isProcessingDeepLink.current = false;
    }
  };

  useEffect(() => {
    // Check initial URL when app starts
    const checkInitialUrl = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          await handleUrl({ url });
        }
      } catch (error) {
        console.error("Error handling initial URL:", error);
      } finally {
        setIsAppReady(true);
      }
    };

    checkInitialUrl();

    const linkingSubscription = Linking.addEventListener('url', handleUrl);

    // Listen for app state changes
    const appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        console.log("App has come to the foreground");
        
        // Check if we need to refresh data or handle any pending operations
        const url = await Linking.getInitialURL();
        if (url) {
          await handleUrl({ url });
        }
      }
      
      appStateRef.current = nextAppState;
    });

    return () => {
      linkingSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);


  useEffect(() => {
    const checkExistingSessions = async () => {
      try {
        const storedSessions = await AsyncStorage.getItem('userSessions');
        if (storedSessions) {
          setIsLoading(true);
          const parsedSessions = JSON.parse(storedSessions);

          console.log("Parsed sessions from storage:", parsedSessions);

          const hasValidGoogleSession = parsedSessions.googleSession && Object.keys(parsedSessions.googleSession).length > 0;

          if (hasValidGoogleSession) {
            const userDataStored = {
              user: {
                id: parsedSessions.googleSession.googleId,
                name: parsedSessions.googleSession.fullName,
                givenName: parsedSessions.googleSession.firstName,
                familyName: parsedSessions.googleSession.lastName,
                photo: parsedSessions.googleSession.imageUrl,
                email: parsedSessions.googleSession.email,
              }
            };

            submitForm(userDataStored);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsAppReady(true);
        }
      } catch (error) {
        console.log('Error checking sessions in storage:', error);
        setIsAppReady(true);
      }
    };

    checkExistingSessions();
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

  const signInRiot = () => {
    console.log("Attempting to sign in with Riot");
    Linking.openURL("https://ur-sg.com/connectRiotMobile?phoneData=yes").catch(
      (err) => console.error("Failed to open URL:", err)
    );
  };

  function submitForm(userInfo) {

    const googleId = userInfo.user.id;
    const fullName = userInfo.user.name;
    const givenName = userInfo.user.givenName;
    const familyName = userInfo.user.familyName;
    const imageUrl = userInfo.user.photo ? userInfo.user.photo : 'defaultpicture';
    const email = userInfo.user.email;

    console.log("User info:", userInfo);

    if (googleId && fullName && givenName && imageUrl && email) {
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
            if (data.user.game === 'League of Legends') {
              if (data.leagueUserExists) {
                setSession('leagueSession', data.leagueUser, (updatedSessions) => {
                  console.log("League user session after setting:", updatedSessions.leagueSession);
              });
  
                if (data.lookingForUserExists) {
                  setSession('lookingforSession', data.lookingForUser, (updatedSessions) => {
                    console.log("Looking for session after setting:", updatedSessions.lookingforSession);
                });
                  console.log("Navigating to /swiping from League side");
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
              if (data.valorantUserExists) {
                console.log("Valorant user exists", data.valorantUser);
                setSession('valorantSession', data.valorantUser, (updatedSessions) => {
                  console.log("Valorant user session after setting:", updatedSessions.valorantSession);
              });
  
                if (data.lookingForUserExists) {
                  setSession('lookingforSession', data.lookingForUser, (updatedSessions) => {
                    console.log("Looking for session after setting:", updatedSessions.lookingforSession);
                });
                  console.log("Navigating to /swiping from Valorant side");
                  router.push("/swiping");
                } else {
                  console.log("Navigating to /lookingfor-data");
                  router.push("/lookingfor-data");
                }
              } else {
                console.log("Navigating to /valorant-data");
                router.push("/valorant-data");
              }
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
    } else {
      console.error("Missing user data:", userInfo);
      setErrors('Missing user data');
    }
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
            <CustomButton
              title={t('join-riot')}
              handlePress={signInRiot}
              containerStyles="w-full mt-7"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}
