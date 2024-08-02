import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, ScrollView } from "react-native";
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from "../components";
import React, { useState, useContext } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { images } from "../constants";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [errors, setErrors] = useState('');
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '666369513537-u2rp4sim5m04ic08pbk9d1stmnr1lfls.apps.googleusercontent.com',
    iosClientId: '515525000068-0ci6qe38vc834ei52mpj57ofmhrl1e35.apps.googleusercontent.com',
    androidClientId: '515525000068-650oaea7l2nlt12s5j6u64pd3ecur7ns.apps.googleusercontent.com',
    redirectUri: 'ursg://redirect',
    useProxy: false, 
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  async function fetchUserInfo(token) {
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userInfo = await response.json();
    submitForm(userInfo);
  }

  function submitForm(responsePayload) {
    const { sub: googleId, name: fullName, given_name: givenName, family_name: familyName, picture: imageUrl, email } = responsePayload;

    if (googleId && fullName && givenName && familyName && imageUrl && email) {
        const userData = { googleId, fullName, givenName, familyName, imageUrl, email };

        fetch('https://ur-sg.com/googleTest', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
          if (data.message !== "Success") {
            setErrors(data.message);
            return;
          }

          setSession('googleSession', data.googleUser);

          if (!data.newUser) {
            setSession('userSession', data.user);

            if (data.userExists) {
              if (data.leagueUserExists) {
                setSession('leagueSession', data.leagueUser);

                if (data.lookingForUserExists) {
                  setSession('lookingforSession', data.lookingForUser);
                  router.push("/swiping");
                } else {
                  router.push("/lookingfor-data");
                }
              } else {
                router.push("/league-data");
              }
            } else {
              router.push("/basic-info");
            }
          }
        })
        .catch(error => console.error('Error:', error));
    } else {
      setErrors('Please fill all fields.');
    }
  }

  return (
    <SafeAreaView className="bg-darkgrey h-full">
      <ScrollView contentContainerStyle={{
        height: "100%",
      }}>
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
            handlePress={() => {
              promptAsync();
            }}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#161622' style='light' />
    </SafeAreaView>
  );
}