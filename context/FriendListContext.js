import React, { createContext, useContext, useEffect, useState } from 'react';
import { SessionContext } from './SessionContext';
import axios from 'axios';


const FriendListContext = createContext();

export const useFriendList = () => {
  return useContext(FriendListContext);
};

export const FriendListProvider = ({ children }) => {
const { sessions } = useContext(SessionContext);
  const [friendList, setFriendList] = useState([]);

  const refreshFriendList = async (userId) => {
    try {
        const friendsResponse = await axios.post('https://ur-sg.com/getFriendlistPhone', new URLSearchParams({ userId }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessions.googleSession.token}`,
        },
      });
      
      if (friendsResponse.data.success) {
        setFriendList(friendsResponse.data.friendlist);
      } else {
        console.log('Failed to refresh friend list:', friendsResponse.data.error);
        setFriendList([]);
      }
    } catch (error) {
      console.log('Error fetching friend list:', error);
    }
  };

  useEffect(() => {
    if (!sessions.userSession || !sessions.userSession.userId) return;
  
    const { userId } = sessions.userSession;
  
    refreshFriendList(userId);
  
    const intervalId = setInterval(() => refreshFriendList(userId), 10000);
  
    return () => clearInterval(intervalId);
  }, [sessions.userSession]);

  return (
    <FriendListContext.Provider value={{ friendList, setFriendList, refreshFriendList }}>
      {children}
    </FriendListContext.Provider>
  );
};