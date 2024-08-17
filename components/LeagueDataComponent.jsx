import React from 'react';
import { View, Image } from 'react-native';
import { champions, roles, ranks } from "../constants";

const LeagueDataComponent = ({ main1, main2, main3, role, rank }) => {
  const getChampionImage = (championName) => {
    if (!championName) return champions.Aatrox; 
    const normalizedChampionName = championName.replace(/\s+/g, '');
    return champions[normalizedChampionName] || champions.Aatrox;
  };

  const getRankImage = (rank) => ranks[rank] || ranks.Bronze;
  const getRoleImage = (role) => roles[role] || roles.Support;

  return (
    <View className="flex-row justify-between mb-4">
      {/* Champion 1 */}
      <Image 
        source={getChampionImage(main1)}
        className="w-14 h-14 rounded-full object-cover"
      />

      {/* Champion 2 */}
      <Image 
        source={getChampionImage(main2)}
        className="w-14 h-14 rounded-full object-cover"
      />

      {/* Champion 3 */}
      <Image 
        source={getChampionImage(main3)}
        className="w-14 h-14 rounded-full object-cover"
      />

      {/* Rank */}
      <Image 
        source={getRankImage(rank)}
        className="w-14 h-14 rounded-full"
      />

      {/* Role */}
      <Image 
        source={getRoleImage(role)}
        className="w-14 h-14 rounded-full"
      />
    </View>
  );
};

export default LeagueDataComponent;