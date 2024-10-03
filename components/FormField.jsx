import { View, Text, TextInput, Image } from 'react-native';
import React from 'react'
import { Picker } from '@react-native-picker/picker';


import { champions, championsValorant } from "../constants";
import { images } from "../constants";
import { roles, rolesValorant } from "../constants";
import { ranks, ranksValorant } from "../constants";

import championMapping from "../constants/championMapping";
import roleMapping from '../constants/roleMaping';
import rankMapping from '../constants/rankMapping';
import championValorantMapping from '../constants/championValorantMapping';
import roleValorantMapping from '../constants/roleValorantMapping';
import rankValorantMapping from '../constants/rankValorantMapping';
import { useColorScheme } from 'nativewind';



const FormField = ({ title, value, handleChangeText, placeholder, otherStyles, keyboardType, isSelect, options, hasImage, image, imageOrigin, ...props }) => {

  const { colorScheme } = useColorScheme();

  function displayImage(imageOrigin, image) {
    let baseImage;
    let optionKey = image;
    let valueKey;
    if (imageOrigin == 'champions') {
      baseImage = champions;
      optionKey = championMapping[image];
      valueKey = championMapping[options[0].value];
    } else if (imageOrigin == 'roles') {
      baseImage = roles;
      optionKey = roleMapping[image];
      valueKey = roleMapping[options[0].value];
    } else if (imageOrigin == 'ranks') {
      baseImage = ranks;
      optionKey = rankMapping[image];
      valueKey = rankMapping[options[0].value];
    } else if (imageOrigin == 'championsValorant') {
      baseImage = championsValorant;
      optionKey = championValorantMapping[image];
      valueKey = championValorantMapping[options[0].value];
    } else if (imageOrigin == 'rolesValorant') {
      baseImage = rolesValorant;
      optionKey = roleValorantMapping[image];
      valueKey = roleValorantMapping[options[0].value];
    } else if (imageOrigin == 'ranksValorant') {
      baseImage = ranksValorant;
      optionKey = rankValorantMapping[image];
      valueKey = rankValorantMapping[options[0].value];
    } else {
      baseImage = images;
    }
    if (typeof optionKey === 'undefined' || optionKey === null || optionKey === '') {
      return (
        <Image 
          source={baseImage[valueKey]}
          className="w-10 h-10 rounded-full"
          resizeMode='contain'
        />
      );
    } else {
      return (
        <Image 
          source={baseImage[optionKey]}
          className="w-10 h-10 rounded-full"
          resizeMode='contain'
        />
      );
    }
  }
    return (
          <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 dark:text-blackPerso font-pmedium">{title}</Text>
    
            <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-lightgrey focus:border-mainred flex flex-row items-center">
            {isSelect ? (
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => {
                    handleChangeText(itemValue);
                  }}
                  style={{
                    flex: 1,
                    color: colorScheme === 'light' ? '#FFFFFF' : '#000000',
                    fontSize: 16,
                  }}
                >
                      {options.map((option, index) => (
                      <Picker.Item key={index} label={option.label} value={option.value} />
                      ))}
                </Picker>
                ) : (
                <TextInput
                  className="flex-1 text-white dark:text-blackPerso font-psemibold text-base"
                  value={value}
                  placeholder={placeholder}
                  placeholderTextColor="#7B7B8B"
                  onChangeText={handleChangeText}
                  {...props}
                  keyboardType={keyboardType}
                />
              )}
              {hasImage && displayImage(imageOrigin, image)}
            </View>
        </View>
      );
  };

export default FormField