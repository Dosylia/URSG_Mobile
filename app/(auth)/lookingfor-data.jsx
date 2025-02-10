import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../context/SessionContext';
import React, { useState, useContext, useEffect } from 'react'
import { Redirect, router } from 'expo-router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { FormField } from "../../components";
import { CustomButton } from "../../components";
import championList from  "../../constants/championList";
import roleList from "../../constants/roleList";
import rankList from "../../constants/rankList";
import championValorantList from  "../../constants/championValorantList";
import roleValorantList from "../../constants/roleValorantList";
import rankValorantList from "../../constants/rankValorantList";
import { icons } from "../../constants";

const LookingForData = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [skipSelection, setSkipSelection] = useState(0);
  const [form, setForm] = useState({
    userId: '',
    gender: 'Male',
    kindOfGamer: 'Chill',
    game: sessions.userSession.game,
    main1: sessions.userSession.game === 'League of Legends' ? 'Aatrox' : 'Astra',
    main2: sessions.userSession.game === 'League of Legends' ? 'Aatrox' : 'Astra',
    main3: sessions.userSession.game === 'League of Legends' ? 'Aatrox' : 'Astra',
    rank: 'Bronze',
    role: sessions.userSession.game === 'League of Legends' ? 'ADCarry' : 'Controller'
  });

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

  useFocusEffect(
    React.useCallback(() => {
      if (sessions.userSession && sessions.userSession.userId) {
        if (sessions.leagueSession.main1 && sessions.lookingforSession.main1Lf) {
          console.log("Redirecting to profile");
          router.push("/(tabs)/profile");
        } 
      }
      return () => {
        console.log("Screen unfocused or unmounted");
      };
    }, [sessions])
  );



  function submitForm() { // Add google data from Session created in previous step
    // Check if all form fields are filled
    console.log("Submitting form with data:", form, "Skip selection:", skipSelection);
    if (form.rank && form.role && (skipSelection === 1 || 
      form.main1 !== form.main2 &&
      form.main1 !== form.main3 &&
      form.main2 !== form.main3)) {
      if (skipSelection === 1) {
        form.main1 = '';
        form.main2 = '';
        form.main3 = '';
      }
      axios.post('https://ur-sg.com/createLookingForUserPhone', {
        lookingforData: JSON.stringify({ ...form, skipSelection })
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
        }
      })
        .then(response => {
          const data = response.data;
          console.log(data)
          if (data.message !== 'Success') {
            setErrors(data.message);
          } else {
          // Store session ID if needed
          const sessionData = {
            user: data.user,
            skipSelectionLf: skipSelection
          };

          console.log("Looking for user data submitted successfully:", sessionData);
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
      setErrors(t('fill-all-fields-champions'));
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
    { label: t('gender-options.male-female'), value: 'Male and Female' },
    { label: t('gender-options.all'), value: 'All' },
    { label: t('gender-options.trans'), value: 'Trans' },
  ];

  let availableChampionsForMain1 = championList;
  let availableChampionsForMain2 = championList;
  let availableChampionsForMain3 = championList;
  let roles = roleList;
  let ranks = rankList;

  if (sessions.userSession.game === 'League of Legends') {
    availableChampionsForMain1 = championList;
    availableChampionsForMain2 = form.main1 !== 'Aatrox' ? 
    championList.filter(champion => champion !== form.main1) : 
    championList;
  availableChampionsForMain3 = form.main1 !== 'Aatrox' && form.main2 !== 'Aatrox' ? 
    championList.filter(champion => champion !== form.main1 && champion !== form.main2) : 
    championList;
  
    roles = [
      ...roleList.map((role) => ({ label: role, value: role })),
      { label: 'Any', value: 'Any' }
    ];
  
    ranks = [
      ...rankList.map((rank) => ({ label: rank, value: rank })),
      { label: 'Any', value: 'Any' }
    ];
  } else {
    availableChampionsForMain1 = championValorantList;
    availableChampionsForMain2 = form.main1 !== 'Astra' ? 
    championValorantList.filter(champion => champion !== form.main1) : 
    championValorantList;
  availableChampionsForMain3 = form.main1 !== 'Astra' && form.main2 !== 'Astra' ? 
    championValorantList.filter(champion => champion !== form.main1 && champion !== form.main2) : 
    championValorantList;

    roles = [
      ...roleValorantList.map((role) => ({ label: role, value: role })),
      { label: 'Any', value: 'Any' }
    ];
  
    ranks = [
      ...rankValorantList.map((rank) => ({ label: rank, value: rank })),
      { label: 'Any', value: 'Any' }
    ];
  }


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
          <Text className="text-2xl text-white dark:text-blackPerso text-semibpmd mt-5 font-psemibold">{t('interest')}</Text>
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
              title={t('lf.main1')}
              value={form.main1}
              handleChangeText={(value) => setForm({ ...form, main1: value })}
              placeholder={sessions.userSession.game === 'League of Legends' ? t('placeholders.main1Lf') : t('placeholders.agent1')}
              otherStyles="mt-7"
              isSelect={true}
              hasImage={true}
              options={availableChampionsForMain1.map(champion => ({ label: champion, value: champion }))}
              image={form.main1}
              imageOrigin={sessions.userSession.game === 'League of Legends' ? 'champions' : 'championsValorant'}
            />
            <FormField 
              title={t('lf.main2')}
              value={form.main2}
              handleChangeText={(value) => setForm({ ...form, main2: value })}
              placeholder={sessions.userSession.game === 'League of Legends' ? t('placeholders.main2Lf') : t('placeholders.agent2')}
              otherStyles="mt-7"
              isSelect={true}
              hasImage={true}
              options={availableChampionsForMain2.map(champion => ({ label: champion, value: champion }))}
              image={form.main2}
              imageOrigin={sessions.userSession.game === 'League of Legends' ? 'champions' : 'championsValorant'}
            />
            <FormField 
              title={t('lf.main3')}
              value={form.main3}
              handleChangeText={(value) => setForm({ ...form, main3: value })}
              placeholder={sessions.userSession.game === 'League of Legends' ? t('placeholders.main3Lf') : t('placeholders.agent3')}
              otherStyles="mt-7"
              isSelect={true}
              hasImage={true}
              options={availableChampionsForMain3.map(champion => ({ label: champion, value: champion }))}
              image={form.main3}
              imageOrigin={sessions.userSession.game === 'League of Legends' ? 'champions' : 'championsValorant'}
            />
          </>
        )}
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
            imageOrigin={sessions.userSession.game === 'League of Legends' ? 'ranks' : 'ranksValorant'}
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
            imageOrigin={sessions.userSession.game === 'League of Legends' ? 'roles' : 'rolesValorant'}
          />
          {errors ? <Text className="text-red-600 font-psemibold text-xl my-2">{errors}</Text> : null}
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