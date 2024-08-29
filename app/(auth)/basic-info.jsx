import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react'
import { SessionContext } from '../../context/SessionContext';
import { Redirect, router } from 'expo-router';
import axios from 'axios';

import { images } from "../../constants";
import { FormField } from "../../components";
import { CustomButton } from "../../components";
import { useTranslation } from 'react-i18next';


const BasicInfo = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [form, setForm] = useState({
    googleId: '',
    username: '',
    gender: 'Male',
    age: '',
    kindOfGamer: 'Chill',
    game: 'League of Legends',
    shortBio: ''
  });

  useEffect(() => {
    if (sessions.googleSession && sessions.googleSession.googleId) {
      console.log("Google session found:", sessions.googleSession);
      setForm(prevForm => ({
        ...prevForm,
        googleId: sessions.googleSession.googleUserId,
        // Optionally, you can prepopulate other fields if necessary
      }));
    } else {
      console.log("Google session not yet populated");
    }
  }, [sessions.googleSession]);


  function submitForm() { // Add google data from Session created in previous step
    // Check if all form fields are filled
    console.log("Submitting form with data:", form);

    if (!form.googleId) {
      setErrors('Google ID not found');
      return;
    }

    if (
      form.username &&
      form.gender &&
      form.age &&
      form.kindOfGamer &&
      form.game &&
      form.shortBio
    ) {
      // Send data to the PHP folder
      axios.post('https://ur-sg.com/createUserPhone', {
        userData: JSON.stringify(form)
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => {
          const data = response.data;
          if (data.message !== 'Success') {
            setErrors(data.message);
          } else {
          // Store session ID if needed
          setSession('userSession', data.user, (updatedSessions) => {
            console.log("User session after setting:", updatedSessions.userSession);
          });
          router.push("/league-data");
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
      // Display an error message or handle the case when not all form fields are filled
      setErrors('Please fill all fields.');
    }
  }

  const gamerOptions = [
    { label: t('gamer-options.chill'), value: 'Chill' },
    { label: t('gamer-options.competition'), value: 'Competition' },
    { label: t('gamer-options.competition-chill'), value: 'Competition and Chill' },
  ];

  const genderOptions = [
    { label: t('gender-options.male'), value: 'Male' },
    { label: t('gender-options.female'), value: 'Female' },
    { label: t('gender-options.non-binary'), value: 'Non binary' },
  ];

  const gameOptions = [
    { label: 'League of Legends', value: 'League of Legends' },
  ];

  return (
    <SafeAreaView className="bg-gray-900 h-full">
      <ScrollView>
        <View className="w-full justify-start h-full px-4 my-6">
          <Image 
            source={images.logoWhite}
            className="w-[100px] h-[50px]"
            resizeMode='contain'
          />
          <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">{t('basic-info.title')}</Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
          <FormField 
            title={t('basic-info.username')}
            value={form.username}
            placeholder= {t('placeholders.username')}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />
          <FormField 
            title={t('basic-info.gender')}
            value={form.gender}
            handleChangeText={(value) => setForm({ ...form, gender: value })}
            placeholder= {t('placeholders.gender')}
            otherStyles="mt-7"
            isSelect={true}
            options={genderOptions}
          />
          <FormField 
            title={t('basic-info.age')}
            value={form.age}
            placeholder= {t('placeholders.age')}
            handleChangeText={(e) => setForm({ ...form, age: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />
          <FormField 
            title={t('basic-info.kind-of-gamer')}
            value={form.kindOfGamer}
            handleChangeText={(value) => setForm({ ...form, kindOfGamer: value })}
            placeholder= {t('placeholders.kind-of-gamer')}
            otherStyles="mt-7"
            isSelect={true}
            options={gamerOptions}
          />
          <FormField 
            title={t('basic-info.game')}
            value={form.game}
            handleChangeText={(value) => setForm({ ...form, game: value })}
            placeholder= {t('placeholders.game')}
            otherStyles="mt-7"
            isSelect={true}
            options={gameOptions}
          />
          <Text className="text-white pt-2">{t('more-game')}</Text>
          <FormField 
            title={t('basic-info.short-bio')}
            value={form.shortBio}
            placeholder= {t('placeholders.short-bio')}
            handleChangeText={(e) => setForm({ ...form, shortBio: e })}
            otherStyles="mt-7"
          />
          <CustomButton 
             title={t('about-game')}
             handlePress={submitForm}
             containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default BasicInfo