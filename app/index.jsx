import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, ScrollView } from "react-native";
import { router, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from "../components";
import React, { useState, useEffect, useContext } from 'react';
import {
  GoogleSignin,
} from "@react-native-google-signin/google-signin";

import { images } from "../constants";
import axios from 'axios';
import { SessionContext } from '../context/SessionContext';

export default function App() {
  const [errors, setErrors] = useState('');
  const [error, setError] = useState();
  const { setSession, sessions } = useContext(SessionContext);

  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId:
        "666369513537-fvmdrlsup4oca1ahbojmmc5anpdtj7cv.apps.googleusercontent.com",
      androidClientId:
        "666369513537-ct9j3v3f7vl9ml2l5t9nj68pnoqd7jl4.apps.googleusercontent.com",
    });
    console.log("Google Sign-In configured");
  };

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const signIn = async () => {
    try {
      console.log("Attempting to sign in with Google");
      await GoogleSignin.hasPlayServices();
      console.log("Google Play Services are available");
      const userInfo = await GoogleSignin.signIn();
      setError();
      submitForm(userInfo); // Call submitForm with userInfo
    } catch (e) {
      console.error("Error during Google sign-in:", e);
      console.error("Error code:", e.code);
      console.error("Error message:", e.message);
      setError(e);
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
 
  return (
      <SafeAreaView className="bg-darkgrey h-full">
        <ScrollView contentContainerStyle={{ height: "100%" }}>
          <View className="w-full flex justify-normal items-center h-full px-4">
            <Image
              source={images.logoWhite}
              className="w-[150px] h-[100px] mt-5"
              resizeMode='contain'
            />
            <Image
              source={images.ahri}
              className="max-w-[380px] w-full h-[300px] rounded-md"
              resizeMode='contain'
            />
            <View className="relative mt-5">
              <Text className="text-3xl text-white font-bold text-center">
                Find your perfect {"\n"}
                soulmate with {' '}
                <Text className="text-mainred">URSG</Text>
              </Text>
            </View>
            <Text className="text-center text-white mt-5 font-pregular mb-5">
              Level up your game with your future match
            </Text>
            {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
            <CustomButton
              title="Join with Google"
              handlePress={signIn}
              containerStyles="w-full mt-7"
            />
          </View>
        </ScrollView>
        <StatusBar backgroundColor='#161622' style='light' />
      </SafeAreaView>
  );
}
