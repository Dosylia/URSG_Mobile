import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react';
import { SessionContext } from '../../context/SessionContext';
import { router } from 'expo-router';
import axios from 'axios';
import { Platform } from 'react-native';

import { images } from "../../constants";
import { CustomButton } from "../../components";
import * as ImagePicker from 'expo-image-picker';

const updatePicture = () => {
    const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState(null);
  const username = sessions?.userSession.username;

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
      }
    }
  };
  
  useEffect(() => {
    requestPermissions();
  }, []);

  // Function to handle image picking
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Image Picker Result:", result); // Log the entire result object

      if (!result.canceled) {
        const uri = result.assets[0]?.uri; 
        const fileName = result.assets[0]?.fileName; 
        if (uri && fileName) {
          console.log("Image URI:", uri);
          console.log("Filename:", fileName);
          setImage(uri);
          setFileName(fileName);
        } else {
          console.log("No URI found in the result");
        }
      } else {
        console.log("Image selection was canceled");
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  // Function to submit the form along with the selected image
  const submitForm = async () => {
    if (!image && !fileName) {
      setErrors('Please select an image');
      return;
    }
  
    // Create FormData object and append image and userId
    let formData = new FormData();
    formData.append('picture', {
      uri: image,
      name: fileName,
      type: 'image/jpeg',
    });
  
    // Append userId from session context
    if (!username) {
      setErrors('User ID is not available');
      return;
    }
  
    formData.append('username', username);
  
    try {
      const response = await axios.post(
        'https://ur-sg.com/updatePicturePhone',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      console.log("Axios response:", {
        status: response.status,
        data: response.data,
        headers: response.headers,
        config: response.config,
      });
  
      if (response.data.message !== 'Success') {
        setErrors(response.data.message);
      } else {
        setSession('userSession', {
            picture: `resized_${fileName}`
          }, () => {
            setTimeout(() => {
              router.push("/(tabs)/profile");
            }, 1000);
          });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error submitting form:", error.message);
      } else {
        console.error("Error submitting form:", error);
      }
      setErrors('Error submitting form');
    }
  };
  

  return (
    <SafeAreaView className="bg-darkgrey h-full">
      <ScrollView>
        <View className="w-full justify-start h-full px-4 my-6">
          <Image
            source={images.logoWhite}
            className="w-[100px] h-[50px]"
            resizeMode="contain"
          />
          <Text className="text-2xl text-white text-semibpmd mt-5 font-psemibold">
            Update your profile
          </Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}

          {image && (
            <Image
              source={{ uri: image }}
              className="w-36 h-36 rounded-full mt-5"
            />
          )}

          <TouchableOpacity onPress={pickImage} className="w-full mt-7">
            <Text className="text-white text-center">Pick an Image</Text>
          </TouchableOpacity>

          <CustomButton
            title="Update your picture"
            handlePress={submitForm} // Handle sending data to database and router.push("/league-data")
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default updatePicture;
