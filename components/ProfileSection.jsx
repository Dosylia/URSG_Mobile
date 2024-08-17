import React from 'react';
import { View, Text } from 'react-native';

const ProfileSection = ({ title, children }) => {
  return (
    <View className="bg-mediumgrey p-4 rounded-lg my-2">
      <Text className="text-lg font-bold text-mainred mb-3">{title}</Text>
      {children}
    </View>
  );
};

export default ProfileSection;
