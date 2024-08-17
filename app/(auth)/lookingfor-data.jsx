import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../context/SessionContext';
import React, { useState, useContext, useEffect } from 'react'
import { Redirect, router } from 'expo-router';
import axios from 'axios';

import { images } from "../../constants";
import { FormField } from "../../components";
import { CustomButton } from "../../components";
import championList from  "../../constants/championList";
import roleList from "../../constants/roleList";
import rankList from "../../constants/rankList";

const LookingForData = () => {
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
          if (data.message) {
            setErrors(data.message);
          } else {
          // Store session ID if needed
          setSession('lookingforSession', data);
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
    { label: 'Chill / Normal games', value: 'Chill' },
    { label: 'Competition / Ranked', value: 'Competition' },
    { label: 'Competition/Ranked and chill', value: 'Competition and Chill' },
  ];

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Non-binary', value: 'Non binary' },
    { label: 'Male and Female', value: 'Male and Female' },
    { label: 'All', value: 'All' },
  ];


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

  return (
    <SafeAreaView className="bg-darkgrey h-full">
      <ScrollView>
        <View className="w-full justify-start h-full px-4 my-6">
          <Image 
            source={images.logoWhite}
            className="w-[100px] h-[50px]"
            resizeMode='contain'
          />
          <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">Your interests</Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
          <FormField 
            title="Gender you are looking for"
            value={form.gender}
            handleChangeText={(value) => setForm({ ...form, gender: value })}
            placeholder= "Chose gender you are looking for"
            otherStyles="mt-7"
            isSelect={true}
            options={genderOptions}
          />
          <FormField 
            title="Kind of Gamer you are looking for"
            value={form.kindOfGamer}
            handleChangeText={(value) => setForm({ ...form, kindOfGamer: value })}
            placeholder= "What kind of gamer are you looking for?"
            otherStyles="mt-7"
            isSelect={true}
            options={gamerOptions}
          />
          <FormField 
            title="Main 1 you are looking for"
            value={form.main1}
            handleChangeText={(value) => setForm({ ...form, main1: value })}
            placeholder= "Choose first main you are looking for"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={champions}
            image={form.main1}
            imageOrigin='champions'
          />
          <FormField 
            title="Main 2 you are looking for"
            value={form.main2}
            handleChangeText={(value) => setForm({ ...form, main2: value })}
            placeholder= "Choose second main you are looking for"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={champions}
            image={form.main2}
            imageOrigin='champions'
          />
          <FormField 
            title="Main 3 you are looking for"
            value={form.main3}
            handleChangeText={(value) => setForm({ ...form, main3: value })}
            placeholder= "Choose third main you are looking for"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={champions}
            image={form.main3}
            imageOrigin='champions'
          />
            <FormField 
            title="Rank you are looking for"
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
            title="Role you are looking for"
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
          <CustomButton 
             title="About your interests"
             handlePress={submitForm} // Handle sending data to database and router.push("/swiping")
             containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LookingForData