import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useContext, useEffect } from 'react';
import { SessionContext } from '../../context/SessionContext';
import { router } from 'expo-router';
import axios from 'axios';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { images } from "../../constants";

import { CustomButton } from "../../components";
import * as ImagePicker from 'expo-image-picker';

const UpdatePicture = () => {
  const { t } = useTranslation();
  const { sessions, setSession } = useContext(SessionContext);
  const [errors, setErrors] = useState('');
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePicked, setImagePicked] = useState(false);
  const [ownedItems, setOwnedItems] = useState([]);
  const profilePictures = ownedItems.filter(item => item.items_category === 'profile Picture');
  const username = sessions?.userSession.username;
  const profileImage = images.defaultpicture; 
  const { userId } = sessions.userSession;

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
      }
    }
  };
  
  useEffect(() => {
    fetchOwnedItems();
  }, []);

  // Function to handle image picking
  const pickImage = async () => {
    requestPermissions();
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log("Image Picker Result:", result); // Log the entire result object

      if (!result.canceled) {
        const uri = result.assets[0]?.uri; 
        const fileName = result.assets[0]?.fileName; 
        if (uri && fileName) {
          console.log("Image URI:", uri);
          console.log("Filename:", fileName);
          setImagePicked(true);
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

  // Function to submit the form along with the selected image (profile picture update)
  const submitForm = async () => {
    if (!image && !fileName) {
      setErrors('Please select an image');
      return;
    }

    setIsLoading(true);
  
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
            'Authorization': `Bearer ${sessions.googleSession.token}`,
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
        setIsLoading(false);
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

  // Function to fetch owned items
  const fetchOwnedItems = async () => {
    try {
      const response = await axios.post('https://ur-sg.com/getOwnedItemsPhone', {
        userId: userId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
        }
      });
      const itemsData = response.data;
      if (itemsData.message === 'Success') {
        setOwnedItems(itemsData.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Function to use a picture frame

  const usePictureFrame = async (itemId) => {
    const dataToSend = {
      itemId,
      userId,
    };
  
    // Wrap the data in a 'param' key
    const formData = new URLSearchParams({ param: JSON.stringify(dataToSend) }).toString();
  
    try {
      const response = await axios.post('https://ur-sg.com/usePictureFrame', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
        },
      });
  
      console.log('Success:', response.data);
      if (response.data.success) {
        router.push("/(tabs)/profile");
      } else {
        console.log('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Function to remove a picture frame
  const removePictureFrame = async (itemId) => {
    const dataToSend = {
      itemId,
      userId,
    };
  
    // Wrap the data in a 'param' key
    const formData = new URLSearchParams({ param: JSON.stringify(dataToSend) }).toString();
  
    try {
      const response = await axios.post('https://ur-sg.com/removePictureFrame', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
        },
      });
  
      console.log('Success:', response.data);
      if (response.data.success) {
        router.push("/(tabs)/profile");
      } else {
        console.log('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 dark:bg-whitePerso">
        <ActivityIndicator size="large" color="#e74057" />
      </View>
    );
  }

  const closePage = () => {
    router.push("/(tabs)/profile");
  };

  return (
    <SafeAreaView className="bg-gray-900 dark:bg-whitePerso h-full">
      <ScrollView>
        <View className="flex w-full flex-row items-center bg-gray-900 dark:bg-whitePerso">
          <View className="flex-1" />
          <TouchableOpacity onPress={closePage}>
            <Text className="text-mainred px-5 text-3xl font-extrabold">X</Text>
          </TouchableOpacity>
        </View>
        <View className="w-full justify-start h-full px-4 my-6">
          <Text className="text-2xl text-white dark:text-blackPerso text-semibpmd font-psemibold">
            {t('update-picture')}
          </Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}

          <TouchableOpacity 
            onPress={pickImage} 
            className="w-full mt-7 flex-row items-center justify-start ml-5 mb-5"
          >
            {imagePicked && image ? (
              <Image
                source={{ uri: image }}
                className="w-36 h-36 rounded-full mt-5 mr-2"
              />
            ) : (
              <Image
                source={
                  sessions.userSession.picture
                    ? { uri: `https://ur-sg.com/public/upload/${sessions.userSession.picture}` }
                    : profileImage
                }
                className="w-36 h-36 rounded-full mt-5 mr-2 border-2 border-mainred"
              />
            )}
            <Text 
              className="text-mainred text-xl font-semibold ml-4"
            >
              {t('pick-image')}
            </Text>
          </TouchableOpacity>

          <Text className="text-white dark:text-blackPerso text-lg mt-5">
            {t('update-picture-info')}
          </Text>

          <CustomButton
            title={t('change-picture')}
            handlePress={submitForm}
            containerStyles="w-full mt-7"
          />
          
          {/* Picture frame section */}
          <View>
      {/* Title Section */}
      <Text className="text-2xl text-white dark:text-blackPerso text-semibpmd font-psemibold mb-5 mt-5">
        {t('choose-picture-frame')}
      </Text>

      {/* Check if there are profile pictures */}
      {profilePictures.length > 0 ? (
        <View className="flex flex-row flex-wrap">
          {profilePictures.map(item => (
            <View key={item.userItems_id} className="mr-4 mb-4 items-center justify-center">
              <TouchableOpacity onPress={() => item.userItems_isUsed ? removePictureFrame(item.userItems_id) : usePictureFrame(item.userItems_id)}>
                <Image
                  source={{
                    uri: item.items_picture
                      ? `https://ur-sg.com//public/images/store/${item.items_picture}`
                      : 'https://ur-sg.com//public/images/store/defaultpicture.jpg'
                  }}
                  className="w-24 h-24 rounded-md mb-3"
                />
              </TouchableOpacity>
              <Text className="text-white text-center mb-3">{item.items_name}</Text>
              {item.userItems_isUsed ? (
                <CustomButton
                  title={t('remove-frame')}
                  handlePress={() => removePictureFrame(item.userItems_id)}
                  containerStyles="mt-2 p-2"
                />
              ) : (
                <CustomButton
                  title={t('use-frame')}
                  handlePress={() => usePictureFrame(item.userItems_id)}
                  containerStyles="mt-2 p-2"
                />
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-white mt-2">{t('no-frame-yet')}</Text>
      )}
    </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdatePicture;
