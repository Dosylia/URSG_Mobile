import React, { createContext, useState } from 'react';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState({
    googleSession: {},
    userSession: {},
    leagueSession: {},
    lookingforSession: {}
  });

  const setSession = (type, data, callback) => {
    console.log(`Setting session: ${type}`, data);
    setSessions(prevSessions => {
      const updatedSessions = {
        ...prevSessions,
        [type]: data
      };
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