import React, { createContext, useState, useEffect } from "react";

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [selectedColor, setSelectedColor] = useState(
    localStorage.getItem("topbarColor") || "blue1000"
  );

  useEffect(() => {
    const updateColor = () => {
      const newColor = localStorage.getItem("topbarColor") || "blue1000";
      setSelectedColor(newColor);
    };

    // Listen for storage events
    window.addEventListener("storage", updateColor);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("storage", updateColor);
    };
  }, []);

  const changeColor = (color) => {
    setSelectedColor(color);
    localStorage.setItem("topbarColor", color);
    window.dispatchEvent(new Event("storage")); // Trigger event for same-tab updates
  };

  return (
    <ColorContext.Provider value={{ selectedColor, changeColor }}>
      {children}
    </ColorContext.Provider>
  );
};
