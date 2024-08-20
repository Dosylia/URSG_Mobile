import React from 'react';
import { View, Image } from 'react-native';
import { champions, roles, ranks } from "../constants";
import championMapping from "../constants/championMapping";
import roleMapping from '../constants/roleMaping';
import rankMapping from '../constants/rankMapping';

const LeagueDataComponent = ({ main1, main2, main3, role, rank }) => {
  const getChampionImage = (championName) => {
    const imageKey = championMapping[championName];
    return imageKey ? champions[imageKey] : null;
  };

  roleKey = roleMapping[role];
  rankKey = rankMapping[rank];
  const getRankImage = (rank) => ranks[rankKey] || ranks.Bronze;
  const getRoleImage = (role) => roles[roleKey] || roles.Support;

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