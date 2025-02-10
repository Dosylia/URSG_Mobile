import { View, Image, TouchableOpacity, Text, ActivityIndicator, Modal, Button } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import CustomButton from "./CustomButton";
import ProfileSection from "./ProfileSection";
import { icons } from "../constants";
import { useColorScheme } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';
import { SessionContext } from '../context/SessionContext';
import { Platform } from 'react-native';

const BASE_URL = 'https://ur-sg.com/public/upload/'

const BonusPicture = ({ userData, isProfile }) => {
    const { t } = useTranslation()
    const addImage = colorScheme === 'dark' ? icons.addImageDark : icons.addImage;
    const { colorScheme } = useColorScheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [image, setImage] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imagePicked, setImagePicked] = useState(false);
    const { sessions, setSession } = useContext(SessionContext);
    const [errors, setErrors] = useState('');
    const [errorsNonModal, setErrorsNonModal] = useState('');
    const [displayPictures, setDisplayPictures] = useState([]);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need media library permissions to make this work!');
        }
        }
    };

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
        
        formData.append('username', userData.username);

        console.log("Form Data:", formData);
        
        try {
            const response = await axios.post(
            'https://ur-sg.com/updateBonusPicturePhone',
            formData,
            {
                headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${userData.token}`,
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
            setIsLoading(false);
            const updatedPictures = response.data.bonusPictures;
            setSession('userSession', { bonusPicture: JSON.stringify(updatedPictures) });
            setImage(null); // Reset the picked image after success
            setFileName(null); // Reset the file name
            setImagePicked(false); // Reset imagePicked flag
            setModalVisible(false); // Close the modal
            setDisplayPictures(updatedPictures);
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
    
    useEffect(() => {
        if (userData?.bonusPicture) {
            setDisplayPictures(JSON.parse(userData.bonusPicture));
        }
    }, [userData]);

    const openAddPicturePopup = () => {
        setModalVisible(true);
    };

    const deletePicture = async (pictureUrl) => {
        try {
            const response = await axios.post('https://ur-sg.com/deleteBonusPicturePhone', {
                fileName: pictureUrl,
                userId: userData.userId 
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${userData.token}`,
                }
            });
    
            if (response.data.message === 'Success') {
                console.log('Picture deleted:', pictureUrl);

                // Update local gallery state after deleting a picture
                const updatedPictures = response.data.bonusPictures;
                setSession('userSession', { bonusPicture: JSON.stringify(updatedPictures) });
                setDisplayPictures(updatedPictures);
            } else {
                console.log('Error deleting picture:', response.data.message);
                setErrorsNonModal(response.data.message);
            }
        } catch (error) {
            console.error('Error deleting picture:', error);
            setErrorsNonModal('Error deleting picture');
        }
    };

    if (isLoading) {
        return (
        <View className="flex-1 justify-center items-center bg-gray-900 dark:bg-whitePerso">
            <ActivityIndicator size="large" color="#e74057" />
        </View>
        );
    }

  return (
    <ProfileSection title={isProfile ? t('gallery') : t('their-gallery')}>
              {isProfile && (
            <TouchableOpacity onPress={openAddPicturePopup} className="absolute top-3 right-3">
            <Image 
                source={addImage} 
                className="w-8 h-8" 
            />
            </TouchableOpacity>
        )}
      <View className="flex-row flex-wrap justify-start">
        {displayPictures.map((item, index) => {
          const imageUrl = `${BASE_URL}${item}`
          return (
            <View key={index} className="relative m-1">
              <Image
                source={{ uri: imageUrl }}
                className="w-24 h-24 rounded-lg"
                resizeMode="cover"
              />
              {isProfile && (
                <TouchableOpacity
                  onPress={() => deletePicture(item)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1"
                >
                  <Text className="text-mainred font-bold text-xs">X</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        })}
        {/* Error Message */}
        {errorsNonModal ? (
            <Text className="text-red-600 text-xl text-center my-2">{errorsNonModal}</Text>
        ) : null}
            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    {/* Modal Container */}
                    <View className={`${colorScheme === 'dark' ? 'bg-gray-500' : 'bg-gray-800'} p-6 rounded-lg w-4/5`}>
                        
                        {/* Title */}
                        <Text className="text-2xl text-white dark:text-blackPerso font-semibold text-center mb-4">
                            {t('update-bonus-picture')}
                        </Text>

                        {/* Error Message */}
                        {errors ? (
                            <Text className="text-red-600 text-xl text-center my-2">{errors}</Text>
                        ) : null}

                        {/* Image Picker Section */}
                        <TouchableOpacity 
                            onPress={pickImage} 
                            className="w-full items-center justify-center"
                        >
                            {imagePicked && image ? (
                                <Image
                                    source={{ uri: image }}
                                    className="w-36 h-36 rounded-full mt-5 border-2 border-mainred"
                                />
                            ) : (
                                <Image
                                    source={
                                        userData.picture
                                        ? { uri: `https://ur-sg.com/public/images/defaultprofilepicture.jpg` }
                                        : profileImage
                                    }
                                    className="w-36 h-36 rounded-full mt-5 border-2 border-mainred"
                                />
                            )}
                            <Text className="text-mainred text-xl font-semibold mt-2">
                                {t('pick-image')}
                            </Text>
                        </TouchableOpacity>

                        {/* Info Text */}
                        <Text className="text-white dark:text-blackPerso text-lg mt-5 text-center">
                            {t('update-bonus-picture-info')}
                        </Text>

                        {/* Buttons */}
                        <View className="mt-7">
                            <CustomButton
                                title={t('change-picture')}
                                handlePress={submitForm}
                                containerStyles="w-full"
                            />
                        </View>
                        <View className="mt-4">
                            <Button 
                                title={t('cancel')} 
                                onPress={() => setModalVisible(false)} 
                                color="#aaa" 
                            />
                        </View>
                    </View>
                </View>
            </Modal>
      </View>
    </ProfileSection>
  )
}

export default BonusPicture
