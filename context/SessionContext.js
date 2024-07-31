import React, { createContext, useState } from 'react';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessions, setSessions] = useState({
    googleSession: {},
    userSession: {},
    leagueSession: {},
    lookingforSession: {}
  });

  const setSession = (type, data) => {
    setSessions(prevSessions => ({
      ...prevSessions,
      [type]: data
    }));
  };

  return (
    <SessionContext.Provider value={{ sessions, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};