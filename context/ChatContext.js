import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const [chatPage, setChatPage] = useState(false); // Default is false
    
    const setChatPageState = (value) => {
      setChatPage(value); // Update chatPage state
    };
  
    return (
      <ChatContext.Provider value={{ chatPage, setChatPageState }}>
        {children}
      </ChatContext.Provider>
    );
  };
  
