import React from 'react';
import { View, Text } from 'react-native';
import { tw } from 'nativewind';

const ProgressBar = ({ zaunScore, piltoverScore, userSide }) => {
  const totalScore = zaunScore + piltoverScore;
  const zaunPercentage = (zaunScore / totalScore) * 100;
  const piltoverPercentage = (piltoverScore / totalScore) * 100;

  let message = '';
  if (userSide === 'Zaun') {
    message = zaunScore > piltoverScore ? 'Zaun is winning!' : 'Zaun is losing!';
  } else if (userSide === 'Piltover') {
    message = piltoverScore > zaunScore ? 'Piltover is winning!' : 'Piltover is losing!';
  }

  return (
    <View className="my-4">
      <Text className="text-center text-lg font-bold mb-2 text-white dark:text-blackPerso">{message}</Text>
      <View className="flex-row h-4 w-full bg-gray-300 rounded-full overflow-hidden">
        <View className="bg-green-500 h-full" style={{ width: `${zaunPercentage}%` }} />
        <View className="bg-blue-500 h-full" style={{ width: `${piltoverPercentage}%` }} />
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-green-500">Zaun: {zaunScore}</Text>
        <Text className="text-blue-500">Piltover: {piltoverScore}</Text>
      </View>
    </View>
  );
};

export default ProgressBar;