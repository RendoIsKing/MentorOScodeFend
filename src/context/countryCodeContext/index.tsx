 "use client";

import React, { createContext, useState, useMemo } from "react";

interface ICountryCodeContext {
  countryCode: string;
  updateCountryCode: (code: string) => void;

}

export const CountryCodeContext = createContext<ICountryCodeContext>({
  countryCode: "",
  updateCountryCode: () => {}
});

interface ICountryCodeProviderProps {
  children: React.ReactNode;
}

export const useCountryCodeContext = () => {
  const context = React.useContext(CountryCodeContext);

  if (!context) {
    throw new Error("The component is not within a CountryCodeProvider");
  }

  return context;
};

const CountryCodeProvider: React.FC<ICountryCodeProviderProps> = ({
  children,
}) => {
  // Default to Norway for mentorio.no (prevents sign-in failures when user enters local phone number without +country).
  const [countryCode, setCountryCode] = useState<string>(() => {
    try {
      const v = window.localStorage.getItem("countryCode");
      return v ? String(v) : "NO";
    } catch {
      return "NO";
    }
  });

  // Memoize the context value
  const contextValue = useMemo(() => {
    const updateCountryCode = (code: string) => {
        setCountryCode(code);
        try { window.localStorage.setItem("countryCode", String(code)); } catch {}
    };
    return {
        countryCode: countryCode,
      updateCountryCode: updateCountryCode,
    };
  }, [countryCode]);

  return (
    <CountryCodeContext.Provider value={contextValue}>
      {children}
    </CountryCodeContext.Provider>
  );
};

export default CountryCodeProvider;
