import { ActivityIndicator, Text, View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { PanGestureHandler } from 'react-native-gesture-handler'; 
import { SessionContext } from '../../context/SessionContext';
import { ProfileHeader, UseSwipeAlgorithm } from "../../components";
import { RiotProfileSection } from "../../components";
import { UserDataComponent } from "../../components";
import { images } from "../../constants";
import { useTranslation } from 'react-i18next';

const Swiping = () => {
  const { t } = useTranslation();
  const { sessions } = useContext(SessionContext);
  const [userData, setUserData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]); 
  const [errors, setErrors] = useState(null);
  const [noMoreUsers, setNoMoreUsers] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [hasSwiped, setHasSwiped] = useState(false);

  const reshapedUserData = {
    user_id: userData?.userId,
    user_gender: userData?.gender,
    user_age: userData?.age,
    user_kindOfGamer: userData?.kindOfGamer,
    user_game: userData?.game,
    lol_server: userData?.server,
    lol_main1: userData?.main1,
    lol_main2: userData?.main2,
    lol_main3: userData?.main3,
    lol_rank: userData?.rank,
    lol_role: userData?.role,
    lf_gender: userData?.genderLf,
    lf_kindofgamer: userData?.kindOfGamerLf,
    lf_game: userData?.gameLf,
    lf_lolmain1: userData?.main1Lf,
    lf_lolmain2: userData?.main2Lf,
    lf_lolmain3: userData?.main3Lf,
    lf_lolrank: userData?.rankLf,
    lf_lolrole: userData?.roleLf,
  };

  const fetchAllUsers = async () => {
    try {
      if (sessions.userSession && sessions.userSession.userId) {
        console.log("User session found:", sessions.userSession);
  
        // First Axios Request to get all users
        const allUsersResponse = await axios.post('https://ur-sg.com/getAllUsers', {
          allUsers: 'allUsers'
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
  
        const allUsersData = allUsersResponse.data;
        if (allUsersData.message !== 'Success') {
          setErrors(allUsersData.message);
          return;
        }
  
        const allUsers = allUsersData.allUsers;
        setAllUsers(allUsers);
      } else {
        console.log("User session not yet populated");
      }
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const fetchUserMatching = async () => {
    try {
      if (sessions.userSession && sessions.userSession.userId) {
        console.log('Making request to getUserMatching');
  
        const userId = sessions.userSession.userId;
        const userMatchingResponse = await axios.post('https://ur-sg.com/getUserMatching', 
          `userId=${encodeURIComponent(userId)}`,  // Correctly format the data
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
  
        const matchingData = userMatchingResponse.data;
        console.log('Matching data:', matchingData);
        if (!matchingData.success) {
          if (matchingData.error === 'No matching users found') {
            setNoMoreUsers(true);
          }
          setErrors(matchingData.error);
          return;
        }
  
        const UserMatched = {
          username: matchingData.user.user_username,
          age: matchingData.user.user_age,
          main1: matchingData.user.lol_main1,
          main2: matchingData.user.lol_main2,
          main3: matchingData.user.lol_main3,
          rank: matchingData.user.lol_rank,
          role: matchingData.user.lol_role,
          gender: matchingData.user.user_gender,
          kindOfGamer: matchingData.user.user_kindOfGamer,
          shortBio: matchingData.user.user_shortBio,
          picture: matchingData.user.user_picture,
          userId: matchingData.user.user_id
        };
        setOtherUser(UserMatched);
        setNoMoreUsers(false); // Reset the noMoreUsers state
      } else {
        console.log("User session not yet populated");
      }
    } catch (error) {
      handleAxiosError(error);
    }
  };
  

  const handleSwipe = async (direction) => {
    setHasSwiped(true)
    if (!otherUser) return;

    const action = direction === 'right' ? 'swipe_yes' : 'swipe_no';
    try {
      await fetch('https://ur-sg.com/swipeDone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `${action}=1&senderId=${encodeURIComponent(sessions.userSession.userId)}&receiverId=${encodeURIComponent(otherUser.userId)}`
      });

      // Fetch the next user after the swipe action
      fetchUserMatching();
      setHasSwiped(false);
    } catch (error) {
      console.error("Error during swipe action:", error);
      setErrors('Error during swipe action');
    }
  };

  const onGestureEvent = (event) => {
    const { translationX } = event.nativeEvent;
    if (translationX > 100 && hasSwiped === false) {
      handleSwipe('right');
    } else if (translationX < -100 && hasSwiped === false) {
      handleSwipe('left');
    }
  };
  useEffect(() => { 
    setErrors(null);
  }, [otherUser]);

  useFocusEffect(
    useCallback(() => {
      fetchAllUsers();
      const timer = setTimeout(() => {
        fetchUserMatching();
        setIsLoading(false);
      }, 2000); 
    
      return () => clearTimeout(timer);
    }, [])
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#e74057" />
        <UserDataComponent sessions={sessions} onUserDataChange={setUserData} />
        {allUsers.length > 0 && (
          <UseSwipeAlgorithm reshapedUserData={reshapedUserData} allUsers={allUsers} />
        )}
      </View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <ScrollView className="flex-1 bg-gray-900 p-4">
        {noMoreUsers ? (
          <View className="flex-1 h-[500px] justify-center items-center bg-gray-900">
            <Text className="text-white justify-center items-center">{t('seen-all-profiles')}</Text>
            <Image source={images.sadBee} className="w-50 h-50" />
          </View>
        ) : otherUser && (
          <>
            <ProfileHeader userData={otherUser} />
            <RiotProfileSection userData={otherUser} isProfile={false} />
            <View style={styles.arrowContainer}>
            <TouchableOpacity onPress={() => handleSwipe('left')} style={styles.arrowButton}>
              <Text style={[styles.arrowText, styles.leftArrow]}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSwipe('right')} style={styles.arrowButton}>
              <Text style={[styles.arrowText, styles.rightArrow]}>{'>'}</Text>
            </TouchableOpacity>
            </View>
          </>
        )}
        {errors && <Text className="text-red-500">{errors}</Text>}
      </ScrollView>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  arrowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 50,
  },
  leftArrow: {
    color: 'red', 
  },
  rightArrow: {
    color: 'green',
  },
});

export default Swiping;
