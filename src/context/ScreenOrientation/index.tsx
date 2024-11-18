import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

export type ScreenOrientation =
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

export interface IScreenOrientationContext {
  isOrientationSupported?: boolean;
  hardwareOrientation: ScreenOrientation | null;
  softwareOrientation: ScreenOrientation | null;
  effectiveOrientation: ScreenOrientation;
  setSoftwareOrientation: Dispatch<SetStateAction<ScreenOrientation | null>>;
}

const defaultContextValue = {
  hardwareOrientation: null,
  softwareOrientation: null,
  effectiveOrientation: "portrait-primary" as ScreenOrientation,
  setSoftwareOrientation: () => {},
};

export const ScreenOrientationContext =
  createContext<IScreenOrientationContext>(defaultContextValue);

export const useScreenOrientationContext = () => {
  const context = useContext(ScreenOrientationContext);
  if (context === undefined) {
    throw new Error(
      "useScreenOrientation must be used within a ScreenOrientationProvider"
    );
  }
  return context;
};

interface ScreenOrientationProviderProps {
  children: ReactNode;
}

export const ScreenOrientationProvider: React.FC<
  ScreenOrientationProviderProps
> = ({ children }) => {
  const [isOrientationSupported, setIsOrientationSupported] =
    useState<boolean>(false);
  const [hardwareOrientation, setHardwareOrientation] =
    useState<ScreenOrientation | null>(null);
  const [softwareOrientation, setSoftwareOrientation] =
    useState<ScreenOrientation | null>("portrait-primary");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOrientationChange = () => {
        setHardwareOrientation(
          window.screen.orientation.type as ScreenOrientation
        );
      };

      window.addEventListener("orientationchange", handleOrientationChange);
      handleOrientationChange();

      return () => {
        window.removeEventListener(
          "orientationchange",
          handleOrientationChange
        );
      };
    }
  }, []);

  const computeEffectiveOrientation = (
    hardware: ScreenOrientation | null,
    software: ScreenOrientation | null
  ): ScreenOrientation => {
    if (software && hardware) {
      if (software.includes("landscape") && hardware.includes("landscape")) {
        return "landscape-primary";
      } else if (
        software.includes("portrait") &&
        hardware.includes("portrait")
      ) {
        return "portrait-primary";
      } else if (
        software.includes("landscape") &&
        hardware.includes("portrait")
      ) {
        return "landscape-primary";
      } else if (
        software.includes("portrait") &&
        hardware.includes("landscape")
      ) {
        return "portrait-primary";
      }
    } else if (software) {
      return software.includes("landscape")
        ? "landscape-primary"
        : "portrait-primary";
    } else if (hardware) {
      return hardware.includes("landscape")
        ? "landscape-primary"
        : "portrait-primary";
    }
    return "portrait-primary";
  };

  const effectiveOrientation = useMemo(
    () => computeEffectiveOrientation(hardwareOrientation, softwareOrientation),
    [hardwareOrientation, softwareOrientation]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      switch (window.screen.orientation.type) {
        case "landscape-primary":
        case "landscape-secondary":
        case "portrait-secondary":
        case "portrait-primary":
          setIsOrientationSupported(true);
          break;
        default:
          setIsOrientationSupported(false);
          break;
      }
    }
  }, [hardwareOrientation]);

  const contextValue = useMemo(
    () => ({
      hardwareOrientation,
      isOrientationSupported,
      softwareOrientation,
      effectiveOrientation,
      setSoftwareOrientation,
    }),
    [
      hardwareOrientation,
      softwareOrientation,
      isOrientationSupported,
      effectiveOrientation,
    ]
  );

  return (
    <ScreenOrientationContext.Provider value={contextValue}>
      {children}
    </ScreenOrientationContext.Provider>
  );
};
