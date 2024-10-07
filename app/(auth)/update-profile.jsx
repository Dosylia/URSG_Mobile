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
import championValorantList from  "../../constants/championValorantList";
import roleValorantList from "../../constants/roleValorantList";
import rankValorantList from "../../constants/rankValorantList";
import serverList from "../../constants/serverList";



const updateProfile = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [previousGame, setPreviousGame] = useState(sessions.userSession.game);
  const [userData, setUserData] = useState({});
  const [form, setForm] = useState({
    userId: sessions.userSession.userId,
    username: sessions.userSession.username,
    gender: sessions.userSession.gender,
    age: sessions.userSession.age?.toString(),
    kindOfGamer: sessions.userSession.kindOfGamer,
    game: sessions.userSession.game,
    shortBio: sessions.userSession.shortBio,
    main1: sessions.userSession.game === 'League of Legends' ? sessions.leagueSession.main1 : sessions.valorantSession.main1,
    main2: sessions.userSession.game === 'League of Legends' ? sessions.leagueSession.main2 : sessions.valorantSession.main2,
    main3: sessions.userSession.game === 'League of Legends' ? sessions.leagueSession.main3 : sessions.valorantSession.main3,
    rank: sessions.userSession.game === 'League of Legends' ? sessions.leagueSession.rank : sessions.valorantSession.rank,
    role: sessions.userSession.game === 'League of Legends' ? sessions.leagueSession.role : sessions.valorantSession.role,
    server: sessions.userSession.game === 'League of Legends' ? sessions.leagueSession.server : sessions.valorantSession.server,
    genderLf: sessions.lookingforSession.lfGender,
    kindOfGamerLf: sessions.lookingforSession.lfKingOfGamer,
    gameLf: sessions.lookingforSession.lfGame,
    main1Lf: sessions.userSession.game === 'League of Legends' ? sessions.lookingforSession.main1Lf : sessions.lookingforSession.valmain1Lf,
    main2Lf: sessions.userSession.game === 'League of Legends' ? sessions.lookingforSession.main2Lf : sessions.lookingforSession.valmain2Lf,
    main3Lf: sessions.userSession.game === 'League of Legends' ? sessions.lookingforSession.main3Lf : sessions.lookingforSession.valmain3Lf,
    rankLf: sessions.userSession.game === 'League of Legends' ? sessions.lookingforSession.rankLf : sessions.lookingforSession.valrankLf,
    roleLf: sessions.userSession.game === 'League of Legends' ? sessions.lookingforSession.roleLf : sessions.lookingforSession.valroleLf,
  });

  useEffect(() => {
    if (sessions.googleSession && sessions.userSession && sessions.leagueSession && sessions.lookingforSession) {
      setForm(prevForm => ({
        ...prevForm,
      }));
    } 
  }, [sessions]);

  useEffect(() => {
    console.log('Form game:', form.game);
    console.log('Previous game:', previousGame);
  
    // Fetch user data when the game changes
    if (form.game !== previousGame) {
      axios.post('https://ur-sg.com/getUserData', {
        userId: sessions.userSession.userId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => {
          if (response.data.message === 'Success') {
            const user = response.data.user;
            console.log('user : ', user);
            const isLoL = form.game === "League of Legends";
            const isFilled = isLoL
              ? user.lol_main1 && user.lf_lolmain1 
              : user.valorant_main1 && user.lf_valmain1; 
  
            if (isFilled) {
              console.log('Data already exist');
              console.log('Form game after change:', form.game);
              dataUpdated = {
                userId: user.user_id,
                username: form.username,
                gender: form.gender,
                age: form.age,
                kindOfGamer: form.kindOfGamer,
                game: form.game,
                shortBio: form.shortBio,
                main1: form.game === "League of Legends" ? user.lol_main1 : user.valorant_main1,
                main2: form.game === "League of Legends" ? user.lol_main2 : user.valorant_main2,
                main3: form.game === "League of Legends" ? user.lol_main3 : user.valorant_main3,
                rank: form.game === "League of Legends" ? user.lol_rank : user.valorant_rank,
                role: form.game === "League of Legends" ? user.lol_role : user.valorant_role,
                server: form.game === "League of Legends" ? user.lol_server : user.valorant_server,
                genderLf: form.genderLf,
                kindOfGamerLf: form.kindOfGamerLf,
                main1Lf: form.game === 'League of Legends' ? user.lf_lolmain1 : user.lf_valmain1,
                main2Lf: form.game === 'League of Legends' ? user.lf_lolmain2 : user.lf_valmain2,
                main3Lf: form.game === 'League of Legends' ? user.lf_lolmain3 : user.lf_valmain3,
                rankLf: form.game === 'League of Legends' ? user.lf_lolrank : user.lf_valrank,
                roleLf: form.game === 'League of Legends' ? user.lf_lolrole : user.lf_valrole,
            };
              axios.post('https://ur-sg.com/updateUserPhone', {
                userData: JSON.stringify(dataUpdated)
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
                    console.log('Failed to update profile')
                } else {
                  console.log('Successfully updating game')
                  if (form.game === "League of Legends") {
                    // Update the session context with League of Legends data
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
                      main1:user.lol_main1,
                      main2: user.lol_main2,
                      main3: user.lol_main3,
                      rank: user.lol_rank,
                      role: user.lol_role,
                      server: user.lol_server,
                      account: user.lol_account,
                      sUsername: user.lol_sUsername,
                      sRank: user.lol_sRank,
                      sLevel: user.lol_sLevel,
                      sProfileIcon : user.lol_sProfileIcon
                    });
                  
                    setSession('lookingforSession', {
                      lfGender: form.genderLf,
                      lfKingOfGamer: form.kindOfGamerLf,
                      main1Lf: user.lf_lolmain1,
                      main2Lf: user.lf_lolmain2,
                      main3Lf: user.lf_lolmain3,
                      rankLf: user.lf_lolrank,
                      roleLf: user.lf_lolrole,
                      gameLf: form.game
                    }, () => {
                      setTimeout(() => {
                        router.push("/(tabs)/profile");
                      }, 1000);
                    });
                  } else if (form.game === "Valorant") {
                    // Update the session context with Valorant data
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
                      sUsername: '',
                      sRank: '',
                      sLevel: '',
                      sProfileIcon : ''
                    });
                  
                    setSession('valorantSession', {
                      main1: user.valorant_main1,
                      main2: user.valorant_main2,
                      main3: user.valorant_main3,
                      rank: user.valorant_rank,
                      role: user.valorant_role,
                      server: user.valorant_server
                    });
                  
                    setSession('lookingforSession', {
                      lfGender: form.genderLf,
                      lfKingOfGamer: form.kindOfGamerLf,
                      valmain1Lf: user.lf_valmain1,
                      valmain2Lf: user.lf_valmain2,
                      valmain3Lf: user.lf_valmain3,
                      valrankLf: user.lf_valrank,
                      valroleLf: user.lf_valrole,
                      gameLf: form.game
                    }, () => {
                      setTimeout(() => {
                        router.push("/(tabs)/profile");
                      }, 1000);
                    });
                  }
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
              alert(`Please refill your information for ${form.game}.`);
              setForm((prevForm) => ({
                ...prevForm,
                main1: isLoL ? 'Aatrox' : 'Astra',
                main2: isLoL ? 'Aatrox' : 'Astra',
                main3: isLoL ? 'Aatrox' : 'Astra',
                rank: isLoL ? 'Bronze' : 'Bronze',
                role: isLoL ? 'ADCarry' : 'Controller',
                server: isLoL ? 'Europe West' : 'Europe West',
                main1Lf: isLoL ? 'Aatrox' : 'Astra',
                main2Lf: isLoL ? 'Aatrox' : 'Astra',
                main3Lf: isLoL ? 'Aatrox' : 'Astra',
                rankLf: isLoL ? 'Bronze' : 'Bronze',
                roleLf: isLoL ? 'ADCarry' : 'Controller',
              }));
            }
          } else {
            console.error('Failed to fetch user data');
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
  
      setPreviousGame(form.game);
    }
  }, [form.game, previousGame, sessions.userSession.userId]);

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
          if (form.game === "League of Legends") {
            // Update the session context with League of Legends data
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
              roleLf: form.roleLf,
              gameLf: form.game
            }, () => {
              setTimeout(() => {
                router.push("/(tabs)/profile");
              }, 1000);
            });
          } else if (form.game === "Valorant") {
            // Update the session context with Valorant data
            setSession('userSession', {
              userId: form.userId,
              username: form.username,
              gender: form.gender,
              age: form.age,
              kindOfGamer: form.kindOfGamer,
              game: form.game,
              shortBio: form.shortBio
            });
          
            setSession('valorantSession', {
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
              valmain1Lf: form.main1Lf,
              valmain2Lf: form.main2Lf,
              valmain3Lf: form.main3Lf,
              valrankLf: form.rankLf,
              valroleLf: form.roleLf,
              gameLf: form.game
            }, () => {
              setTimeout(() => {
                router.push("/(tabs)/profile");
              }, 1000);
            });
          }
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

  let availableChampionsForMain1 = championList;
  let availableChampionsForMain2 = championList;
  let availableChampionsForMain3 = championList;
  let availableChampionsForMain1Lf = championList;
  let availableChampionsForMain2Lf = championList;
  let availableChampionsForMain3Lf = championList;
  let roles = roleList;
  let ranks = rankList;

  if (form.game === 'League of Legends') {
    const championListLf = championList
    availableChampionsForMain1Lf = championListLf;
    availableChampionsForMain2Lf  = form.main1Lf  !== 'Aatrox' ? 
    championListLf.filter(champion => champion !== form.main1) : 
    championListLf;
      availableChampionsForMain3Lf  = form.main1Lf  !== 'Aatrox' && form.main2Lf  !== 'Aatrox' ? 
    championListLf.filter(champion => champion !== form.main1Lf  && champion  !== form.main2) : 
    championListLf;
  
    availableChampionsForMain1 = championList;
    availableChampionsForMain2 = form.main1 !== 'Aatrox' ? 
    championList.filter(champion => champion !== form.main1) : 
    championList;
  availableChampionsForMain3 = form.main1 !== 'Aatrox' && form.main2 !== 'Aatrox' ? 
    championList.filter(champion => champion !== form.main1 && champion !== form.main2) : 
    championList;
  
  
    roles = roleList.map((role) => (
      { label: role, value: role }
    ));
  
    ranks = rankList.map((rank) => (
      { label: rank, value: rank }
    ));
  } else {
    const championListLf = championValorantList
    availableChampionsForMain1Lf = championListLf;
    availableChampionsForMain2Lf  = form.main1Lf  !== 'Astra' ? 
    championListLf.filter(champion => champion !== form.main1) : 
    championListLf;
      availableChampionsForMain3Lf  = form.main1Lf  !== 'Astra' && form.main2Lf  !== 'Astra' ? 
    championListLf.filter(champion => champion !== form.main1Lf  && champion  !== form.main2) : 
    championListLf;

    availableChampionsForMain1 = championValorantList;
    availableChampionsForMain2 = form.main1 !== 'Astra' ? 
    championValorantList.filter(champion => champion !== form.main1) : 
    championValorantList;
  availableChampionsForMain3 = form.main1 !== 'Astra' && form.main2 !== 'Astra' ? 
    championValorantList.filter(champion => champion !== form.main1 && champion !== form.main2) : 
    championValorantList;
  
    roles = roleValorantList.map((role) => (
      { label: role, value: role }
    ));
  
    ranks = rankValorantList.map((rank) => (
      { label: rank, value: rank }
    ));
  }

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
    { label: 'Valorant', value: 'Valorant' },
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
      <Collapse collapseTitle={form.game === 'League of Legends' ? t('lol.title') : t('val.title')}>
        <FormField 
          title={t('lol.main1')}
          value={form.main1}
          handleChangeText={(value) => setForm({ ...form, main1: value })}
          placeholder={form.game === 'League of Legends' ? t('placeholders.main1') : t('placeholders.agent')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain1.map(champion => ({ label: champion, value: champion }))}
          image={form.main1}
          imageOrigin={form.game === 'League of Legends' ? 'champions' : 'championsValorant'}
        />
        <FormField 
          title={t('lol.main2')}
          value={form.main2}
          handleChangeText={(value) => setForm({ ...form, main2: value })}
          placeholder={form.game === 'League of Legends' ? t('placeholders.main2') : t('placeholders.agent2')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain2.map(champion => ({ label: champion, value: champion }))}
          image={form.main2}
          imageOrigin={form.game === 'League of Legends' ? 'champions' : 'championsValorant'}
        />
        <FormField 
          title={t('lol.main3')}
          value={form.main3}
          handleChangeText={(value) => setForm({ ...form, main3: value })}
          placeholder={form.game === 'League of Legends' ? t('placeholders.main3') : t('placeholders.agent3')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain3.map(champion => ({ label: champion, value: champion }))}
          image={form.main3}
          imageOrigin={form.game === 'League of Legends' ? 'champions' : 'championsValorant'}
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
          imageOrigin={form.game === 'League of Legends' ? 'ranks' : 'ranksValorant'}
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
          imageOrigin={form.game === 'League of Legends' ? 'roles' : 'rolesValorant'}
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
          placeholder={form.game === 'League of Legends' ? t('placeholders.main1Lf') : t('placeholders.agent1')}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain1Lf.map(champion => ({ label: champion, value: champion }))}
          image={form.main1Lf}
          imageOrigin={form.game === 'League of Legends' ? 'champions' : 'championsValorant'}
        />
        <FormField 
          title={t('lf.main2')}
          value={form.main2Lf}
          placeholder={form.game === 'League of Legends' ? t('placeholders.main2Lf') : t('placeholders.agent2')}
          handleChangeText={(value) => setForm({ ...form, main2Lf: value })}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain2Lf.map(champion => ({ label: champion, value: champion }))}
          image={form.main2Lf}
          imageOrigin={form.game === 'League of Legends' ? 'champions' : 'championsValorant'}
        />
        <FormField 
          title={t('lf.main3')}
          value={form.main3Lf}
          placeholder={form.game === 'League of Legends' ? t('placeholders.main3Lf') : t('placeholders.agent3')}
          handleChangeText={(value) => setForm({ ...form, main3Lf: value })}
          otherStyles="mt-7"
          isSelect={true}
          hasImage={true}
          options={availableChampionsForMain3Lf.map(champion => ({ label: champion, value: champion }))}
          image={form.main3Lf}
          imageOrigin={form.game === 'League of Legends' ? 'champions' : 'championsValorant'}
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
          imageOrigin={form.game === 'League of Legends' ? 'ranks' : 'ranksValorant'}
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
          imageOrigin={form.game === 'League of Legends' ? 'roles' : 'rolesValorant'}
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