import { View, Text, ScrollView, Image, TouchableOpacity, Modal, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react'
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n, { languageResources } from '../../services/i18next';
import languagesList from '../../services/languagesList.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { icons } from "../../constants";
import { SessionContext } from '../../context/SessionContext';
import { useColorScheme } from 'nativewind';


const Settings = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { sessions } = useContext(SessionContext);
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [visibleMode, setVisibleMode] = useState(false);

  const iconLanguage = colorScheme === 'dark' ? icons.earthDark : icons.earth;
  const iconMode = colorScheme === 'dark' ? icons.moon : icons.sun;
  
  const closePage = () => {
    if (sessions.userSession.userId) {
      router.push("/(tabs)/profile");
    } else {
      router.push("/");
    }
  };

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('user-language', lng);
    setVisible(false);
  };

  const saveMode = async (mode) => { 
    try {
      await AsyncStorage.setItem('mode', mode);
    } catch (error) {
      console.error("Error saving mode:", error);
    }
  };

  return (
    <SafeAreaView className="bg-gray-900 h-full dark:bg-whitePerso">
      <Modal visible={visible} onRequestClose={() => setVisible(false)}>
        <View className="flex w-full flex-row items-center bg-gray-900 dark:bg-whitePerso">
          <View className="flex-1" />
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text className="text-mainred px-6 text-2xl font-extrabold">X</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 bg-gray-900 p-3 dark:bg-whitePerso">
          <View className="rounded-lg p-2">
            <FlatList
              data={Object.keys(languageResources)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <>
                  <TouchableOpacity
                    onPress={() => changeLanguage(item)}
                    className="p-4"
                  >
                    <Text className="text-white text-xl dark:text-blackPerso">
                      {languagesList[item].nativeName}
                    </Text>
                  </TouchableOpacity>
                  <View className="h-px bg-gray-600 dark:bg-gray-400 my-2" />
                </>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal for switching modes */}
      <Modal visible={visibleMode} onRequestClose={() => setVisibleMode(false)}>
        <View className={`flex w-full flex-row items-center bg-gray-900 dark:bg-whitePerso`}>
          <View className="flex-1" />
          <TouchableOpacity onPress={() => setVisibleMode(false)}>
            <Text className={`text-mainred px-6 text-2xl font-extrabold`}>X</Text>
          </TouchableOpacity>
        </View>
        <View className={`flex-1 bg-gray-900 p-3 dark:bg-whitePerso`}>
          <View className="rounded-lg p-2">
            <TouchableOpacity
              onPress={() => {
                setVisibleMode(false);
                if (colorScheme === 'light') {
                toggleColorScheme('dark');  
                saveMode('dark');  
                }
              }}
              className="p-4"
            >
              <Text className={`text-white text-xl dark:text-black`}>
                {t('light-mode')}
              </Text>
            </TouchableOpacity>
            <View className={`h-px bg-gray-700 my-2`} />
            <TouchableOpacity
              onPress={() => {
                setVisibleMode(false); 
                if (colorScheme === 'dark') {
                  toggleColorScheme('light');  
                  saveMode('light');  
                  }
              }}
              className="p-4"
            >
              <Text className={`text-white text-xl dark:text-blackPerso`}>
                {t('dark-mode')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <View className="flex w-full flex-row items-center bg-gray-900 dark:bg-whitePerso">
          <View className="flex-1" />
          <TouchableOpacity onPress={closePage}>
            <Text className="text-mainred px-6 text-2xl font-extrabold">X</Text>
          </TouchableOpacity>
        </View>
        <View className="w-full justify-start h-full px-4 my-6">
          <Text className="text-2xl text-white mt-5 mb-5 font-semibold dark:text-blackPerso">{t('general-settings')}</Text>
          <TouchableOpacity onPress={() => setVisible(true)} className="flex-row items-center mb-5">
            <Image 
              source={iconLanguage}
              className="w-6 h-6 mr-10"
            />
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold dark:text-blackPerso">
                {t('language')}
              </Text>
              <Text className="text-gray-300 text-base mt-1 dark:text-blackPerso">
                {t('language-change')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Mode switching */}
          <TouchableOpacity onPress={() => setVisibleMode(true)} className="flex-row items-center mb-5">
            <Image 
              source={iconMode}
              className="w-6 h-6 mr-10"
            />
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold dark:text-blackPerso">
                {t('mode')}
              </Text>
              <Text className="text-gray-300 text-base mt-1 dark:text-blackPerso">
                {t('mode-change')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Settings;
