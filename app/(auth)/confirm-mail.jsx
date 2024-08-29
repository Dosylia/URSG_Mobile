import { View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../context/SessionContext';
import React, { useState, useContext, useEffect } from 'react'
import { Redirect, router } from 'expo-router';

import { images } from "../../constants";
import { CustomButton } from "../../components";

const confirmMail = () => {
    const [errors, setErrors] = useState('');
      // const { setSession } = useContext(SessionContext);

    function sendMailPhone() {
        // Get mail from sessionId and send it to the PHP folder
        fetch('https://ur-sg.com/newMailPhone', {
            method: 'POST',
            body: JSON.stringify(email),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    setErrors(data.message);
                } else {
                    router.push("/basic-info");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
  return (
    <SafeAreaView className="bg-gray-900 h-full">
      <ScrollView>
        <View className="w-full justify-start h-full px-4 my-6">
            <Image 
                source={images.logoWhite}
                className="w-[100px] h-[50px]"
                resizeMode='contain'
            />
            <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">Comfirm your email</Text>
            {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
            <Text className="text-center text-white mt-5 font-pregular mb-2">
                You received a mail, please comfirm your email using it.
            </Text>
            <Text className="text-center text-white mt-5 font-pregular mb-2">
                If you lost that email, get a new one by clicking the button below. And if you do not receive any contact an administrator.
            </Text>
            <CustomButton 
                title="Send a new mail"
                handlePress={() => router.push("/basic-info")} // Gotta send mail VIA post request.
                containerStyles ="w-fit mt-3 items-center"
            />
            <Text className="text-center text-white mt-8 font-pregular mb-2">
                If your mail has been verified, please click the button below.
            </Text>
            <CustomButton 
                title="Once email verified, click here"
                handlePress={() => router.push("/basic-info")} // Handle sending data to database and router.push("/basic-info")
                containerStyles ="w-full mt-3"
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default confirmMail