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
import axios from 'axios';


const Settings = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { sessions, setSession } = useContext(SessionContext);
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [visibleMode, setVisibleMode] = useState(false);
  const [visibleFilter, setVisibleFilter] = useState(false);

  const iconLanguage = colorScheme === 'dark' ? icons.earthDark : icons.earth;
  const iconMode = colorScheme === 'dark' ? icons.moon : icons.sun;
  const iconFilter = colorScheme === 'dark' ? icons.filterDark : icons.filter;
  
  const closePage = () => {
    const { userSession, leagueSession, valorantSession, lookingforSession, googleSession } = sessions;
  
    if (userSession.userId) {
      if ((leagueSession.role && lookingforSession.roleLf) || (valorantSession.role && lookingforSession.valroleLf)) {
        router.push("/(tabs)/profile");
  
      } else if ((leagueSession.role || valorantSession.role) && (!lookingforSession.roleLf || !lookingforSession.valroleLf)) {
        router.push("/lookingfor-data");

      } else if (valorantSession.role && !leagueSession.role) {
        router.push("/valorant-data");
  
      } else if (!leagueSession.role && valorantSession.role) {
        router.push("/league-data");
      }
      
    } else if (googleSession.email && !userSession.userId) {
      router.push("/basic-info");
  
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

  const SwitchChatFilter = async (mode) => {
    const dataToSend = {
        userId: sessions.userSession.userId,
        status: mode,
    };

    // Create a JSON string of the data
    const jsonData = JSON.stringify(dataToSend);

    try {
        const response = await axios.post('https://ur-sg.com/chatFilterSwitch', `param=${encodeURIComponent(jsonData)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log('Success:', response.data);

        if (response.data.message === "Success") {
            setVisibleFilter(false); 

            // Directly toggle based on incoming mode
            const newChatFilterStatus = mode === 1 ? 1 : 0;
            setSession('userSession', {
                ...sessions.userSession,
                hasChatFilter: newChatFilterStatus,
            });
        } else {
            setVisibleFilter(false); 
            console.log('Error:', response.data.message); 
        }
    } catch (error) {
        console.error('Error:', error); 
    }
}

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

      {/* Modal for chat filter */}
      <Modal visible={visibleFilter} onRequestClose={() => setVisibleFilter(false)}>
        <View className="flex w-full flex-row items-center bg-gray-900 dark:bg-whitePerso">
          <View className="flex-1" />
          <TouchableOpacity onPress={() => setVisibleFilter(false)}>
            <Text className="text-mainred px-6 text-2xl font-extrabold">X</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 bg-gray-900 p-3 dark:bg-whitePerso">
          <View className="rounded-lg p-2">
            {/* Option for Chat Filter */}
            <TouchableOpacity
              onPress={() => {
                SwitchChatFilter(1);
              }}
              className="p-4"
            >
              <Text className="text-white text-xl dark:text-blackPerso">{t('filter-on')}</Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-600 dark:bg-gray-400 my-2" />
            <TouchableOpacity
              onPress={() => {
                SwitchChatFilter(0);
              }}
              className="p-4"
            >
              <Text className="text-white text-xl dark:text-blackPerso">{t('filter-off')}</Text>
            </TouchableOpacity>
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
            <Text className="text-mainred px-6 text-3xl font-extrabold">X</Text>
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

          {sessions.userSession.userId && (
          <TouchableOpacity onPress={() => setVisibleFilter(true)} className="flex-row items-center mb-5">
            <Image 
              source={iconFilter}
              className="w-6 h-6 mr-10"
            />
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold dark:text-blackPerso">
                {t('filter')}
              </Text>
              <Text className="text-gray-300 text-base mt-1 dark:text-blackPerso">
                {t('filter-change')}
              </Text>
            </View>
          </TouchableOpacity>
          )} 


        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Settings;
