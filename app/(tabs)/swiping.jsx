import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PanGestureHandler } from 'react-native-gesture-handler'; 
import { SessionContext } from '../../context/SessionContext';
import { ProfileHeader } from "../../components";
import { RiotProfileSection } from "../../components";
import { UserDataComponent } from "../../components";

const Swiping = () => {
  const { sessions } = useContext(SessionContext);
  const [userData, setUserData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [errors, setErrors] = useState(null);
  const [noMoreUsers, setNoMoreUsers] = useState(false); 

  const fetchUsers = async () => {
    try {
      if (sessions.userSession && sessions.userSession.userId) {
        console.log("User session found:", sessions.userSession);

        // First Axios Request
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

        // Second Axios Request (Fixing data format)
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
        // console.log('Received response from getUserMatching:', userMatchingResponse);
        const matchingData = userMatchingResponse.data;
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
          userId: matchingData.user.user_id // Make sure to include the userId for the swipe request
        };
        setOtherUser(UserMatched);
        setNoMoreUsers(false); // Reset the noMoreUsers state
      } else {
        console.log("User session not yet populated");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error:", error.message);
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
        console.error("Error:", error);
      }
      setErrors('Error fetching data');
    }
  };

  const handleSwipe = async (direction) => {
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
      fetchUsers();
    } catch (error) {
      console.error("Error during swipe action:", error);
      setErrors('Error during swipe action');
    }
  };

  const onGestureEvent = (event) => {
    const { translationX } = event.nativeEvent;
    if (translationX > 100) {
      handleSwipe('right');
    } else if (translationX < -100) {
      handleSwipe('left');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sessions.userSession]);

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <ScrollView className="flex-1 bg-gray-900 p-4">
        <UserDataComponent sessions={sessions} onUserDataChange={setUserData} />
        {noMoreUsers ? (
          <Text className="text-white">You have seen all available profiles.</Text>
        ) : otherUser ? (
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
        ) : (
          <Text className="text-white">Loading...</Text>
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