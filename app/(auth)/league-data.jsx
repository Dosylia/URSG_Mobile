import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../context/SessionContext';
import React, { useState, useContext, useEffect } from 'react'
import { Redirect, router } from 'expo-router';
import { SessionContext } from '../../context/SessionContext';

import { images } from "../../constants";
import { FormField } from "../../components";
import { CustomButton } from "../../components";
import championList from  "../../constants/championList";
import roleList from "../../constants/roleList";
import rankList from "../../constants/rankList";
import serverList from "../../constants/serverList";

const LeagueData = () => {
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [form, setForm] = useState({
    userId: '',
    main1: '',
    main2: '',
    main3: '',
    rank: 'Bronze',
    role: 'AD Carry',
    server: 'Europe West'
  })

  useEffect(() => {
    if (sessions.userSession && sessions.googleSession.userId) {
      console.log("User session found:", sessions.userSession);
      setForm(prevForm => ({
        ...prevForm,
        userId: sessions.userSession.userId,
        // Optionally, you can prepopulate other fields if necessary
      }));
    } else {
      console.log("Google session not yet populated");
    }
  }, [sessions.userSession]);

  // const { setSession } = useContext(SessionContext);

  function submitForm() { // Add google data from Session created in previous step
    // Check if all form fields are filled
    if (
      form.main1 &&
      form.main2 &&
      form.main3 &&
      form.rank &&
      form.role &&
      form.server && 
      form.main1 !== form.main2 &&
      form.main1 !== form.main3 &&
      form.main2 !== form.main3
    ) {
      // Send data to the PHP folder
      axios.post('https://ur-sg.com/createLeagueUserPhone', {
        leagueData: JSON.stringify(form)
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
          setSession('leagueSession', data);
          router.push("/league-data");
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } else {
      // Display an error message or handle the case when not all form fields are filled
      setErrors('Please fill all fields and ensure main champions are unique.');
    }
  }

  const champions = championList?.filter(champion => (
    champion !== form.main1 && champion !== form.main2 && champion !== form.main3
  )).map(champion => (
    { label: champion, value: champion }
  ));

  const roles = roleList.map((role) => (
    { label: role, value: role }
  ));

  const ranks = rankList.map((rank) => (
    { label: rank, value: rank }
  ));

  const servers = serverList.map((server) => (
    { label: server, value: server }
  ));


  return (
    <SafeAreaView className="bg-darkgrey h-full">
      <ScrollView>
        <View className="w-full justify-start h-full px-4 my-6">
          <Image 
            source={images.logoWhite}
            className="w-[100px] h-[50px]"
            resizeMode='contain'
          />
          <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">League of Legends informations</Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
          <FormField 
            title="Main 1"
            value={form.main1}
            handleChangeText={(value) => setForm({ ...form, main1: value })}
            placeholder= "Choose your first main"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={champions}
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
            options={champions}
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
            options={champions}
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
          <CustomButton 
             title="About your interests"
             handlePress={() => router.push("/lookingfor-data")} // Handle sending data to database and router.push("/lookingfor-data")
             containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LeagueData