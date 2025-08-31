import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../context/SessionContext';
import React, { useState, useContext, useEffect } from 'react'
import { Redirect, router } from 'expo-router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { CustomButton, FormField } from "../../components";
import championList from  "../../constants/championList";
import roleList from "../../constants/roleList";
import rankList from "../../constants/rankList";
import serverList from "../../constants/serverList";
import { icons } from "../../constants";

const LeagueData = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [skipSelection, setSkipSelection] = useState(0);
  const [form, setForm] = useState({
    userId: '',
    main1: 'Aatrox',
    main2: 'Aatrox',
    main3: 'Aatrox',
    rank: 'Bronze',
    role: 'ADCarry',
    server: 'Europe West'
  })

  useEffect(() => {
    if (sessions.userSession && sessions.userSession.userId) {
      console.log("User session found:", sessions.userSession);
      setForm(prevForm => ({
        ...prevForm,
        userId: sessions.userSession.userId,
      }));
    } else {
      console.log("User session not yet populated");
    }
  }, [sessions.userSession]);

  useFocusEffect(
    React.useCallback(() => {
      if (sessions.userSession && sessions.userSession.userId) {
        if (sessions.leagueSession.main1 && sessions.lookingforSession.main1Lf) {
          console.log("Redirecting to profile");
          router.push("/(tabs)/profile");
        } else if (sessions.leagueSession.main1 && !sessions.lookingforSession.main1Lf) {
          console.log("Redirecting to Looking for data");
          router.push("/lookingfor-data");
        } 
      }
      return () => {
        console.log("Screen unfocused or unmounted");
      };
    }, [sessions])
  );


  function submitForm() { // Add google data from Session created in previous step
    console.log("Submitting form with data:", form, "Skip selection:", skipSelection);
    if (form.rank && form.role && form.server && (skipSelection === 1 || 
      form.main1 !== form.main2 &&
      form.main1 !== form.main3 &&
      form.main2 !== form.main3)) {
      if (skipSelection === 1) {
        form.main1 = '';
        form.main2 = '';
        form.main3 = '';
      }
      console.log("Form data is valid, sending to server...");
      axios.post('https://ur-sg.com/createLeagueUserPhone', {
        leagueData: JSON.stringify({ ...form, skipSelection })
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
        }
      })
        .then(response => {
          const data = response.data;
          if (data.message !== 'Success') {
            setErrors(data.message);
          } else {
          // Store session ID if needed
          const sessionData = {
            user: data.user,
            skipSelectionLol: skipSelection
          };

          setSession('leagueSession', sessionData);
          router.push("/lookingfor-data");
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
      setErrors(t('fill-all-fields-champions'));
    }
  }

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

  const servers = serverList.map((server) => (
    { label: server, value: server }
  ));

  const closePage = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('Logged out');
      setSession('reset');
      router.replace("/");
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileUpdate = () => {
    router.push("/(auth)/settings");
  };

  function toggleSkipSelection() {
    setSkipSelection(prev => (prev === 0 ? 1 : 0));
  }
  
  return (
    <SafeAreaView className="bg-gray-900 h-full dark:bg-whitePerso">
      <ScrollView>
        <View className="flex w-full flex-row justify-between items-center bg-gray-900 dark:bg-whitePerso px-5">
          <TouchableOpacity onPress={handleProfileUpdate}>
          <Image
            source={icons.gear}
            resizeMode="contain"
            className="w-6 h-6"
            style={{ transform: [{ rotateY: '180deg' }] }}
          />
        </TouchableOpacity>
          <TouchableOpacity onPress={closePage}>
            <Text className="text-mainred text-3xl font-extrabold">X</Text>
          </TouchableOpacity>
        </View>
        <View className="w-full justify-start h-full px-4 my-6">
          <Text className="text-2xl text-white dark:text-blackPerso text-semibpmd mt-5 font-psemibold">{t('lol.title')}</Text>
          <View className="mt-4">
            <Text className="text-white dark:text-blackPerso mb-3 font-psemibold text-xl">{t('skip-champion-selection')}</Text>
            <TouchableOpacity 
              onPress={toggleSkipSelection} 
              className={`p-2 rounded ${skipSelection ? 'bg-green-500' : 'bg-red-500'} m-2`}>
              <Text className="text-white">{skipSelection ? t('yes') : t('no')}</Text>
            </TouchableOpacity>
          </View>
          {!skipSelection && (
            <>
              <FormField 
                title={t('lol.main1')}
                value={form.main1}
                handleChangeText={(value) => setForm({ ...form, main1: value })}
                placeholder= {t('placeholders.main1')}
                otherStyles="mt-7"
                isSelect={true}
                hasImage={true}
                options={availableChampionsForMain1.map(champion => ({ label: champion, value: champion }))}
                image={form.main1}
                imageOrigin='champions'
              />
              <FormField 
                title={t('lol.main2')}
                value={form.main2}
                handleChangeText={(value) => setForm({ ...form, main2: value })}
                placeholder= {t('placeholders.main2')}
                otherStyles="mt-7"
                isSelect={true}
                hasImage={true}
                options={availableChampionsForMain2.map(champion => ({ label: champion, value: champion }))}
                image={form.main2}
                imageOrigin='champions'
              />
              <FormField 
                title={t('lol.main3')}
                value={form.main3}
                handleChangeText={(value) => setForm({ ...form, main3: value })}
                placeholder= {t('placeholders.main3')}
                otherStyles="mt-7"
                isSelect={true}
                hasImage={true}
                options={availableChampionsForMain3.map(champion => ({ label: champion, value: champion }))}
                image={form.main3}
                imageOrigin='champions'
              />
            </>
          )}
            <FormField 
            title={t('lol.rank')}
            value={form.rank}
            handleChangeText={(value) => setForm({ ...form, rank: value })}
            placeholder= {t('placeholders.rank')}
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={ranks}
            image={form.rank}
            imageOrigin='ranks'
          />
          <FormField 
            title={t('lol.role')}
            value={form.role}
            handleChangeText={(value) => setForm({ ...form, role: value })}
            placeholder= {t('placeholders.role')}
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={roles}
            image={form.role}
            imageOrigin='roles'
          />
          <FormField 
            title={t('lol.server')}
            value={form.server}
            handleChangeText={(value) => setForm({ ...form, server: value })}
            placeholder= {t('placeholders.server')}
            otherStyles="mt-7"
            isSelect={true}
            options={servers}
          />
          {errors ? <Text className="text-red-600 font-psemibold text-xl my-2">{errors}</Text> : null}
          <CustomButton 
             title={t('lol.submit')}
             handlePress={submitForm}
             containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LeagueData