// PlayerFinder.jsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Modal, TextInput, Button, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { SessionContext } from '../../context/SessionContext';
import { useTranslation } from 'react-i18next';
import { PlayerCard, InterestedModal } from "../../components";
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

const PlayerFinder = ({ navigation }) => {
    const { t } = useTranslation();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { sessions, setSession } = useContext(SessionContext);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [interestedModalVisible, setInterestedModalVisible] = useState(false);
    const [interestedUsers, setInterestedUsers] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [availableRanks, setAvailableRanks] = useState([]);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [filters, setFilters] = useState({
        game: '',
        role: '',
        rank: '',
        voice: undefined,
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [newPost, setNewPost] = useState({
        userId: sessions.userSession.userId,
        voiceChat: false,
        roleLookingFor: 'Any',
        rankLookingFor: 'Any',
        description: '',
        account: sessions.leagueSession.account || '',
        game: sessions.userSession.game || 'League of Legends',
    });

    const lolRanks = [
    "Any", "Unranked", "Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald",
    "Diamond", "Master", "Grand Master", "Challenger"
    ];

    const lolRoles = [
    "Any", "Support", "AD Carry", "Mid laner", "Jungler", "Top laner"
    ];

    const valorantRanks = [
    "Any", "Unranked", "Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond",
    "Ascendant", "Immortal", "Radiant"
    ];

    const valorantRoles = [
    "Any", "Controller", "Duelist", "Initiator", "Sentinel"
    ];

    const openModal = () => {
        const game = sessions.userSession.game;
        const roles = game === 'League of Legends' ? lolRoles : valorantRoles;
        const ranks = game === 'League of Legends' ? lolRanks : valorantRanks;
        setAvailableRoles(roles);
        setAvailableRanks(ranks);
        setModalVisible(true);
    };

    // Fetch posts on mount
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
    try {
        const response = await axios.post(
        'https://ur-sg.com/getPlayerFinderPostsPhone',
        new URLSearchParams({ userId: sessions.userSession.userId }).toString(),
        {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${sessions.googleSession.token}`,
            },
        }
        );

        const posts = response.data.posts;

        // Find the post created by the logged-in user
        const userPost = posts.find(post => post.user_id === sessions.userSession.userId);

        // If the user has a post, set the list of interested users
        if (userPost) {
        let peopleInterested = [];

        try {
            peopleInterested = JSON.parse(userPost.pf_peopleInterest || '[]');
        } catch (e) {
            console.error('Failed to parse pf_peopleInterest:', e);
        }

        setInterestedUsers(peopleInterested);
        }

        setPosts(posts);
        applyFilters(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
    };


const applyFilters = (postsToFilter = posts, filtersToUse = filters) => {
    const normalizeFilter = v => (v === "Any" || v === "" ? null : v);

    const normalizedGame = normalizeFilter(filtersToUse.game);
    const normalizedRole = normalizeFilter(filtersToUse.role);
    const normalizedRank = normalizeFilter(filtersToUse.rank);
    const normalizedVoice = filtersToUse.voice;

    const filtered = postsToFilter.filter(post => {
        const gameMatch = !normalizedGame || post.pf_game === normalizedGame;

        let roleLookingFor = null;
        let rankLookingFor = null;

        if (post.pf_game === 'League of Legends') {
            roleLookingFor = post.lol_role || post.pf_roleLookingFor || null;
            rankLookingFor = post.lol_rank || post.pf_rankLookingFor || null;
        } else if (post.pf_game === 'Valorant') {
            roleLookingFor = post.valorant_role || post.pf_roleLookingFor || null;
            rankLookingFor = post.valorant_rank || post.pf_rankLookingFor || null;
        }

        const roleMatch = !normalizedRole || roleLookingFor === normalizedRole;
        const rankMatch = !normalizedRank || rankLookingFor === normalizedRank;
        const voiceMatch = normalizedVoice === undefined || post.pf_voiceChat === normalizedVoice;

        return gameMatch && roleMatch && rankMatch && voiceMatch;
    });

    setFilteredPosts(filtered);
};



    const handleFilterChange = (name, value) => {
        let newFilters = { ...filters, [name]: value };

        if (name === 'game') {
            if (value === 'League of Legends') {
                setAvailableRoles(lolRoles);
                setAvailableRanks(lolRanks);
            } else if (value === 'Valorant') {
                setAvailableRoles(valorantRoles);
                setAvailableRanks(valorantRanks);
            } else {
                // Any Game - combine roles and ranks
                const allRoles = [...new Set([...lolRoles, ...valorantRoles])];
                const allRanks = [...new Set([...lolRanks, ...valorantRanks])];
                setAvailableRoles(allRoles);
                setAvailableRanks(allRanks);

                newFilters.role = "";
                newFilters.rank = "";
            }
        }

        setFilters(newFilters);
        applyFilters(posts, newFilters);
    };

    const createPost = async () => {
        try {
        console.log('Creating post with data:', newPost);
        const response = await axios.post(
            'https://ur-sg.com/addPlayerFinderPostPhone',
            JSON.stringify(newPost),
            {
            headers: {
                'Authorization': `Bearer ${sessions.googleSession.token}`,
            },
            }
        );
        
        if (response.data.success) {
            await sendMessageDiscord(response.data.oldTime);
            setModalVisible(false);
            fetchPosts();
        } else {
            console.error('Error creating post:', response.data.error);
        }
        } catch (error) {
        console.error('Error creating post:', error);
        }
    };

    const sendMessageDiscord = async (oldTime) => {
    try {
        const response = await axios.post(
        'https://ur-sg.com/sendMessageDiscordPhone',
        new URLSearchParams({
        userId: sessions.userSession.userId,
        playerfinder: true,              // if you want to trigger those fields
        voiceChat: newPost.voiceChat ? '1' : '0',
        roleLookingFor: newPost.roleLookingFor,
        rankLookingFor: newPost.rankLookingFor,
        extraMessage: newPost.description,
        account: newPost.account,
        game: newPost.game,
        oldTime,
        }).toString(),
        {
            headers: {
            'Authorization': `Bearer ${sessions.googleSession.token}`,
            },
        }
        );

        if (response.data.success === false) {
        console.error('Error from server:', response.data.error);
        return;
        }


    } catch (error) {
        console.error('Network or server error:', error);
    }
    };


    return (
    <SafeAreaView className="bg-gray-900 h-full dark:bg-whitePerso">
        {/* Filters */}
        <View className="mb-4">
            {/* Toggle Button */}
            <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-2 bg-gray-800 rounded-md"
                onPress={() => setFiltersVisible(!filtersVisible)}
            >
                <Text className="text-white font-semibold">Filters</Text>
                <Text className="text-white text-lg">
                {filtersVisible ? '▲' : '▼'}
                </Text>
            </TouchableOpacity>

            {/* Filters Section */}
            {filtersVisible && (
                <View className="mt-2 space-y-2">
                {/* Game Filter */}
                <Picker
                    selectedValue={filters.game}
                    onValueChange={v => handleFilterChange('game', v)}
                    dropdownIconColor={colorScheme !== 'dark' ? 'white' : 'black'}
                    style={{
                    color: colorScheme !== 'dark' ? 'white' : 'black',
                    backgroundColor: colorScheme !== 'dark' ? '#1f2937' : '#f3f4f6',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    }}
                >
                    <Picker.Item label="Any Game" value="" />
                    <Picker.Item label="League of Legends" value="League of Legends" />
                    <Picker.Item label="Valorant" value="Valorant" />
                </Picker>

                {/* Role Filter */}
                <Picker
                    selectedValue={filters.role}
                    onValueChange={v => handleFilterChange('role', v)}
                    dropdownIconColor={colorScheme !== 'dark' ? 'white' : 'black'}
                    style={{
                    color: colorScheme !== 'dark' ? 'white' : 'black',
                    backgroundColor: colorScheme !== 'dark' ? '#1f2937' : '#f3f4f6',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    }}
                >
                    <Picker.Item label="Any Role" value="" />
                    {availableRoles.map(role => (
                    <Picker.Item key={role} label={role} value={role} />
                    ))}
                </Picker>

                {/* Rank Filter */}
                <Picker
                    selectedValue={filters.rank}
                    onValueChange={v => handleFilterChange('rank', v)}
                    dropdownIconColor={colorScheme !== 'dark' ? 'white' : 'black'}
                    style={{
                    color: colorScheme !== 'dark' ? 'white' : 'black',
                    backgroundColor: colorScheme !== 'dark' ? '#1f2937' : '#f3f4f6',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    }}
                >
                    <Picker.Item label="Any Rank" value="" />
                    {availableRanks.map(rank => (
                    <Picker.Item key={rank} label={rank} value={rank} />
                    ))}
                </Picker>
            </View>
        )}
        </View>

        {/* Interested users alert */}
        {interestedUsers.length > 0 && (
        <TouchableOpacity
            onPress={() => setInterestedModalVisible(true)}
         >
            <View className="flex-row justify-between items-center mb-4 p-3 bg-mainred rounded-xl w-[90%] mx-auto">
                <Text className="text-white font-semibold">
                <Text className="font-bold">{interestedUsers.length}</Text> Teammate ready
                </Text>
            </View>
        </TouchableOpacity>
        )}

        {/* Posts list */}
        <ScrollView className="flex-1">
        {filteredPosts.map(post => (
            <PlayerCard
            key={post.pf_id}
            post={post}
            navigation={navigation}
            currentUserId={sessions.userSession.userId}
            onInterest={fetchPosts}
            />
        ))}
        </ScrollView>

        {/* Create Post button */}
        <TouchableOpacity
        onPress={openModal}
        className="mt-4 bg-mainred py-1 rounded-xl items-center mb-2 w-[90%] mx-auto">  
        <Text className="text-white dark:text-white font-bold text-lg">Create Post</Text>
        </TouchableOpacity>

        {/* Modal for creating a post */}
        <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/60">
            <View className="w-[90%] bg-gray-900 dark:bg-white p-6 rounded-2xl">
            <Text className="text-lg font-bold mb-4 text-white dark:text-black">Create a Post</Text>

            <TextInput
                placeholder="Description"
                placeholderTextColor={colorScheme !== 'dark' ? '#888' : '#666'}
                value={newPost.description}
                onChangeText={t => setNewPost({ ...newPost, description: t })}
                multiline
                className="border border-gray-700 dark:border-gray-300 rounded-md p-3 text-white dark:text-black mb-4"
                style={{ minHeight: 80 }}
            />

            <Picker
                selectedValue={newPost.roleLookingFor}
                onValueChange={v => setNewPost({ ...newPost, roleLookingFor: v })}
                dropdownIconColor={colorScheme !== 'dark' ? 'white' : 'black'}
                style={{
                color: colorScheme !== 'dark' ? 'white' : 'black',
                marginBottom: 12,
                backgroundColor: colorScheme !== 'dark' ? '#1f2937' : '#f3f4f6',
                borderRadius: 8,
                paddingHorizontal: 10,
                }}
            >
                {availableRoles.map(role => (
                <Picker.Item key={role} label={role} value={role} />
                ))}
            </Picker>

            <Picker
                selectedValue={newPost.rankLookingFor}
                onValueChange={v => setNewPost({ ...newPost, rankLookingFor: v })}
                dropdownIconColor={colorScheme !== 'dark' ? 'white' : 'black'}
                style={{
                color: colorScheme !== 'dark' ? 'white' : 'black',
                marginBottom: 12,
                backgroundColor: colorScheme !== 'dark' ? '#1f2937' : '#f3f4f6',
                borderRadius: 8,
                paddingHorizontal: 10,
                }}
            >
                {availableRanks.map(rank => (
                <Picker.Item key={rank} label={rank} value={rank} />
                ))}
            </Picker>

            <View className="flex-row justify-between mt-4 space-x-2">
                <TouchableOpacity
                onPress={createPost}
                className="flex-1 bg-red-500 dark:bg-green-600 py-3 rounded-xl items-center"
                >
                <Text className="text-white font-bold">Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-700 dark:bg-gray-300 py-3 rounded-xl items-center"
                >
                <Text className="text-white dark:text-black font-bold">Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>

        {/* Interested modal */}
        <InterestedModal
        visible={interestedModalVisible}
        onClose={() => setInterestedModalVisible(false)}
        interestedUsers={interestedUsers}
        currentUserId={sessions.userSession.userId}
        />
    </SafeAreaView>
    );

};

export default PlayerFinder;