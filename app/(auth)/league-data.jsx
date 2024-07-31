import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../context/SessionContext';
import React, { useState, useContext } from 'react'
import { Redirect, router } from 'expo-router';

import { images } from "../../constants";
import { FormField } from "../../components";
import { CustomButton } from "../../components";
import championList from  "../../constants/championList"

const LeagueData = () => {
  const [form, setForm] = useState({
    main1: '',
    main2: '',
    main3: ''
  })

  // const { setSession } = useContext(SessionContext);

  function submitForm() { // Add google data from Session created in previous step
    // Check if all form fields are filled
    if (
      form.main1 &&
      form.main2 &&
      form.main3 
    ) {
      // Send data to the PHP folder
      fetch('https://ur-sg.com/createLeagueUserPhone', {
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
      console.log('Please fill in all form fields');
    }
  }

  const champions = championList.map((champion) => (
    { label: champion, value: champion }
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
          <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">Basic informations</Text>
          <FormField 
            title="Main 1"
            value={form.main1}
            handleChangeText={(value) => setForm({ ...form, main1: value })}
            placeholder= "Chose your first main"
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
            placeholder= "Chose your second main"
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
            placeholder= "Chose your third main"
            otherStyles="mt-7"
            isSelect={true}
            hasImage={true}
            options={champions}
            image={form.main3}
            imageOrigin='champions'
          />
          <CustomButton 
             title="About your interests"
             handlePress={() => submitForm()} // Handle sending data to database and router.push("/league-data")
             containerStyles ="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LeagueData