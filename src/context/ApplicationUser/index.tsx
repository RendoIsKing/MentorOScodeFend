import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { selectIsAuthenticated } from "@/redux/slices/auth";
import { useTypedSelector } from "@/redux/store";
import React, { createContext, useContext, useMemo } from "react";

export interface IApplicationUserContext {
  user: any | null;
}

export const ApplicationUserContext = createContext<IApplicationUserContext>(
  {} as IApplicationUserContext
);

export const useApplicationUserContext = () => {
  const context = useContext(ApplicationUserContext);

  if (!context) {
    throw new Error(
      "useApplicationUserContext must be used within a ApplicationUserContextProvider"
    );
  }

  return context;
};

export const ApplicationUserContextProvider = (props: any) => {
  const isLoggedIn = useTypedSelector(selectIsAuthenticated);

  const { userData, isUserDataLoading } = useGetUserDetailsQuery(undefined, {
    skip: !isLoggedIn,
    selectFromResult: ({ data, isLoading }) => {
      return {
        userData: data?.data,
        isUserDataLoading: isLoading,
      };
    },
  });
  return (
    <ApplicationUserContext.Provider
      value={{
        user: userData,
      }}
    >
      {props.children}
    </ApplicationUserContext.Provider>
  );
};

export default ApplicationUserContext;
