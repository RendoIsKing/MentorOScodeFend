"use client";
import { useState, useEffect } from "react";

const getOrientation = () => {
  if (typeof window !== "undefined") {
    return window.screen.orientation.type;
  }
};

const useOrientation = () => {
  const [orientation, setOrientation] = useState(getOrientation());

  const updateOrientation = () => {
    setOrientation(getOrientation());
  };

  useEffect(() => {
    window.addEventListener("orientationchange", updateOrientation);
    return () => {
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  return orientation;
};

export default useOrientation;
