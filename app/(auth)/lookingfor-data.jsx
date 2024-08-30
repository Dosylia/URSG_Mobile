import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../context/SessionContext';
import React, { useState, useContext, useEffect } from 'react'
import { Redirect, router } from 'expo-router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { FormField } from "../../components";
import { CustomButton } from "../../components";
import championList from  "../../constants/championList";
import roleList from "../../constants/roleList";
import rankList from "../../constants/rankList";

const LookingForData = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [form, setForm] = useState({
    userId: '',
    gender: 'Male',
    kindOfGamer: 'Chill',
    game: 'League of Legends',
    main1: 'Aatrox',
    main2: 'Aatrox',
    main3: 'Aatrox',
    rank: 'Bronze',
    role: 'ADCarry'
  })

  useEffect(() => {
    if (sessions.userSession && sessions.userSession.userId) {
      console.log("User session found:", sessions.userSession);
      setForm(prevForm => ({
        ...prevForm,
        userId: sessions.userSession.userId,
        game: sessions.userSession.game,
        // Optionally, you can prepopulate other fields if necessary
      }));
    } else {
      console.log("User session not yet populated");
    }
  }, [sessions.userSession]);



  function submitForm() { // Add google data from Session created in previous step
    // Check if all form fields are filled
    if (
      form.gender &&
      form.kindOfGamer &&
      form.main1 &&
      form.main2 &&
      form.main3 &&
      form.rank &&
      form.role &&
      form.main1 !== form.main2 &&
      form.main1 !== form.main3 &&
      form.main2 !== form.main3
    ) {
      // Send data to the PHP folder
      axios.post('https://ur-sg.com/createLookingForUserPhone', {
        lookingforData: JSON.stringify(form)
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => {
          const data = response.data;
          console.log(data)
          if (data.message !== 'Success') {
            setErrors(data.message);
          } else {
          // Store session ID if needed
          console.log("Looking for user data submitted successfully:", data.user);
          setSession('lookingforSession', data.user, (updatedSessions) => {
            console.log("Looking for session after setting:", updatedSessions.lookingforSession);
          });
          router.push("/swiping");
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
      setErrors('Please fill all fields and ensure main champions are unique.');
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


  const availableChampionsForMain1 = championList;
  const availableChampionsForMain2 = form.main1 !== 'Aatrox' ? 
  championList.filter(champion => champion !== form.main1) : 
  championList;
const availableChampionsForMain3 = form.main1 !== 'Aatrox' && form.main2 !== 'Aatrox' ? 
  championList.filter(champion => champion !== form.main1 && champion !== form.main2) : 
  championList;


  const roles = roleList.map((role) => (
    { label: role, value: role }
  ));

  const ranks = rankList.map((rank) => (
    { label: rank, value: rank }
  ));

  return (
    <SafeAreaView className="bg-gray-900 h-full dark:bg-whitePerso">
      <ScrollView>
        <View className="w-full justify-start h-full px-4 my-6">
          <Text className="text-2xl text-white dark:text-blackPerso text-semibpmd mt-5 font-psemibold">{t('interest')}</Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
          <FormField 
            title={t('lf.gender')}
            value={form.gender}
            handleChangeText={(value) => setForm({ ...form, gender: value })}
            placeholder={t('placeholders.genderLf')}
            otherStyles="mt-7"
            isSelect={true}
            options={genderOptions}
          />
          <FormField 
            title={t('lf.kind-of-gamer')}
            value={form.kindOfGamer}
            handleChangeText={(value) => setForm({ ...form, kindOfGamer: value })}
            placeholder={t('placeholders.kind-of-gamerLf')}
            otherStyles="mt-7"
            isSelect={true}
            options={gamerOptions}
          />
          <FormField 
            title={t('lf.main1')}
            value={form.main1}
            handleChangeText={(value) => setForm({ ...form, main1: value })}
            placeholder= {t('placeholders.main1Lf')}
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain1.map(champion => ({ label: champion, value: champion }))}
            image={form.main1}
            imageOrigin='champions'
          />
          <FormField 
            title={t('lf.main2')}
            value={form.main2}
            handleChangeText={(value) => setForm({ ...form, main2: value })}
            placeholder={t('placeholders.main2Lf')}
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain2.map(champion => ({ label: champion, value: champion }))}
            image={form.main2}
            imageOrigin='champions'
          />
          <FormField 
            title={t('lf.main3')}
            value={form.main3}
            handleChangeText={(value) => setForm({ ...form, main3: value })}
            placeholder={t('placeholders.main3Lf')}
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain3.map(champion => ({ label: champion, value: champion }))}
            image={form.main3}
            imageOrigin='champions'
          />
            <FormField 
            title={t('lf.rank')}
            value={form.rank}
            handleChangeText={(value) => setForm({ ...form, rank: value })}
            placeholder={t('placeholders.rankLf')}
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={ranks}
            image={form.rank}
            imageOrigin='ranks'
          />
          <FormField 
            title={t('lf.role')}
            value={form.role}
            handleChangeText={(value) => setForm({ ...form, role: value })}
            placeholder={t('placeholders.roleLf')}
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={roles}
            image={form.role}
            imageOrigin='roles'
          />
          <CustomButton 
             title={t('to-swiping')}
             handlePress={submitForm} // Handle sending data to database and router.push("/swiping")
             containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LookingForData