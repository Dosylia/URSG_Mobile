import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import axios from 'axios';
import { SessionContext } from '../context/SessionContext';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useContext } from 'react';

const PlayerCard = ({ post, onInterest, navigation, currentUserId }) => {
    const { t } = useTranslation();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { sessions, setSession } = useContext(SessionContext);
    const isLoL = post.pf_game === 'League of Legends';
    const gamePrefix = isLoL ? 'lol' : 'valorant';
    const roleRaw = isLoL ? post.lol_role : post.valorant_role;
    const role = roleRaw.toLowerCase().replace(/\s/g, '');
    const rank = isLoL ? post.lol_rank : post.valorant_rank;
    const server = isLoL ? post.lol_server : post.valorant_server;
    const roleFolder = isLoL ? 'roles' : 'valorant_roles';
    const rankFolder = isLoL ? 'ranks' : 'valorant_ranks';
    const roleExt = isLoL ? 'png' : 'webp';

    let peopleInterested = [];

    if (Array.isArray(post.pf_peopleInterest)) {
    peopleInterested = post.pf_peopleInterest;
    } else {
    try {
        peopleInterested = JSON.parse(post.pf_peopleInterest || '[]');
    } catch {
        peopleInterested = [];
    }
    }

    const isLiked = peopleInterested.some(user => user.userId === currentUserId);

    const isOwner = post.user_id === currentUserId;

    const getRegionShort = (region) => {
        const regions = {
            'Europe West': 'EUW',
            'North America': 'NA',
            'Europe Nordic': 'EUNE',
            'Brazil': 'BR',
            'Latin America North': 'LAN',
            'Latin America South': 'LAS',
            'Oceania': 'OCE',
            'Russia': 'RU',
            'Turkey': 'TR',
            'Japan': 'JP',
            'Korea': 'KR',
        };
        return regions[region] || region;
    };

    const playWithThem = async (postId) => {
    try {
        const response = await axios.post(
        'https://ur-sg.com/playWithThemPhone',
        new URLSearchParams({
            postId,
            userId: sessions.userSession.userId,
        }).toString(),
        {
            headers: {
            'Authorization': `Bearer ${sessions.googleSession.token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
        );

        if (response.data.success === false) {
        console.error('Error from server:', response.data.error);
        return;
        }

        if (onInterest) onInterest();

    } catch (error) {
        console.error('Network or server error:', error);
    }
    };

    const deletePost = async (postId) => {
    try {
        const response = await axios.post(
        'https://ur-sg.com/deletePlayerFinderPostPhone',
        new URLSearchParams({
            postId,
            userId: sessions.userSession.userId,
        }).toString(),
        {
            headers: {
            'Authorization': `Bearer ${sessions.googleSession.token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
        );

        if (response.data.success === false) {
        console.error('Error from server:', response.data.error);
        return;
        }

        if (onInterest) onInterest();

    } catch (error) {
        console.error('Network or server error:', error);
    }
    };


    return (
    <View className="bg-gray-800 dark:bg-neutral-300 rounded-xl p-2 mb-5 shadow-md w-[95%] mx-auto">
        {/* Game Icon */}
        <Image
        source={{
            uri: isLoL
            ? 'https://ur-sg.com/public/images/league-icon.png'
            : 'https://ur-sg.com/public/images/valorant-icon.png',
        }}
        className="absolute top-5 right-5 w-6 h-6 mb-2"
        resizeMode="contain"
        />

        {/* Header */}
        <View className="flex-row items-center justify-center space-x-4 mb-2">
            <Image
                source={{
                uri: post.user_picture
                    ? `https://ur-sg.com/public/upload/${post.user_picture}`
                    : 'https://ur-sg.com/public/images/defaultprofilepicture.jpg',
                }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
            />
            <Text className="text-base text-white dark:text-black">{post.user_username}</Text>
            {post.pf_voiceChat === '1' && <Text className="ml-2">🎤</Text>}
            <Text className="ml-auto text-sm text-gray-400 dark:text-gray-600">{getRegionShort(server)}</Text>
        </View>

        {/* About User & Looking For */}
        <View className="flex-row justify-around mb-2">
        {/* About Them */}
        <View className="items-center">
            <Text className="text-[10px] italic text-gray-500 dark:text-gray-400 mb-1">{t('pf-about-them')}</Text>
            <View className="flex-row items-center gap-4">
                <Image
                source={{ uri: `https://ur-sg.com/public/images/${roleFolder}/${role}.${roleExt}` }}
                className="w-8 h-8"
                />
                <Image
                source={{ uri: `https://ur-sg.com/public/images/${rankFolder}/${rank}.png` }}
                className="w-8 h-8"
                />
            </View>
        </View>

        {/* Looking For */}
        <View className="items-center">
            <Text className="text-[10px] italic text-gray-500 dark:text-gray-400 mb-1">{t('pf-looking-for')}</Text>
            <View className="flex-row items-center gap-4">
                <Image
                source={{ uri: `https://ur-sg.com/public/images/${roleFolder}/${post.pf_role.toLowerCase().replace(/\s/g, '')}.${roleExt}` }}
                className="w-8 h-8"
                />
                <Image
                source={{ uri: `https://ur-sg.com/public/images/${rankFolder}/${post.pf_rank}.png` }}
                className="w-8 h-8"
                />
            </View>
        </View>
        </View>

        {/* Description */}
        {post.pf_description && (
        <ScrollView className="bg-gray-700 dark:bg-gray-200 rounded-md px-2 py-1 mb-2 self-center">
            <Text className="text-base text-white dark:text-black">{post.pf_description}</Text>
        </ScrollView>
        )}

        {/* Like Icon */}
        {isLiked && (
        <FontAwesome5
            name="heart"
            solid
            size={16}
            color="#e84056"
            style={{ position: 'absolute', top: 10, left: 10 }}
        />
        )}

        {/* Buttons */}
        <View className="flex-row justify-center space-x-2 mt-2">
        {isOwner ? (
            <TouchableOpacity
            className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded-md"
            onPress={() => deletePost(post.pf_id)}
            >
            <Text className="text-black dark:text-white text-sm">{t('pf-delete-post')}</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity
            className="bg-mainred px-4 py-2 rounded-md"
            onPress={() => playWithThem(post.pf_id)}
            >
            <Text className="text-white text-sm">{t('pf-play')}</Text>
            </TouchableOpacity>
        )}
        </View>
    </View>
    );

};

export default PlayerCard;
