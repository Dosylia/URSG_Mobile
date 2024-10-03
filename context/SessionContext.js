import React, { createContext, useState } from 'react';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState({
    googleSession: {},
    userSession: {},
    leagueSession: {},
    valorantSession: {},
    lookingforSession: {},
    friendId: null // Ensure this is set as a primitive
  });

  const setSession = (type, data, callback) => {
    console.log(`Setting session: ${type}`, data);
  
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
