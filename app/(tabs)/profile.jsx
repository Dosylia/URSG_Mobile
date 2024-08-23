import { Text, View, ScrollView } from 'react-native';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'; // Import the hook
import axios from 'axios';

import { SessionContext } from '../../context/SessionContext';
import { ProfileHeader, RiotProfileSection, LookingForSection, CustomButton, UserDataComponent } from "../../components";

const Profile = () => {
  const { sessions, setSession } = useContext(SessionContext);
  const [userData, setUserData] = useState(null);
  const friendId = sessions?.friendId;

  console.log('Friend ID:', friendId);

  useEffect(() => {
    if (friendId) {
      axios.post('https://ur-sg.com/getUserData', {
        userId: friendId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => {
          if (response.data.message === 'Success') {
            const formattedData = {
              username: response.data.user.user_username,
              gender: response.data.user.user_gender,
              age: response.data.user.user_age,
              kindOfGamer: response.data.user.user_kindOfGamer,
              game: response.data.user.user_game,
              shortBio: response.data.user.user_shortBio,
              picture: response.data.user.user_picture,
              discord: response.data.user.user_discord,
              instagram: response.data.user.user_instagram,
              twitch: response.data.user.user_twitch,
              twitter: response.data.user.user_twitter,
              main1: response.data.user.lol_main1,
              main2: response.data.user.lol_main2,
              main3: response.data.user.lol_main3,
              rank: response.data.user.lol_rank,
              role: response.data.user.lol_role,
              server: response.data.user.lol_server,
              account: response.data.user.lol_account,
              sUsername: response.data.user.lol_sUsername,
              sRank: response.data.user.lol_sRank,
              sLevel: response.data.user.lol_sLevel,
              sProfileIcon: response.data.user.lol_sProfileIcon,
              genderLf: response.data.user.lf_gender,
              kindOfGamerLf: response.data.user.lf_kindofgamer,
              gameLf: response.data.user.lf_game,
              main1Lf: response.data.user.lf_lolmain1,
              main2Lf: response.data.user.lf_lolmain2,
              main3Lf: response.data.user.lf_lolmain3,
              rankLf: response.data.user.lf_lolrank,
              roleLf: response.data.user.lf_lolrole
            };

            setUserData(formattedData);
          } else {
            console.error('Failed to fetch user data');
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [friendId]);

  // Clear the friendId when the profile screen is focused
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSession('friendId', null);
      };
    }, [])
  );

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      {!friendId && (
        <UserDataComponent sessions={sessions} onUserDataChange={setUserData} />
      )} 
      {userData && <ProfileHeader userData={userData} />}
  
      {!friendId && ( 
        <>
          <CustomButton 
            title="Bind a League of Legends account"
            handlePress={() => router.push("/(auth)/bind-account")}
            containerStyles="w-full mt-7"
          />
          <CustomButton 
            title="Add or update your social links"
            handlePress={() => router.push("/(auth)/update-social")}
            containerStyles="w-full mt-7 mb-7"
          />
        </>
       )} 
  
      <RiotProfileSection userData={userData} isProfile={true} />
      <LookingForSection userData={userData} />
    </ScrollView>
  );
};

export default Profile;
