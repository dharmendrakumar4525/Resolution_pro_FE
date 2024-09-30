import React, { createContext, useState, useContext } from "react";

const DetailedViewContext = createContext();

export const useDetailedView = () => useContext(DetailedViewContext);

export const DetailedViewProvider = ({ children }) => {
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetailedView = (resolution) => {
    console.log("----resolution----", resolution);
    setSelectedResolution(resolution);
    setIsOpen(true);
  };

  const closeDetailedView = () => {
    setIsOpen(false);
    setSelectedResolution(null);
  };

  return (
    <DetailedViewContext.Provider
      value={{
        selectedResolution,
        isOpen,
        openDetailedView,
        closeDetailedView,
      }}
    >
      {children}
    </DetailedViewContext.Provider>
  );
};
