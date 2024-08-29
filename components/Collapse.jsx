import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { icons } from '../constants';

function Collapse({ collapseTitle, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View className="mt-12 mb-8 w-full">
      <TouchableOpacity
        className="w-full bg-mainred rounded-xl p-4 flex-row items-center justify-between"
        onPress={toggleCollapse}
      >
        <Text className="text-white text-lg">{collapseTitle}</Text>
        <Image
          source={icons.arrowtop}
          style={[
            styles.arrow,
            { transform: [{ rotate: isOpen ? '180deg' : '0deg' }] },
          ]}
        />
      </TouchableOpacity>
      {isOpen && (
        <View className="p-4 rounded-xl bg-backgroundcolor flex-col items-center">
          {/* Ensure children are centered */}
          <View className="w-full flex-col items-center">
            {children}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});

export default Collapse;
