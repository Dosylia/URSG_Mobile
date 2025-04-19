import { ActivityIndicator, Text, View, StyleSheet, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { PanGestureHandler, GestureDetector, Gesture, ScrollView } from 'react-native-gesture-handler'; 
import { SessionContext } from '../../context/SessionContext';
import { ProfileHeader } from "../../components";
import { RiotProfileSection, CustomButton, UserDataComponent, BonusPicture } from "../../components";
import { images, icons } from "../../constants";
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

const Swiping = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const { sessions, setSession } = useContext(SessionContext);
  const [userData, setUserData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]); 
  const [errors, setErrors] = useState(null);
  const [noMoreUsers, setNoMoreUsers] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [hasSwiped, setHasSwiped] = useState(false);
  const activeIndex = useSharedValue(0);
  const translationX = useSharedValue(0);
  const screenWidth = Dimensions.get('screen').width;
  const hasFetched = useRef(false);

  // const reshapedUserData = {
  //   user_id: userData?.userId,
  //   user_gender: userData?.gender,
  //   user_age: userData?.age,
  //   user_kindOfGamer: userData?.kindOfGamer,
  //   user_game: userData?.game,
  //   lol_server: userData?.server,
  //   lol_main1: userData?.main1,
  //   lol_main2: userData?.main2,
  //   lol_main3: userData?.main3,
  //   lol_rank: userData?.rank,
  //   lol_role: userData?.role,
  //   valorant_server: userData?.valserver,
  //   valorant_main1: userData?.valmain1,
  //   valorant_main2: userData?.valmain2,
  //   valorant_main3: userData?.valmain3,
  //   valorant_rank: userData?.valrank,
  //   valorant_role: userData?.valrole,
  //   lf_gender: userData?.genderLf,
  //   lf_kindofgamer: userData?.kindOfGamerLf,
  //   lf_game: userData?.gameLf,
  //   lf_lolmain1: userData?.main1Lf,
  //   lf_lolmain2: userData?.main2Lf,
  //   lf_lolmain3: userData?.main3Lf,
  //   lf_lolrank: userData?.rankLf,
  //   lf_lolrole: userData?.roleLf,
  //   lf_valmain1: userData?.valmain1Lf,
  //   lf_valmain2: userData?.valmain2Lf,
  //   lf_valmain3: userData?.valmain3Lf,
  //   lf_valrank: userData?.valrankLf,
  //   lf_valrole: userData?.valroleLf,
  // };

  // const fetchAllUsers = async () => {
  // const adminToken = process.env.EXPO_ADMIN_TOKEN;
  //   try {
  //     if (sessions.userSession && sessions.userSession.userId) {
  //       console.log("User session found:", sessions.userSession);
  
  //       // First Axios Request to get all users
  //       const allUsersResponse = await axios.post('https://ur-sg.com/getAllUsersPhone', {
  //         allUsers: 'allUsers'
  //       }, {
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //           'Authorization': `Bearer ${adminToken}`,
  //         }
  //       });
  
  //       const allUsersData = allUsersResponse.data;
  //       if (allUsersData.message !== 'Success') {
  //         setErrors(allUsersData.message);
  //         return;
  //       }
  
  //       const allUsers = allUsersData.allUsers;
  //       setAllUsers(allUsers);
  //     } else {
  //       console.log("User session not yet populated");
  //     }
  //   } catch (error) {
  //     handleAxiosError(error);
  //   }
  // };

  const fetchUserMatching = async () => {
    try {
      if (sessions.userSession && sessions.userSession.userId) {
        console.log('Making request to getUserMatching');
  
        const userId = sessions.userSession.userId;
        const userMatchingResponse = await axios.post('https://ur-sg.com/getUserMatching', 
          `userId=${encodeURIComponent(userId)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
  
        const matchingData = userMatchingResponse.data;
        // console.log('Matching data:', matchingData);
        if (!matchingData.success) {
          setNoMoreUsers(true);
          setErrors(matchingData.error);
          return;
        }
        
        let UserMatched = {};
        const user = matchingData.user;
        if (user.user_game === 'League of Legends') {
          UserMatched = {
            username: matchingData.user.user_username,
            game: matchingData.user.user_game,
            age: matchingData.user.user_age,
            isVip: matchingData.user.user_isVip,
            main1: matchingData.user.lol_main1,
            main2: matchingData.user.lol_main2,
            main3: matchingData.user.lol_main3,
            rank: matchingData.user.lol_rank,
            role: matchingData.user.lol_role,
            server: matchingData.user.lol_server,
            gender: matchingData.user.user_gender,
            kindOfGamer: matchingData.user.user_kindOfGamer,
            shortBio: matchingData.user.user_shortBio,
            picture: matchingData.user.user_picture,
            bonusPicture: matchingData.user.user_bonusPicture,
            userId: matchingData.user.user_id,
            account : matchingData.user.lol_account,
            sProfileIcon : matchingData.user.lol_sProfileIcon,
            sRank : matchingData.user.lol_sRank,
            sLevel : matchingData.user.lol_sLevel,
            sUsername : matchingData.user.lol_sUsername
          };
        } else {
          UserMatched = {
            username: matchingData.user.user_username,
            game: matchingData.user.user_game,
            age: matchingData.user.user_age,
            isVip: matchingData.user.user_isVip,
            valmain1: matchingData.user.valorant_main1,
            valmain2: matchingData.user.valorant_main2,
            valmain3: matchingData.user.valorant_main3,
            valrank: matchingData.user.valorant_rank,
            valrole: matchingData.user.valorant_role,
            valserver: matchingData.user.valorant_server,
            gender: matchingData.user.user_gender,
            kindOfGamer: matchingData.user.user_kindOfGamer,
            shortBio: matchingData.user.user_shortBio,
            picture: matchingData.user.user_picture,
            bonusPicture: matchingData.user.user_bonusPicture,
            userId: matchingData.user.user_id
          };
        }

        setOtherUser(UserMatched);
        setIsLoading(false);
        setHasSwiped(false);
        setNoMoreUsers(false);
      } else {
        console.log("User session not yet populated");
      }
    } catch (error) {
      console.log('Error during fetchUserMatching:', error);
    }
  };
  

  const handleSwipe = async (direction) => {
    if (!otherUser) return;
  
    const action = direction === 'right' ? 'swipe_yes' : 'swipe_no';
    try {
      setIsLoading(true);  // Trigger loading state
  
      await fetch('https://ur-sg.com/swipeDonePhone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
        },
        body: `${action}=1&senderId=${encodeURIComponent(sessions.userSession.userId)}&receiverId=${encodeURIComponent(otherUser.userId)}`
      });
  
      runOnJS(() => {
        setOtherUser(null);
        setTimeout(() => {
          fetchUserMatching();
          translationX.value = 0;
        }, 500);
      })();
  
    } catch (error) {
      console.error("Error during swipe action:", error);
      setErrors('Error during swipe action');
    }
  };


  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translationX.value,
      },
      {
        rotateZ: `${interpolate(
          translationX.value,
          [-screenWidth / 2, 0, screenWidth / 2],
          [-15, 0, 15]
        )}deg`,
      },
    ],
  }));

  const gesture = Gesture.Pan()
  .activeOffsetX([-10, 10]) // Activates when horizontal movement exceeds 10 points
  .onChange((event) => {
    translationX.value = event.translationX;
    
    if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
      translationX.value = event.translationX;
    } else {
      // Vertical movement is allowed to scroll
    }
  })
  .onEnd((event) => {
    const swipeThreshold = 100;
    const velocityThreshold = 100;

    if (Math.abs(event.translationX) > swipeThreshold || Math.abs(event.velocityX) > velocityThreshold) {
      translationX.value = withSpring(Math.sign(event.translationX) * 500, {
        velocity: event.velocityX,
      });
      runOnJS(handleSwipe)(event.translationX > 0 ? 'right' : 'left');
    } else {
      translationX.value = withSpring(0);
    }
  });


  useEffect(() => { 
    setErrors(null);
  }, [otherUser]);

  useEffect(() => {
    if (!hasFetched.current) {
      const timer = setTimeout(() => {
        fetchUserMatching();
      }, 500);

      hasFetched.current = true; 

      return () => clearTimeout(timer); 
    }
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 dark:bg-whitePerso">
        <ActivityIndicator size="large" color="#e74057" />
        <UserDataComponent sessions={sessions} onUserDataChange={setUserData} />
      </View>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-gray-900 p-4 dark:bg-whitePerso">
        {noMoreUsers ? (
          <View className="flex-1 h-[500px] justify-center items-center bg-gray-900 dark:bg-whitePerso">
            <Text className="text-white dark:text-blackPerso justify-center items-center mb-3 text-xl">{t('seen-all-profiles')}</Text>
            <Image source={images.sadBee} className="w-50 h-50" />
            <CustomButton
              title={t('update-game')}
              handlePress={() => router.push('/(auth)/update-profile')}
              containerStyles="w-full mt-7"
            />
          </View>
        ) : otherUser && (
          <>
            <Animated.View style={[animatedStyle]}>
              <ProfileHeader userData={otherUser} />
              {otherUser?.bonusPicture && otherUser.bonusPicture !== "[]" && JSON.parse(otherUser.bonusPicture).length > 0 && (
                <BonusPicture userData={otherUser} isProfile={false} />
              )}
              <RiotProfileSection userData={otherUser} isProfile={false} />
            </Animated.View>
            <View style={styles.arrowContainer}>
              <TouchableOpacity  
              onPress={() => {
              if (!hasSwiped) {
                setHasSwiped(true);
                handleSwipe('left');
                }
              }}  
              style={styles.arrowButton}>
                <Image
                source={icons.leftArrowSwipe}
                className="w-8 h-8 mr-5"
                />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-white dark:text-blackPerso">Swipe</Text>
              <TouchableOpacity  
              onPress={() => {
              if (!hasSwiped) {
                setHasSwiped(true);
                handleSwipe('right');
                }
              }}  
              style={styles.arrowButton}>
                <Image
                source={icons.rightArrowSwipe}
                className="w-8 h-8 ml-5"
                />
              </TouchableOpacity>
            </View>
          </>
        )}
        {/* {errors && <Text className="text-red-500">{errors}</Text>} */}
      </ScrollView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  arrowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  arrowButton: {
    padding: 10,
  }
});

export default Swiping;
