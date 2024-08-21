import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react'
import { SessionContext } from '../../context/SessionContext';
import { router } from 'expo-router';
import axios from 'axios';

import { images } from "../../constants";
import { FormField } from "../../components";
import { CustomButton } from "../../components";
import championList from  "../../constants/championList";
import roleList from "../../constants/roleList";
import rankList from "../../constants/rankList";
import serverList from "../../constants/serverList";


const updateProfile = () => {
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
    { label: 'Chill / Normal games', value: 'Chill' },
    { label: 'Competition / Ranked', value: 'Competition' },
    { label: 'Competition/Ranked and chill', value: 'Competition and Chill' },
  ];

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Non-binary', value: 'Non binary' },
  ];

  const gameOptions = [
    { label: 'League of Legends', value: 'League of Legends' },
  ];

  return (
    <SafeAreaView className="bg-darkgrey h-full">
      <ScrollView>
        <View className="w-full justify-start h-full px-4 my-6">
          <Image 
            source={images.logoWhite}
            className="w-[100px] h-[50px]"
            resizeMode='contain'
          />
          <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">Update your profile</Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
          <FormField 
            title="Gender"
            value={form.gender}
            handleChangeText={(value) => setForm({ ...form, gender: value })}
            placeholder= "Chose your gender"
            otherStyles="mt-7"
            isSelect={true}
            options={genderOptions}
          />
          <FormField 
            title="Age"
            value={form.age}
            placeholder= "Your age"
            handleChangeText={(e) => setForm({ ...form, age: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />
          <FormField 
            title="Kind of Gamer"
            value={form.kindOfGamer}
            handleChangeText={(value) => setForm({ ...form, kindOfGamer: value })}
            placeholder= "What kind of gamer are you?"
            otherStyles="mt-7"
            isSelect={true}
            options={gamerOptions}
          />
          <FormField 
            title="Game"
            value={form.game}
            handleChangeText={(value) => setForm({ ...form, game: value })}
            placeholder= "Pick your game"
            otherStyles="mt-7"
            isSelect={true}
            options={gameOptions}
          />
          <Text className="text-white">More games will be added later</Text>
          <FormField 
            title="Short Bio"
            value={form.shortBio}
            placeholder= "Your short bio"
            handleChangeText={(e) => setForm({ ...form, shortBio: e })}
            otherStyles="mt-7"
          />
          <FormField 
            title="Main 1"
            value={form.main1}
            handleChangeText={(value) => setForm({ ...form, main1: value })}
            placeholder= "Choose your first main"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain1.map(champion => ({ label: champion, value: champion }))}
            image={form.main1}
            imageOrigin='champions'
          />
          <FormField 
            title="Main 2"
            value={form.main2}
            handleChangeText={(value) => setForm({ ...form, main2: value })}
            placeholder= "Choose your second main"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain2.map(champion => ({ label: champion, value: champion }))}
            image={form.main2}
            imageOrigin='champions'
          />
          <FormField 
            title="Main 3"
            value={form.main3}
            handleChangeText={(value) => setForm({ ...form, main3: value })}
            placeholder= "Choose your third main"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain3.map(champion => ({ label: champion, value: champion }))}
            image={form.main3}
            imageOrigin='champions'
          />
            <FormField 
            title="Rank"
            value={form.rank}
            handleChangeText={(value) => setForm({ ...form, rank: value })}
            placeholder= "Choose your rank"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={ranks}
            image={form.rank}
            imageOrigin='ranks'
          />
          <FormField 
            title="Role"
            value={form.role}
            handleChangeText={(value) => setForm({ ...form, role: value })}
            placeholder= "Choose your role"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={roles}
            image={form.role}
            imageOrigin='roles'
          />
          <FormField 
            title="Server"
            value={form.server}
            handleChangeText={(value) => setForm({ ...form, server: value })}
            placeholder= "Choose your role"
            otherStyles="mt-7"
            isSelect={true}
            options={servers}
          />
            <FormField 
            title="Gender you are looking for"
            value={form.genderLf}
            handleChangeText={(value) => setForm({ ...form, genderLf: value })}
            placeholder= "Chose gender you are looking for"
            otherStyles="mt-7"
            isSelect={true}
            options={genderOptions}
          />
          <FormField 
            title="Kind of Gamer you are looking for"
            value={form.kindOfGamerLf}
            handleChangeText={(value) => setForm({ ...form, kindOfGamerLf: value })}
            placeholder= "What kind of gamer are you looking for?"
            otherStyles="mt-7"
            isSelect={true}
            options={gamerOptions}
          />
          <FormField 
            title="Main 1 you are looking for"
            value={form.main1Lf}
            handleChangeText={(value) => setForm({ ...form, main1Lf: value })}
            placeholder= "Choose first main you are looking for"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain1Lf.map(champion => ({ label: champion, value: champion }))}
            image={form.main1Lf}
            imageOrigin='champions'
          />
          <FormField 
            title="Main 2 you are looking for"
            value={form.main2Lf}
            handleChangeText={(value) => setForm({ ...form, main2Lf: value })}
            placeholder= "Choose second main you are looking for"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain2Lf.map(champion => ({ label: champion, value: champion }))}
            image={form.main2Lf}
            imageOrigin='champions'
          />
          <FormField 
            title="Main 3 you are looking for"
            value={form.main3Lf}
            handleChangeText={(value) => setForm({ ...form, main3Lf: value })}
            placeholder= "Choose third main you are looking for"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={availableChampionsForMain3Lf.map(champion => ({ label: champion, value: champion }))}
            image={form.main3Lf}
            imageOrigin='champions'
          />
            <FormField 
            title="Rank you are looking for"
            value={form.rankLf}
            handleChangeText={(value) => setForm({ ...form, rankLf: value })}
            placeholder= "Choose your rank"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={ranks}
            image={form.rankLf}
            imageOrigin='ranks'
          />
          <FormField 
            title="Role you are looking for"
            value={form.roleLf}
            handleChangeText={(value) => setForm({ ...form, roleLf: value })}
            placeholder= "Choose your role"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={roles}
            image={form.roleLf}
            imageOrigin='roles'
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

export default updateProfile