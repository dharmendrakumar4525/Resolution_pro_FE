// src/context/TabContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

export const TabContext = createContext();

const TabProvider = ({ children }) => {
  const [openTabs, setOpenTabs] = useState(() => {
    const storedTabs = JSON.parse(localStorage.getItem("openTabs"));
    return storedTabs ? storedTabs : ["/"];
  });

  useEffect(() => {
    localStorage.setItem("openTabs", JSON.stringify(openTabs));
  }, [openTabs]);

  const handleTabChange = (path) => {
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path]);
    } else {
      // Optionally handle tab activation without navigation
      console.log(`Tab already open: ${path}`);
    }
  };

  const handleTabClose = (path) => {
    setOpenTabs((prevTabs) => prevTabs.filter((tab) => tab !== path));
  };

  // Add a function to clear all open tabs
  const clearTabs = () => {
    setOpenTabs([]);
  };

  return (
    <TabContext.Provider
      value={{ openTabs, handleTabChange, handleTabClose, clearTabs }}
    >
      {children}
    </TabContext.Provider>
  );
};

const useTabContext = () => useContext(TabContext);

export { TabProvider, useTabContext };
