import useFCM from "@/utils/hooks/useFCM";
import { createContext, useState, useContext, ReactNode, useMemo } from "react";

type UserTagsContextType = {
  homeHeaderFilter: string;
  setHomeHeaderFilter: (show: string) => void;
};

const HomeFeedHeaderContext = createContext<UserTagsContextType | undefined>(
  undefined
);

export const useHomeHeaderFilter = () => {
  const context = useContext(HomeFeedHeaderContext);
  if (!context) {
    throw new Error("useHomeHeaderFilter must be used within a UserProvider");
  }
  return context;
};

export const HomeHeaderFilterProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [homeHeaderFilter, setHomeHeaderFilter] = useState("foryou");

  const { messages, fcmToken } = useFCM();

  const value = useMemo(
    () => ({
      homeHeaderFilter,
      setHomeHeaderFilter,
    }),
    [homeHeaderFilter]
  );

  return (
    <HomeFeedHeaderContext.Provider value={value}>
      {children}
    </HomeFeedHeaderContext.Provider>
  );
};

export default HomeFeedHeaderContext;
