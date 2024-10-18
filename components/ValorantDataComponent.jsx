import React from 'react';
import { View, Image } from 'react-native';
import { championsValorant, rolesValorant, ranksValorant } from "../constants";
import championValorantMapping from "../constants/championValorantMapping";
import roleValorantMapping from '../constants/roleValorantMapping';
import rankValorantMapping from '../constants/rankValorantMapping';

const ValorantDataComponent = ({ main1, main2, main3, role, rank }) => {
  const getChampionImage = (championName) => {
    const imageKey = championValorantMapping[championName];
    return imageKey ? championsValorant[imageKey] : null;
  };

  roleKey = roleValorantMapping[role];
  rankKey = rankValorantMapping[rank];
  const getRankImage = (rank) => ranksValorant[rankKey] || ranksValorant.Bronze;
  const getRoleImage = (role) => rolesValorant[roleKey] || rolesValorant.Controller;

  return (
    <View className="flex-row mb-4 gap-2">
      {/* Champion 1 */}
      {main1 && (
        <Image 
          source={getChampionImage(main1)}
          className="w-14 h-14 rounded-full object-cover"
        />
      )}

      {/* Champion 2 */}
      {main2 && (
        <Image 
          source={getChampionImage(main2)}
          className="w-14 h-14 rounded-full object-cover"
        />
      )}

      {/* Champion 3 */}
      {main3 && (
        <Image 
          source={getChampionImage(main3)}
          className="w-14 h-14 rounded-full object-cover"
        />
      )}

      {/* Rank */}
      {rank && (
        <Image 
          source={getRankImage(rank)}
          className="w-14 h-14 rounded-full"
        />
      )}

      {/* Role */}
      {role && (
        <Image 
          source={getRoleImage(role)}
          className="w-14 h-14 rounded-full"
        />
      )}
    </View>
  );
};

export default ValorantDataComponent;