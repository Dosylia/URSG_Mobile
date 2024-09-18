import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react'
import { SessionContext } from '../../context/SessionContext';
import { router } from 'expo-router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { FormField } from "../../components";
import { CustomButton } from "../../components";
import serverList from "../../constants/serverList";

const BindAccount = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [form, setForm] = useState({
    userId: sessions.userSession.userId,
    account: sessions.leagueSession.account,
    server: sessions.leagueSession.server,
    puuId: '',
    summonerName: '',
    tagLine: ''
  });

  useEffect(() => {
    if (sessions.googleSession && sessions.userSession && sessions.leagueSession && sessions.lookingforSession) {
      setForm(prevForm => ({
        ...prevForm,
      }));
    } 
  }, [sessions]);

  function submitForm() {
    if (form.account && form.server) {
      axios.post('https://ur-sg.com/bindAccount', {
        userData: JSON.stringify(form)
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(response => {
        console.log("Axios response:", {
            status: response.status,
            data: response.data,
            headers: response.headers,
            config: response.config
          });
        const data = response.data;
        if (data.status !== 'Success') {
          setErrors(data.status);
        } else {
            setForm(prevForm => ({
                ...prevForm,
                puuId: data.puuId,
                summonerName: data.summonerName,
                tagLine: data.tagLine,
              }));
          // Display the verification code and instructions
          setVerificationVisible(true);
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
      setErrors('Please fill all fields.');
    }
  }

  function verifyAccount() {
    console.log("Verifying account with data:", form);
    axios.post('https://ur-sg.com/verifyLeagueAccountPhone', {
      userData: JSON.stringify({
        userId: form.userId,
        puuId: form.puuId,
        server: form.server,
        summonerName: form.summonerName,
        tagLine: form.tagLine
      })
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => {
      const data = response.data;
      console.log("Axios response:", {
        status: response.status,
        data: response.data,
        headers: response.headers,
        config: response.config
      });
      if (data.status === 'success') {
        setSession('leagueSession', {
            server: form.server,
            account : form.account,
            sUsername: data.summonerName,
            sRank: data.rankAndTier,
            sLevel: data.summonerLevel,
            sProfileIcon: data.profileIconId
        }, () => {
            router.push("/(tabs)/profile");
          });
      } else {
        setErrors(data.message);
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
  }

  const servers = serverList.map((server) => (
    { label: server, value: server }
  ));

  const closePage = () => {
    router.push("/(tabs)/profile");
  };

  return (
    <SafeAreaView className="bg-gray-900 h-full dark:bg-whitePerso">
      <ScrollView>
      <View className="flex w-full flex-row items-center bg-gray-900 dark:bg-whitePerso">
        <View className="flex-1" />
        <TouchableOpacity onPress={closePage}>
          <Text className="text-mainred text-3xl font-extrabold">X</Text>
        </TouchableOpacity>
      </View>
        <View className="w-full justify-start h-full px-4 my-6">
          <Text className="text-2xl text-white text-semibpmd font-psemibold">
            {t('bind-league')}
          </Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
  
          {/* Render the form only if verificationVisible is false */}
          {!verificationVisible && (
            <>
              <FormField 
                title={t('account-needed')}
                value={form.account}
                placeholder={`${t('example')} : OTPYasuoEh#EUW`}
                handleChangeText={(e) => setForm({ ...form, account: e })}
                otherStyles="mt-7"
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
              <CustomButton 
                title={t('bind-account')}
                handlePress={submitForm}
                containerStyles="w-full mt-7"
              />
            </>
          )}
  
          {/* Render the verification section only if verificationVisible is true */}
          {verificationVisible && (
            <View className="mt-10">
              <Image 
                source={require("../../assets/profileicon/7.png")}
                className="w-[50px] h-[50px] mx-auto"
                resizeMode="contain"
              />
              <Text className="text-white text-center mt-5 dark:text-blackPerso">
                {t('change-picture-icon')}
              </Text>
              <CustomButton 
                title={t('verify-account')}
                handlePress={verifyAccount}
                containerStyles="w-full mt-7"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );  
}

export default BindAccount;
