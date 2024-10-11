import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SessionContext } from '../../context/SessionContext';
import { router } from 'expo-router';
import axios from 'axios';
import { icons } from '../../constants';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';

const StoreAndLeaderboard = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState(items);
  const [allUsers, setAllUsers] = useState([]);
  const [activePage, setActivePage] = useState('store');
  const [itemMessages, setItemMessages] = useState({}); 
  const { sessions, setSession } = useContext(SessionContext);
  const { userId } = sessions.userSession;

  const fetchAllUsers = async () => {
    try {
      if (sessions.userSession && sessions.userSession.userId) {
        console.log("User session found:", sessions.userSession);
        const allUsersResponse = await axios.post('https://ur-sg.com/getAllUsers', {
          allUsers: 'allUsers'
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        const allUsersData = allUsersResponse.data;
        if (allUsersData.message !== 'Success') return;
        setAllUsers(allUsersData.allUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchItems = async () => {
    try {
      if (sessions.userSession && sessions.userSession.userId) {
        console.log("User session found:", sessions.userSession);
        const itemsResponse = await axios.post('https://ur-sg.com/getItems', {
          items: 'items'
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        const itemsData = itemsResponse.data;
        if (itemsData.message !== 'Success') return;
        setItems(itemsData.items);
        setFilteredItems(itemsData.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleBuyItem = async (itemId, itemCategory) => {
    console.log('Buying item:', itemId, itemCategory);
    const dataToSend = {
      itemId,
      userId,
    };

    const jsonData = JSON.stringify(dataToSend);

    try {
      let response;
      if (itemCategory === 'role') {
        response = await axios.post('https://ur-sg.com/buyRole', `param=${encodeURIComponent(jsonData)}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      } else {
        response = await axios.post('https://ur-sg.com/buyItem', `param=${encodeURIComponent(jsonData)}`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
      console.log('Success:', response.data);

      if (response.data.success) {
        setItemMessages(prevMessages => ({
          ...prevMessages,
          [itemId]: response.data.message
        }));
      } else {
        setItemMessages(prevMessages => ({
          ...prevMessages,
          [itemId]: response.data.message
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      setItemMessages(prevMessages => ({
        ...prevMessages,
        [itemId]: 'Purchase failed. Please try again.'
      }));
    }
  };

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
    const filtered = category === 'all' ? items : items.filter(item => item.items_category === category);
    setFilteredItems(filtered);
  };

  useEffect(() => {
    fetchAllUsers();
    fetchItems();
  }, []);

  const redirectToProfile = (friendId) => {
    setSession('friendId', friendId);
    router.push(`/profile`);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

  return (
    <ScrollView className="p-4 bg-gray-900 dark:bg-whitePerso">
      {/* Page Header with Navigation between Store and Leaderboard */}
      <View className="flex-row justify-around bg-mainred p-4 rounded-xl">
        <TouchableOpacity onPress={() => setActivePage('store')}>
          <Text className={`text-2xl ${activePage === 'store' ? 'text-white border-b-2 border-white' : 'text-white'}`}>
            {t('store')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActivePage('leaderboard')}>
          <Text className={`text-2xl ${activePage === 'leaderboard' ? 'text-white border-b-2 border-white' : 'text-white'}`}>
            {t('leaderboard')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditionally Render Store or Leaderboard */}
      {activePage === 'store' ? (
        <View className="my-4">
          {/* Category Filter */}
          <View className="items-center my-4">
            <Text className="text-xl mb-2 text-white dark:text-blackPerso">{t('filter-category')}:</Text>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={handleFilterChange}
              className="w-64 border border-mainred rounded"
              style={{ 
                width: 200, 
                color: colorScheme === 'dark' ? 'black' : 'white'
              }}
              dropdownIconColor={colorScheme === 'dark' ? 'black' : 'white'} 
            >
              <Picker.Item label="All Categories" value="all" />
              {Array.from(new Set(items.map(item => item.items_category))).map(category => (
                <Picker.Item label={capitalizeFirstLetter(category)} value={category} key={category} />
              ))}
            </Picker>
          </View>

          {/* Item Grid */}
          <View className="flex-row flex-wrap justify-center gap-4 w-full">
            {filteredItems.map(item => (
              <View key={`${item.items_id}-${selectedCategory}`} className={`${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800'} p-4 rounded-lg shadow w-full min-h-[200px] flex flex-col`}>
                <Image
                  source={{ uri: item.items_picture ? `https://ur-sg.com//public/images/store/${item.items_picture}` : 'https://ur-sg.com//public/images/store/defaultpicture.jpg' }}
                  className="h-40 object-cover w-full"
                />
                <View className="mt-2 w-full flex-1">
                  <Text className="text-2xl text-mainred">{item.items_name}</Text>
                  <Text className="text-lg text-white dark:text-blackPerso">
                    {item.items_price * (sessions.userSession.isVip ? 0.8 : 1)} <Image source={icons.soulHard} className="w-4 h-4" />
                  </Text>
                  <Text className="text-white dark:text-blackPerso">{item.items_desc.replace(/[\.:](\s|$)/g, '\n')}</Text>
                </View>

                {itemMessages[item.items_id] && (
                  <Text className="mt-2 text-center text-sm text-mainred">{itemMessages[item.items_id]}</Text>
                )}

                <TouchableOpacity
                  className="mt-4 bg-mainred text-white text-xl p-2 rounded-full"
                  onPress={() => handleBuyItem(item.items_id, item.items_category)}
                >
                  <Text className="text-white text-center">{t('buy')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="my-4">
          {/* Leaderboard Section */}
          <View className={`${colorScheme === 'dark' ? 'bg-gray-300' : 'bg-gray-800' } p-4 rounded-lg shadow`}>
            <Text className="text-center text-2xl font-bold mb-4 text-mainred">{t('leaderboard')}</Text>
            <View>
              {[...new Map(allUsers.map(user => [user.user_id, user])).values()]
                .sort((a, b) => b.user_currency - a.user_currency)
                .map((user, index) => (
                  <View className="flex-row justify-between items-center py-2 border-b border-gray-300" key={user.user_id}>
                    {/* Rank */}
                    <Text className="text-white dark:text-blackPerso w-8 text-center">{index + 1}</Text>
                    
                    {/* Username */}
                    <TouchableOpacity 
                      onPress={() => redirectToProfile(user.user_id)} 
                      className=""
                    >
                      <Text className="text-white dark:text-blackPerso text-center" style={{ minWidth: 100 }}>{user.user_username}</Text>
                    </TouchableOpacity>

                    {/* Currency */}
                    <Text className="text-white dark:text-blackPerso flex-1 text-center" style={{ minWidth: 80 }}>
                      {user.user_currency} 
                      <Image source={icons.soulHard} className="w-4 h-4 inline" />
                    </Text>

                    {/* VIP Status */}
                    <Text className="text-white dark:text-blackPerso w-24 text-center">
                      {user.user_isVip ? 'Premium' : 'Regular'}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default StoreAndLeaderboard;
