import React, { useEffect, useState, useContext } from 'react';
import { Modal, View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import { useFriendList } from '../context/FriendListContext';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { SessionContext } from '../context/SessionContext';

const adminToken = '56874d4zezfze656e2f6e62f6e'; // keep your token here or better pass as prop/env

const InterestedModal = ({ visible, onClose, interestedUsers, currentUserId }) => {
    const { sessions } = useContext(SessionContext);
    const { friendList } = useFriendList();
    const { colorScheme } = useColorScheme();
    const [detailedUsers, setDetailedUsers] = useState([]);
    const { t } = useTranslation();
    const fetchUserData = async (userId) => {
        try {
        const response = await axios.post(
            'https://ur-sg.com/getUserData',
            new URLSearchParams({ userId }).toString(),
            {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${adminToken}`,
            },
            }
        );

        if (response.data.message === 'Success') {
            const isLoL = response.data.user.user_game === 'League of Legends';
            return {
                user_id: response.data.user.user_id,
                user_username: response.data.user.user_username,
                user_picture: response.data.user.user_picture,
                server: isLoL ? response.data.user.lol_server : response.data.user.valorant_server || 'Unknown Server',
                role: (isLoL ? response.data.user.lol_role : response.data.user.valorant_role || 'unknown role')
                        .toLowerCase()
                        .replace(/\s+/g, ''),
                rank: isLoL ? response.data.user.lol_rank : response.data.user.valorant_rank || 'Unranked',
                roleExt: isLoL ? 'png' : 'webp',
                rankFolder: isLoL ? 'ranks' : 'valorant_ranks',
                roleFolder: isLoL ? 'roles' : 'valorant_roles',
            };
        } else {
            console.error('Failed to fetch user data:', response.data.error);
            return null;
        }
        } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
        }
    };

    useEffect(() => {
        if (visible && interestedUsers && interestedUsers.length > 0) {
        Promise.all(
            interestedUsers.map((user) => fetchUserData(user.userId))
        ).then((results) => {
            const filteredResults = results.filter(Boolean); // remove nulls
            setDetailedUsers(filteredResults);
        });
        } else {
        setDetailedUsers([]);
        }
    }, [visible, interestedUsers]);

    const handleChat = async (userId) => {
        await AsyncStorage.setItem('selectedFriendId', userId.toString());
        if (onClose) onClose();
        router.push('/chat');
    };

    const addFriendAndChat = async (friendId) => {
        try {
            const response = await axios.post(
            'https://ur-sg.com/addFriendAndChatPhone',
            new URLSearchParams({
                userId: parseInt(sessions.userSession.userId),
                friendId: parseInt(friendId),
            }).toString(),
            {
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${sessions.googleSession.token}`,
                },
            }
            );

            if (response.data.success) {
            await AsyncStorage.setItem('selectedFriendId', friendId.toString());
            if (onClose) onClose();
            router.push('/chat');
            } else {
            console.error('Error adding as friend:', response.data.message);
            }
        } catch (error) {
            console.error('Error adding friend and chat:', error);
        }
    };


    const isFriend = (userId) => friendList.some(f => f.friend_id === userId);

    return (
        <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/60">
            <View className="w-[90%] bg-gray-800 dark:bg-white p-6 rounded-2xl max-h-[80%]">
            <Text className="text-lg font-bold mb-4 text-white dark:text-black">{t('pf-people-interested')}</Text>
            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }} className="mb-4">
                {detailedUsers.map(user => (
                <View
                    key={user.user_id}
                    className="bg-gray-700 dark:bg-gray-200 rounded-xl p-3 mb-4"
                    style={{ width: '48%' }} // ~2 per row, or use 30% for 3 per row
                >
                    <Image
                    source={{
                        uri: user.user_picture
                        ? `https://ur-sg.com/public/upload/${user.user_picture}`
                        : 'https://ur-sg.com/public/images/defaultprofilepicture.jpg',
                    }}
                    className="w-12 h-12 rounded-full mb-1"
                    />
                    <Text className="text-white dark:text-black font-semibold">{user.user_username}</Text>
                    <Text className="text-gray-400 dark:text-gray-600 text-sm">{user.server}</Text>
                    <View className="flex-row space-x-2 my-1">
                    <Image
                        source={{ uri: `https://ur-sg.com/public/images/${user.roleFolder}/${user.role}.${user.roleExt}` }}
                        className="w-6 h-6"
                    />
                    <Image
                        source={{ uri: `https://ur-sg.com/public/images/${user.rankFolder}/${user.rank}.png` }}
                        className="w-6 h-6"
                    />
                    </View>

                    {isFriend(user.user_id) ? (
                    <TouchableOpacity
                        onPress={() => handleChat(user.user_id)}
                        className="bg-blue-500 p-2 rounded-xl mt-2"
                    >
                        <Text className="text-white text-center text-sm">{t('pf-chat')}</Text>
                    </TouchableOpacity>
                    ) : (
                    <TouchableOpacity
                        onPress={() => addFriendAndChat(user.user_id)}
                        className="bg-green-500 p-2 rounded-xl mt-2"
                    >
                        <Text className="text-white text-center text-sm">{t('pf-chat-add')}</Text>
                    </TouchableOpacity>
                    )}
                </View>
                ))}
            </ScrollView>

            <TouchableOpacity onPress={onClose} className="bg-mainred py-2 rounded-xl mt-2">
                <Text className="text-white text-center">{t('pf-close')}</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    );
};

export default InterestedModal;
