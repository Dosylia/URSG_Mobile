import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react'
import { SessionContext } from '../../context/SessionContext';
import { router } from 'expo-router';
import axios from 'axios';

import { images } from "../../constants";
import { FormField } from "../../components";
import { CustomButton } from "../../components";


const updateSocial = () => {
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [form, setForm] = useState({
    username: sessions.userSession.username,
    discord: sessions.userSession.discord,
    twitter: sessions.userSession.twitter,
    instagram: sessions.userSession.instagram,
    twitch: sessions.userSession.twitch
  });
  const hasAnySocial = form.twitter || form.instagram || form.discord || form.twitch;

  useEffect(() => {
    if (sessions.googleSession && sessions.userSession && sessions.leagueSession && sessions.lookingforSession) {
      setForm(prevForm => ({
        ...prevForm,
      }));
    } 
  }, [sessions]);


  function submitForm() { // Add google data from Session created in previous step
    // Check if all form fields are filled
    console.log("Submitting form with data:", form);

      // Send data to the PHP folder
      axios.post('https://ur-sg.com/updateSocialPhone', {
        userData: JSON.stringify(form)
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(response => {
        // Debugging the response
        console.log("Axios response:", {
          status: response.status,
          data: response.data,
          headers: response.headers,
          config: response.config
        });
          const data = response.data;
          if (data.message !== 'Success') {
            setErrors(data.message);
        } else {
            // Update the session context with the new data
            setSession('userSession', {
              username: form.username,
              discord: form.discord,
              twitter: form.twitter,
              instagram: form.instagram,
              twitch: form.twitch,
            }, () => {
              router.push("/(tabs)/profile");
            });
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

  return (
    <SafeAreaView className="bg-darkgrey h-full">
      <ScrollView>
        <View className="w-full justify-start h-full px-4 my-6">
          <Image 
            source={images.logoWhite}
            className="w-[100px] h-[50px]"
            resizeMode='contain'
          />
        <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">
        {hasAnySocial ? "Update your social profiles" : "Add your social profiles"}
        </Text>
        {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
        <FormField 
            title="Twitter"
            value={form.twitter}
            placeholder={form.twitter ? form.twitter : "URL of your Twitter profile"}
            handleChangeText={(e) => setForm({ ...form, twitter: e })}
            otherStyles="mt-7"
        />
        <FormField 
            title="Instagram"
            value={form.instagram}
            placeholder={form.instagram ? form.instagram : "URL of your Instagram profile"}
            handleChangeText={(e) => setForm({ ...form, instagram: e })}
            otherStyles="mt-7"
        />
        <FormField 
            title="Discord"
            value={form.discord}
            placeholder={form.discord ? form.discord : "Your Discord username"}
            handleChangeText={(e) => setForm({ ...form, discord: e })}
            otherStyles="mt-7"
        />
        <FormField 
            title="Twitch"
            value={form.twitch}
            placeholder={form.twitch ? form.twitch : "URL of your Twitch profile"}
            handleChangeText={(e) => setForm({ ...form, twitch: e })}
            otherStyles="mt-7"
        />
        <CustomButton 
            title="Update profile"
            handlePress={submitForm} // Handle sending data to database and router.push("/league-data")
            containerStyles ="w-full mt-7"
        />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default updateSocial