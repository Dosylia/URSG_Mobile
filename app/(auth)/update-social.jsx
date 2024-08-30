import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react'
import { SessionContext } from '../../context/SessionContext';
import { router } from 'expo-router';
import axios from 'axios';

import { FormField } from "../../components";
import { CustomButton } from "../../components";
import { useTranslation } from 'react-i18next';


const updateSocial = () => {
  const { t } = useTranslation();
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

  const closePage = () => {
    router.push("/(tabs)/profile");
  };

  return (
    <SafeAreaView className="bg-gray-900 h-full dark:bg-whitePerso">
      <ScrollView>
      <View className="flex w-full flex-row items-center bg-gray-900 dark:bg-whitePerso">
        <View className="flex-1" />
        <TouchableOpacity onPress={closePage}>
          <Text className="text-mainred px-6 text-2xl font-extrabold">X</Text>
        </TouchableOpacity>
      </View>
        <View className="w-full justify-start h-full px-4 my-6">
          <Text className="text-2xl text-white text-semibpmd font-psemibold">
        {hasAnySocial ? t('update-social-profiles') : t('add-social-profiles')}
        </Text>
        {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
        <FormField 
            title="Twitter"
            value={form.twitter}
            placeholder={form.twitter ? form.twitter : t('placeholders.twitter')}
            handleChangeText={(e) => setForm({ ...form, twitter: e })}
            otherStyles="mt-7"
        />
        <FormField 
            title="Instagram"
            value={form.instagram}
            placeholder={form.instagram ? form.instagram : t('placeholders.instagram')}
            handleChangeText={(e) => setForm({ ...form, instagram: e })}
            otherStyles="mt-7"
        />
        <FormField 
            title="Discord"
            value={form.discord}
            placeholder={form.discord ? form.discord : t('placeholders.discord')}
            handleChangeText={(e) => setForm({ ...form, discord: e })}
            otherStyles="mt-7"
        />
        <FormField 
            title="Twitch"
            value={form.twitch}
            placeholder={form.twitch ? form.twitch : t('placeholders.twitch')}
            handleChangeText={(e) => setForm({ ...form, twitch: e })}
            otherStyles="mt-7"
        />
        <CustomButton 
            title={t('update-social')}
            handlePress={submitForm}
            containerStyles ="w-full mt-7"
        />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default updateSocial