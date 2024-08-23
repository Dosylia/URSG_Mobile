import React, { createContext, useState } from 'react';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState({
    googleSession: {},
    userSession: {},
    leagueSession: {},
    lookingforSession: {},
    friendId: null // Ensure this is set as a primitive
  });

  const setSession = (type, data, callback) => {
    console.log(`Setting session: ${type}`, data);
  
    setSessions(prevSessions => {
      let updatedSessions;
  
      // Check if the type corresponds to a primitive value like friendId
      if (type === 'friendId') {
        updatedSessions = {
          ...prevSessions,
          [type]: data  // Directly assign the new value for primitives
        };
      } else {
        updatedSessions = {
          ...prevSessions,
          [type]: {
            ...prevSessions[type], // Preserve existing data for the session type
            ...data                // Merge with new data
          }
        };
      }
  
      console.log('Updated sessions:', updatedSessions);
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