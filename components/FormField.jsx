import { View, Text, TextInput, Image } from 'react-native';
import React from 'react'
import { Picker } from '@react-native-picker/picker';


import { champions } from "../constants";
import { images } from "../constants";
import { roles } from "../constants";
import { ranks } from "../constants";

const FormField = ({ title, value, handleChangeText, placeholder, otherStyles, keyboardType, isSelect, options, hasImage, image, imageOrigin, ...props }) => {

  function displayImage(imageOrigin, image) {
    let baseImage;
    if (imageOrigin == 'champions') {
      baseImage = champions;
    } else if (imageOrigin == 'roles') {
      baseImage = roles;
    } else if (imageOrigin == 'ranks') {
      baseImage = ranks;
    } else {
      baseImage = images;
    }
    if (!image) {
      return (
        <Image 
          source={baseImage[options[0].value]}
          className="w-10 h-10 rounded-full"
          resizeMode='contain'
        />
      );
    } else {
      return (
        <Image 
          source={baseImage[image]}
          className="w-10 h-10 rounded-full"
          resizeMode='contain'
        />
      );
    }
  }
    return (
          <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 font-pmedium">{title}</Text>
    
            <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-lightgrey focus:border-mainred flex flex-row items-center">
            {isSelect ? (
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => {
                    handleChangeText(itemValue);
                  }}
                  style={{ flex: 1, color: '#FFFFFF' , fontSize: 16 }}
                >
                      {options.map((option, index) => (
                      <Picker.Item key={index} label={option.label} value={option.value} />
                      ))}
                </Picker>
                ) : (
                <TextInput
                  className="flex-1 text-white font-psemibold text-base"
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