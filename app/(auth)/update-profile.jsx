import { View, Text, ScrollView, Image, TouchableOpacity, Modal, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react'
import { SessionContext } from '../../context/SessionContext';
import { router } from 'expo-router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { FormField, Collapse, CustomButton } from "../../components";
import championList from  "../../constants/championList";
import roleList from "../../constants/roleList";
import rankList from "../../constants/rankList";
import serverList from "../../constants/serverList";



const updateProfile = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [form, setForm] = useState({
    userId: sessions.userSession.userId,
    username: sessions.userSession.username,
    gender: sessions.userSession.gender,
    age: sessions.userSession.age?.toString(),
    kindOfGamer: sessions.userSession.kindOfGamer,
    game: sessions.userSession.game,
    shortBio: sessions.userSession.shortBio,
    main1: sessions.leagueSession.main1,
    main2: sessions.leagueSession.main2,
    main3: sessions.leagueSession.main3,
    rank: sessions.leagueSession.rank,
    role: sessions.leagueSession.role,
    server: sessions.leagueSession.server,
    genderLf: sessions.lookingforSession.lfGender,
    kindOfGamerLf: sessions.lookingforSession.lfKingOfGamer,
    gameLf: sessions.lookingforSession.lfGame,
    main1Lf: sessions.lookingforSession.main1Lf,
    main2Lf: sessions.lookingforSession.main2Lf,
    main3Lf: sessions.lookingforSession.main3Lf,
    rankLf: sessions.lookingforSession.rankLf,
    roleLf: sessions.lookingforSession.roleLf
  });

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

    if (
        form.userId &&
        form.username &&
        form.gender &&
        form.age &&
        form.kindOfGamer &&
        form.game &&
        form.shortBio &&
        form.main1 &&
        form.main2 &&
        form.main3 &&
        form.rank &&
        form.role &&
        form.server &&
        form.genderLf &&
        form.kindOfGamerLf &&
        form.main1Lf &&
        form.main2Lf &&
        form.main3Lf &&
        form.rankLf &&
        form.roleLf
      ) {
      // Send data to the PHP folder
      axios.post('https://ur-sg.com/updateUserPhone', {
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
              userId: form.userId,
              username: form.username,
              gender: form.gender,
              age: form.age,
              kindOfGamer: form.kindOfGamer,
              game: form.game,
              shortBio: form.shortBio
            });
    
            setSession('leagueSession', {
              main1: form.main1,
              main2: form.main2,
              main3: form.main3,
              rank: form.rank,
              role: form.role,
              server: form.server
            });
    
            setSession('lookingforSession', {
              lfGender: form.genderLf,
              lfKingOfGamer: form.kindOfGamerLf,
              main1Lf: form.main1Lf,
              main2Lf: form.main2Lf,
              main3Lf: form.main3Lf,
              rankLf: form.rankLf,
              roleLf: form.roleLf
            }, () => {
              setTimeout(() => {
                router.push("/(tabs)/profile");
              }, 1000);
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
    } else {
      // Display an error message or handle the case when not all form fields are filled
      setErrors('Please fill all fields.');
    }
  }

  let championListLf = championList;
  const availableChampionsForMain1 = championList;
  const availableChampionsForMain2 = form.main1 !== 'Aatrox' ? 
  championList.filter(champion => champion !== form.main1) : 
  championList;
    const availableChampionsForMain3 = form.main1 !== 'Aatrox' && form.main2 !== 'Aatrox' ? 
  championList.filter(champion => champion !== form.main1 && champion !== form.main2) : 
  championList;

  const availableChampionsForMain1Lf = championListLf;
  const availableChampionsForMain2Lf  = form.main1Lf  !== 'Aatrox' ? 
  championListLf.filter(champion => champion !== form.main1) : 
  championListLf;
    const availableChampionsForMain3Lf  = form.main1Lf  !== 'Aatrox' && form.main2Lf  !== 'Aatrox' ? 
  championListLf.filter(champion => champion !== form.main1Lf  && champion  !== form.main2) : 
  championListLf;

  const roles = roleList.map((role) => (
    { label: role, value: role }
  ));

  const ranks = rankList.map((rank) => (
    { label: rank, value: rank }
  ));

  const servers = serverList.map((server) => (
    { label: server, value: server }
  ));


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

  const closePage = () => {
    router.push("/(tabs)/profile");
  };



  return (
    <SafeAreaView className="bg-gray-900 dark:bg-whitePerso h-full">
      <ScrollView>
      <View className="flex w-full flex-row items-center bg-gray-900 dark:bg-whitePerso">
        <View className="flex-1" />
        <TouchableOpacity onPress={closePage}>
          <Text className="text-mainred px-5 text-3xl font-extrabold">X</Text>
        </TouchableOpacity>
      </View>
        <View className="w-full justify-start h-full px-4 my-6">
        <Text className="text-2xl text-white dark:text-blackPerso text-semibpmd mt-5 font-psemibold">{t('update-profile')}</Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
          <Collapse collapseTitle={t('basic-info.title')}>
        <FormField 
          title={t('basic-info.gender')}
          value={form.gender}
          handleChangeText={(value) => setForm({ ...form, gender: value })}
          placeholder={t('placeholders.gender')}
          otherStyles="mt-7"
          isSelect={true}
          options={genderOptions}
        />
        <FormField 
          title={t('basic-info.age')}
          value={form.age}
          placeholder={t('placeholders.age')}
          handleChangeText={(e) => setForm({ ...form, age: e })}
          otherStyles="mt-7"
          keyboardType="numeric"
        />
        <FormField 
          title={t('basic-info.kind-of-gamer')}
          value={form.kindOfGamer}
          handleChangeText={(value) => setForm({ ...form, kindOfGamer: value })}
          placeholder={t('placeholders.kind-of-gamer')}
          otherStyles="mt-7"
          isSelect={true}
          options={gamerOptions}
        />
        <FormField 
          title={t('basic-info.game')}
          value={form.game}
          handleChangeText={(value) => setForm({ ...form, game: value })}
          placeholder={t('placeholders.game')}
          otherStyles="mt-7"
          isSelect={true}
          options={gameOptions}
        />
        <FormField 
          title={t('basic-info.short-bio')}
          value={form.shortBio}
          placeholder={t('placeholders.short-bio')}
          handleChangeText={(e) => setForm({ ...form, shortBio: e })}
          otherStyles="mt-7"
        />
      </Collapse>
      <Collapse collapseTitle={t('lol.title')}>
        <FormField 
          title={t('lol.main1')}
          value={form.main1}
          handleChangeText={(value) => setForm({ ...form, main1: value })}
          placeholder={t('placeholders.main1')}
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
          placeholder={t('placeholders.main2')}
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
          placeholder={t('placeholders.main3')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain3.map(champion => ({ label: champion, value: champion }))}
          image={form.main3}
          imageOrigin='champions'
        />
        <FormField 
          title={t('lol.rank')}
          value={form.rank}
          handleChangeText={(value) => setForm({ ...form, rank: value })}
          placeholder={t('placeholders.rank')}
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
          placeholder={t('placeholders.role')}
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
          placeholder={t('placeholders.server')}
          otherStyles="mt-7"
          isSelect={true}
          options={servers}
        />
      </Collapse>
      <Collapse collapseTitle={t('lf.title')}>
        <FormField 
          title={t('lf.gender')}
          value={form.genderLf}
          handleChangeText={(value) => setForm({ ...form, genderLf: value })}
          placeholder={t('placeholders.genderLf')}
          otherStyles="mt-7"
          isSelect={true}
          options={genderOptions}
        />
        <FormField 
          title={t('lf.kind-of-gamer')}
          value={form.kindOfGamerLf}
          handleChangeText={(value) => setForm({ ...form, kindOfGamerLf: value })}
          placeholder={t('placeholders.kind-of-gamerLf')}
          otherStyles="mt-7"
          isSelect={true}
          options={gamerOptions}
        />
        <FormField 
          title={t('lf.main1')}
          value={form.main1Lf}
          handleChangeText={(value) => setForm({ ...form, main1Lf: value })}
          placeholder={t('placeholders.main1Lf')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain1Lf.map(champion => ({ label: champion, value: champion }))}
          image={form.main1Lf}
          imageOrigin='champions'
        />
        <FormField 
          title={t('lf.main2')}
          value={form.main2Lf}
          handleChangeText={(value) => setForm({ ...form, main2Lf: value })}
          placeholder={t('placeholders.main2Lf')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain2Lf.map(champion => ({ label: champion, value: champion }))}
          image={form.main2Lf}
          imageOrigin='champions'
        />
        <FormField 
          title={t('lf.main3')}
          value={form.main3Lf}
          handleChangeText={(value) => setForm({ ...form, main3Lf: value })}
          placeholder={t('placeholders.main3Lf')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain3Lf.map(champion => ({ label: champion, value: champion }))}
          image={form.main3Lf}
          imageOrigin='champions'
        />
        <FormField 
          title={t('lf.rank')}
          value={form.rankLf}
          handleChangeText={(value) => setForm({ ...form, rankLf: value })}
          placeholder={t('placeholders.rankLf')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={ranks}
          image={form.rankLf}
          imageOrigin='ranks'
        />
        <FormField 
          title={t('lf.role')}
          value={form.roleLf}
          handleChangeText={(value) => setForm({ ...form, roleLf: value })}
          placeholder={t('placeholders.roleLf')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={roles}
          image={form.roleLf}
          imageOrigin='roles'
        />
      </Collapse>
          <CustomButton 
             title="Update profile"
             handlePress={submitForm}
             containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default updateProfile