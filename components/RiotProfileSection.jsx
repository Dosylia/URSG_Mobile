import React from 'react';
import { View, Text, Image } from 'react-native';
import ProfileSection from './ProfileSection';
import { images } from "../constants";
import LeagueDataComponent from './LeagueDataComponent';

const RiotProfileSection = ({ userData }) => {
  const riotProfilePicture = images.defaultpictureLol; // riotProfilePicture = userData?.sProfileIcon ? { uri: userData.sProfileIcon } : images.defaultpictureLol;
  const riotName = userData?.account || 'Unknown Player';
  const server = userData?.server || 'N/A';
  const rank = userData?.sRank || 'N/A';
  const level = userData?.sLevel || 'N/A';
  const gender = userData?.gender || 'N/A';
  const kindOfGamer = userData?.kindOfGamer || 'N/A';
  const shortBio = userData?.shortBio || 'No bio available';

  return (
    <ProfileSection title="About you">
      {userData && (
        <View>
          {/* Riot Profile Section */}
          {userData.sUsername && (
            <View className="flex-row items-center mb-4">
              <Image
                source={riotProfilePicture}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="text-white font-bold">{riotName}</Text>
                <Text className="text-gray-400">{server}</Text>
                <Text className="text-gray-400">{rank}</Text>
                <Text className="text-gray-400">Level: {level}</Text>
              </View>
            </View>
          )}

          {/* League Data Component */}
          {userData.main1 && userData.main2 && userData.main3 && userData.role && userData.rank && (
            <LeagueDataComponent
              main1={userData.main1}
              main2={userData.main2}
              main3={userData.main3}
              role={userData.role}
              rank={userData.rank}
            />
          )}

          <Text className="text-white">Gender: {gender}</Text>
          <Text className="text-white">Kind of gamer: {kindOfGamer}</Text>
          <Text className="text-white">Your short bio: {shortBio}</Text>
        </View>
      )}
    </ProfileSection>
  );
};

export default RiotProfileSection;
