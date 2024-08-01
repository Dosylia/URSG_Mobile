import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext } from 'react'
import { SessionContext } from '../../context/SessionContext';
import { Redirect, router } from 'expo-router';

import { images } from "../../constants";
import { FormField } from "../../components";
import { CustomButton } from "../../components";

const BasicInfo = () => {
  const [errors, setErrors] = useState('');
  const [form, setForm] = useState({
    username: '',
    gender: '',
    age: '',
    kindOfGamer: '',
    game: '',
    shortBio:''

  })

  // const { setSession } = useContext(SessionContext);

  function submitForm() { // Add google data from Session created in previous step
    // Check if all form fields are filled
    if (
      form.username &&
      form.gender &&
      form.age &&
      form.kindOfGamer &&
      form.game &&
      form.shortBio
    ) {
      // Send data to the PHP folder
      fetch('https://ur-sg.com/createUserPhone', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          // Handle the response from the PHP server
          console.log(data);
          // Store session ID if needed
          setSession('userSession', data);
          router.push("/league-data");
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } else {
      // Display an error message or handle the case when not all form fields are filled
      setErrors('Please fill all fields.');
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
  ];

  const gameOptions = [
    { label: 'League of Legends', value: 'league-of-legends' },
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
          <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">Basic informations</Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
          <FormField 
            title="Username"
            value={form.username}
            placeholder= "Your username"
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />
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
          <CustomButton 
             title="About your game"
             handlePress={() => router.push("/league-data")} // Handle sending data to database and router.push("/league-data")
             containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default BasicInfo