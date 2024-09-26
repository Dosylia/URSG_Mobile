import { View, Text, Image, SafeAreaView } from 'react-native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useData } from '../../context/DataContext';
import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused, badgeCount }) => {
  return (
    <View className="items-center justify-center gap-2 relative">
      <View className="relative">
        <Image
          source={icon}
          resizeMode="contain"
          style={{ tintColor: color, width: 24, height: 24 }}
          className="w-6 h-6"
        />
        {badgeCount > 0 && (
          <View className="absolute -top-1 -right-5 w-5 h-5 bg-red-600 rounded-full items-center justify-center z-10">
            <Text className="text-white text-xs font-bold">{badgeCount}</Text>
          </View>
        )}
      </View>
      <Text className={`${focused ? 'font-semibold' : 'font-normal'} text-xs`} style={{ color: color }}>
        {name}
      </Text>
    </View>
  );
}; 

const formatCurrency = (value) =>{
  if (value >= 1000) {
      return Math.floor(value / 1000) + 'k';
  }
  return value;
}

const TabsLayout = () => {
  const { colorScheme } = useColorScheme();
  const { unreadMessage, pendingFriendRequest, currency } = useData();
  const backgroundColorClass = colorScheme === 'dark' ? '#595b5e' : '#302e31';
  const borderCorlor = colorScheme === 'dark' ? '#7f8287' : '#232533';
  const tabColor = colorScheme === 'dark' ? '#ffffff' : '#CDCDE0';
  const backgroundColorHeader = colorScheme === 'dark' ? '#ffffff' : '#111827';

  console.log('Currency in TabsLayout:', currency);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 50, backgroundColor: backgroundColorHeader }}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#e74057',
          tabBarInactiveTintColor: tabColor,
          tabBarStyle: {
            backgroundColor: backgroundColorClass,
            borderTopWidth: 1,
            borderTopColor: borderCorlor,
            height: 84,
          },
        }}
      >
        <Tabs.Screen
          name="swiping"
          options={{
            title: 'Swiping',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.swipeIcon}
                color={color}
                name="Swiping"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.bubbleChat}
                color={color}
                name="Chat"
                focused={focused}
                badgeCount={unreadMessage}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="store"
          options={{
            title: 'store',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center justify-center gap-2 relative">
              <View className="relative">
                <Image
                  source={icons.soulHard}
                  resizeMode="contain"
                  style={{ tintColor: color, width: 30, height: 30 }}
                  className="w-6 h-6"
                />
              </View>
              <Text className={`${focused ? 'font-semibold' : 'font-normal'} text-xs`} style={{ color: color }}>
                {formatCurrency(currency)}
              </Text>
            </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}
                badgeCount={pendingFriendRequest}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default TabsLayout;
