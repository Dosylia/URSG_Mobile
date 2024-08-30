import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

const ProfileSection = ({ title, children }) => {
  const { colorScheme } = useColorScheme();
  return (
    <View
      className={`p-4 rounded-lg my-2 ${
        colorScheme === 'dark' ? 'bg-gray-300' : 'bg-mediumgrey'
      }`}
    >
      <Text className="text-lg font-bold text-mainred mb-3">{title}</Text>
      {children}
    </View>
  );
};

export default ProfileSection;
