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
  const [countryCode, setCountryCode] = useState<string>("");

  // Memoize the context value
  const contextValue = useMemo(() => {
    const updateCountryCode = (code: string) => {
        setCountryCode(code)
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
