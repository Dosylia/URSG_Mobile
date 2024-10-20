import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { router } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { SessionContext } from '../../context/SessionContext';
import { ProfileHeader, RiotProfileSection, LookingForSection, CustomButton, UserDataComponent } from "../../components";
import { icons } from "../../constants";
import { useTranslation } from 'react-i18next';
import { useFriendList } from '../../context/FriendListContext'; 

const Profile = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [userData, setUserData] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const friendId = sessions?.friendId;
  const { refreshFriendList } = useFriendList();

  const getFriendRequest = async () => { 
    const { userId } = sessions.userSession;
    axios.post('https://ur-sg.com/getFriendRequestPhone', new URLSearchParams({ userId }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(response => {
      const data = response.data;
      if (data.message !== 'Success') {
        setErrors(data.message);
      } else {
        setFriendRequests(data.friendRequest || []); 
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
      }
    });
  };

  const handleAcceptRequest = async (friendId, frId) => {
    const { userId } = sessions.userSession;
    try {
      const response = await axios.post('https://ur-sg.com/acceptFriendRequestPhone', new URLSearchParams({ friendId, frId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (response.data.message === 'Success') {
        console.log('Friend request accepted:', response.data.message);
        refreshFriendList(userId);
        setFriendRequests(prevRequests => {
          console.log('Previous requests:', prevRequests);
          const updatedRequests = prevRequests.filter(request => request.fr_id !== response.data.fr_id);
          console.log('Updated requests:', updatedRequests);
          return updatedRequests;
        });
      } else {
        console.error('Failed to accept friend request:', response.data.message);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRefuseRequest = async (friendId, frId) => {
    try {
      const response = await axios.post('https://ur-sg.com/refuseFriendRequestPhone', new URLSearchParams({ friendId, frId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.success && response.data.message === 'Success') {
        console.log('Friend request refused:', response.data.message);
        setFriendRequests(prevRequests => {
          console.log('Previous requests:', prevRequests);
          const updatedRequests = prevRequests.filter(request => request.fr_id !== response.data.fr_id); // Use fr_id from response
          console.log('Updated requests:', updatedRequests);
          return updatedRequests;
        });
      } else {
        console.error('Failed to refuse friend request:', response.data.message);
      }
    } catch (error) {
      console.error('Error refusing friend request:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getFriendRequest();
      const interval = setInterval(() => {
        getFriendRequest();
      }, 20000);

      return () => {
        clearInterval(interval);
      };
    }, [])
  );

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
            if (response.data.user.user_game === "League of Legends") {
              const formattedData = {
                userId : response.data.user.user_id,
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
                isVip: response.data.user.user_isVip,
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
              const formattedData = {
                userId : response.data.user.user_id,
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
                isVip: response.data.user.user_isVip,
                valmain1: response.data.user.valorant_main1,
                valmain2: response.data.user.valorant_main2,
                valmain3: response.data.user.valorant_main3,
                valrank: response.data.user.valorant_rank,
                valrole: response.data.user.valorant_role,
                genderLf: response.data.user.lf_gender,
                kindOfGamerLf: response.data.user.lf_kindofgamer,
                gameLf: response.data.user.lf_game,
                valmain1Lf: response.data.user.lf_valmain1,
                valmain2Lf: response.data.user.lf_valmain2,
                valmain3Lf: response.data.user.lf_valmain3,
                valrankLf: response.data.user.lf_valrank,
                valroleLf: response.data.user.lf_valrole
              };

              setUserData(formattedData);
            }
          } else {
            console.error('Failed to fetch user data');
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [friendId]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSession('friendId', null);
      };
    }, [])
  );

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('Logged out');
      setSession('reset');
      router.replace("/");
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileUpdate = () => {
    router.push("/(auth)/settings");
  };

  // function bindAccount() {
  //   const clientId = process.env.EXO_RIOT_CLIENT_ID;

  //   axios.post(`https://auth.riotgames.com/authorize?redirect_uri=https://ur-sg.com/riotAccountPhone&client_id=${clientId}&response_type=code&scope=openid`, {
  //   }, {
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     }
  //   })
  //     .then(response => {
  //       if (response.data.message === 'Success') {
  //         bindAccountCode(response.data.code);
  //       } else {
  //         console.error('Failed to fetch user data');
  //       }
  //     })
  //     .catch(error => console.error('Error fetching user data:', error));
  // }

  // function bindAccountCode(code) {
  //   const dataToSend = {
  //     code: code,
  //     userId : sessions.userSession.userId
  //   }
  //   axios.post('https://ur-sg.com/RiotCodePhone', {
  //     dataToSend: JSON.stringify(dataToSend)
  //   }, {
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     }
  //   })
  //     .then(response => {
  //       if (response.data.message === 'Success') {
  //         console.log('Riot account binded');
  //       } else {
  //         console.error('Failed to bind Riot account');
  //       }
  //     })
  //     .catch(error => console.error('Error binding Riot account:', error));
  // }

  const redirectToProfile = (friendId) => {
    setSession('friendId', friendId);
    router.push(`/profile`);
  };

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4 dark:bg-whitePerso">
      <View className="flex w-full flex-row justify-between items-center bg-gray-900 dark:bg-whitePerso">
        <TouchableOpacity onPress={handleProfileUpdate}>
          <Image
            source={icons.gear}
            resizeMode="contain"
            className="w-6 h-6"
            style={{ transform: [{ rotateY: '180deg' }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Image
            source={icons.logout}
            resizeMode="contain"
            className="w-6 h-6"
          />
        </TouchableOpacity>
      </View>
      {/* Rest of your component code */}
      {!friendId && (
        <UserDataComponent sessions={sessions} onUserDataChange={setUserData} />
      )} 
      {userData && <ProfileHeader userData={userData} isProfile={true}/>}

      {friendId && (
        <CustomButton 
        title={t('return-your-profile')}
        handlePress={() => {router.push("/profile"); setSession('friendId', null)}}
        containerStyles="w-full mt-7 mb-7"
        />
      )}
      {/* Friend Requests */}
      {!friendId && friendRequests.length > 0 && (
        <View>
          {friendRequests.map((request) => (
            <View key={request.user_id} className="flex-row justify-between items-center mb-2 p-3 bg-gray-800 rounded dark:bg-whitePerso mt-7">
              <TouchableOpacity
                onPress={() => redirectToProfile(request.user_id)}
              >
              <Text className="text-white dark:text-blackPerso border-b-4 border-mainred">{request.user_username}</Text>
              </TouchableOpacity>
              <View className="flex-row">
                <TouchableOpacity 
                  onPress={() => handleAcceptRequest(request.user_id, request.fr_id)} 
                  className="bg-mainred p-2 rounded mr-2"
                >
                  <Text className="text-white">{t('accept')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleRefuseRequest(request.user_id, request.fr_id)} 
                  className="bg-gray-600 p-2 rounded"
                >
                  <Text className="text-white">{t('refuse')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
  
      {!friendId && ( 
        <>
          <CustomButton 
            title={t('update-profile')}
            handlePress={() => router.push("/(auth)/update-profile")}
            containerStyles="w-full mt-7"
          />
          <CustomButton 
            title={t('bind-riot')}
            handlePress={() => router.push("/(auth)/bind-account")}
            containerStyles="w-full mt-7"
          />
          <CustomButton 
            title={t('update-socials')}
            handlePress={() => router.push("/(auth)/update-social")}
            containerStyles="w-full mt-7 mb-7"
          />
          <RiotProfileSection userData={userData} isProfile={true} />
          <LookingForSection userData={userData} isProfile={true}/>
        </>
       )} 

      {friendId && ( 
        <>
          <RiotProfileSection userData={userData} isProfile={false} />
          <LookingForSection userData={userData} isProfile={false}/>
        </>
       )} 
  
    </ScrollView>
  );
};

export default Profile;
