import React from 'react';
import { View, Text, Image } from 'react-native';
import ProfileSection from './ProfileSection';
import { images } from "../constants";
import LeagueDataComponent from './LeagueDataComponent';
import he from 'he';

const BASE_PROFILE_ICON_URL = 'https://ddragon.leagueoflegends.com/cdn/14.14.1/img/profileicon/';

const RiotProfileSection = ({ userData, isProfile }) => {
  // Construct the URL for the profile icon
  const riotProfilePicture = userData?.sProfileIcon
    ? { uri: `${BASE_PROFILE_ICON_URL}${userData.sProfileIcon}.png` }
    : images.defaultpictureLol;

  const riotName = userData?.account || 'Unknown Player';
  const server = userData?.server || 'N/A';
  const rank = userData?.sRank || 'N/A';
  const level = userData?.sLevel || 'N/A';
  const gender = userData?.gender || 'N/A';
  const kindOfGamer = userData?.kindOfGamer || 'N/A';
  const shortBio = userData?.shortBio ? he.decode(userData.shortBio) : 'No bio available';

  return (
    <ProfileSection title={isProfile ? 'About you' : 'About them'}>
      {userData && (
        <View>
          {/* Riot Profile Section */}
          {userData.sUsername && isProfile && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Image
                source={riotProfilePicture}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
              />
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{riotName}</Text>
                <Text style={{ color: 'gray' }}>{server}</Text>
                <Text style={{ color: 'gray' }}>{rank}</Text>
                <Text style={{ color: 'gray' }}>Level: {level}</Text>
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

          <Text style={{ color: 'white' }}>
            {isProfile ? 'Gender' : 'Their gender'}: {gender}
          </Text>
          <Text style={{ color: 'white' }}>
            {isProfile ? 'Kind of gamer' : 'Their kind of gamer'}: {kindOfGamer}
          </Text>
          <Text style={{ color: 'white' }}>
            {isProfile ? 'Short bio' : 'Their short bio'}: {shortBio}
          </Text>
        </View>
      )}
    </ProfileSection>
  );
};

export default RiotProfileSection;
