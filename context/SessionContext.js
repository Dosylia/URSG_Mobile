import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState({
    googleSession: {},
    userSession: {},
    leagueSession: {},
    valorantSession: {},
    lookingforSession: {},
    friendId: null
  });

  // Load sessions from AsyncStorage
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const storedSessions = await AsyncStorage.getItem('userSessions');
        if (storedSessions) {
          setSessions(JSON.parse(storedSessions));
        }
      } catch (error) {
        console.error('Error loading sessions from storage:', error);
      }
    };

    loadSessions();
  }, []);

  const setSession = async (type, data, callback) => {

    setSessions(prevSessions => {
      let updatedSessions;

      if (type === 'reset') {
        updatedSessions = {
          googleSession: {},
          userSession: {},
          leagueSession: {},
          valorantSession: {},
          lookingforSession: {},
          friendId: null
        };
      } else if (type === 'friendId') {
        updatedSessions = {
          ...prevSessions,
          [type]: data
        };
      } else {
        // If updating leagueSession or valorantSession, also update the `game` field in userSession
        if (type === 'leagueSession' || type === 'valorantSession') {
          const gameName = type === 'leagueSession' ? 'League of Legends' : 'Valorant';

          updatedSessions = {
            ...prevSessions,
            [type]: {
              ...prevSessions[type],
              ...data
            },
            userSession: {
              ...prevSessions.userSession,
              game: gameName // Set the game field based on the session type
            }
          };
        } else {
          updatedSessions = {
            ...prevSessions,
            [type]: {
              ...prevSessions[type],
              ...data
            }
          };
        }
      }

      console.log(`Updated sessions ${type}:`, updatedSessions);
      
      // Save updated sessions to AsyncStorage inside the setSessions callback
      AsyncStorage.setItem('userSessions', JSON.stringify(updatedSessions))
        .then(() => {
        })
        .catch(error => {
          console.error('Error saving sessions to storage:', error);
        });

      if (callback) callback(updatedSessions);
      return updatedSessions;
    });
  };

  return (
    <SessionContext.Provider value={{ sessions, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};
