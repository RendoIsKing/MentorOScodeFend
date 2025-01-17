import React, { useMemo } from "react";
import {
  IScreenOrientationContext,
  ScreenOrientation,
  useScreenOrientationContext,
} from "@/context/ScreenOrientation";
import { useMediaQuery } from "./use-media-query";

export const useClientHardwareInfo = () => {
  const {
    isOrientationSupported,
    effectiveOrientation: orientation,
    setSoftwareOrientation,
    softwareOrientation,
    hardwareOrientation,
  }: IScreenOrientationContext = useScreenOrientationContext();

  // const isMobileDevice: boolean = useMediaQuery(`(max-width: 768px)`);

  const isMobileDevice: boolean = useMemo(() => {
    // TODO: either get user Agent from Window properties or Request Headers
    if (typeof window !== "undefined") {
      const userAgent: string = window.navigator.userAgent ?? "";

      if (!userAgent) {
        return isOrientationSupported;
      } else {
        let isMobileAgent = false;
        if (
          userAgent.match(/Android/i) ||
          userAgent.match(/webOS/i) ||
          userAgent.match(/iPhone/i) ||
          userAgent.match(/iPad/i) ||
          userAgent.match(/iPod/i) ||
          userAgent.match(/BlackBerry/i) ||
          userAgent.match(/Windows Phone/i)
        ) {
          isMobileAgent = true;
        } else {
          isMobileAgent = false;
        }

        return isMobileAgent && isOrientationSupported;
      }
    }
  }, [isOrientationSupported]);

  return {
    isMobile: isMobileDevice,
    orientation: orientation,
    setSoftwareOrientation: setSoftwareOrientation,
    softwareOrientation: softwareOrientation,
    hardwareOrientation: hardwareOrientation,
  };
};
