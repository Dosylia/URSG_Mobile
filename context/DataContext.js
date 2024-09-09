import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { SessionContext } from './SessionContext';
import * as Notifications from 'expo-notifications';
import * as Device from "expo-device";
import { Platform } from 'react-native';

// Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create Context
const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { sessions } = useContext(SessionContext);
  const [unreadMessage, setUnreadMessage] = useState(0);
  const [pendingFriendRequest, setPendingFriendRequest] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState("");
  
  // Register for push notifications
  useEffect(() => {
    const registerToken = async () => {
      try {
        console.log("Registering for push notifications...");
        const token = await registerForPushNotificationsAsync();
        
        if (!token) {
          console.log('No token received from push notification registration.');
          return;
        }
  
        const formData = new URLSearchParams();
        formData.append('userId', sessions.userSession.userId);
        formData.append('token', token);
  
        const response = await axios.post('https://ur-sg.com/registerToken', formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
  
        if (response.data.message === 'Success') {
          console.log('Token successfully registered:', response.data);
        } else {
          console.warn('Failed to register token:', response.data.message);
        }
        
        console.log("Push token:", token);
        setExpoPushToken(token);
      } catch (err) {
        console.error("Error registering for push notifications:", err);
      }
    };
  
    registerToken();
  }, [sessions.userSession.userId]);

  // Function to register push notifications
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "94f54469-7266-46df-b5a2-c4628f8d9a8d", // Make sure this projectId is correct for your Expo project
        })
      ).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  const fetchUnreadMessage = async (userId) => {
    try {
      const response = await axios.post('https://ur-sg.com/getUnreadMessage',
        new URLSearchParams({ userId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = response.data;

      if (data.success) {
        let count = 0;

        data.unreadCount.forEach((unreadCount) => {
          if (unreadCount.unread_count > 0) {
            count += unreadCount.unread_count;
          }
        });
        setUnreadMessage(count);
      } else {
        console.log('Failed to fetch unread messages:', data.error);
        setUnreadMessage(0);
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error.message);
      setUnreadMessage(0);
    }
  };

  const fetchFriendRequest = async (userId) => {
    try {
      const response = await axios.post('https://ur-sg.com/getFriendRequest',
        new URLSearchParams({ userId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = response.data;
      if (data.success) {
        const pendingCount = data.pendingCount.pendingFriendRequest || 0;
        setPendingFriendRequest(pendingCount);
      } else {
        console.log('Failed to fetch friend requests:', data.error);
        setPendingFriendRequest(0);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error.message);
      setPendingFriendRequest(0);
    }
  };

  useEffect(() => {
    const totalBadgeCount = unreadMessage + pendingFriendRequest;
    setBadgeCount(totalBadgeCount);
    setBadgeAsync(totalBadgeCount);
  }, [unreadMessage, pendingFriendRequest]);

  const setBadgeAsync = async (count) => {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('Badge count set to:', count);
    } catch (error) {
      console.error("Error setting badge count:", error.message);
    }
  };

  useEffect(() => {
    if (!sessions.userSession || !sessions.userSession.userId) return;
  
    const { userId } = sessions.userSession;
  
    const fetchData = () => {
      console.log('Fetching data...');
      fetchFriendRequest(userId);
      fetchUnreadMessage(userId);
    };
  
    fetchData();
  
    const intervalId = setInterval(fetchData, 10000);
  
    return () => clearInterval(intervalId);
  }, [sessions.userSession]);

  return (
    <DataContext.Provider value={{ unreadMessage, pendingFriendRequest, badgeCount }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
