import { User, UserBase } from "@/contracts/haveme/UserBase";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { selectIsAuthenticated } from "@/redux/slices/auth";
import { useTypedSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";

export interface IUserOnboardingContext {
  user: UserBase | null;
}

export const UserOnboardingContext = createContext<IUserOnboardingContext>(
  {} as IUserOnboardingContext
);

export const useUserOnboardingContext = () => {
  const context = useContext(UserOnboardingContext);

  if (!context) {
    throw new Error(
      "useUserOnboardingContext must be used within a UserOnboardingContextProvider"
    );
  }

  return context;
};

export const UserOnboardingContextProvider = (props: any) => {
  const isLoggedIn = useTypedSelector(selectIsAuthenticated);
  const router = useRouter();

  const hasSessionCookie = typeof document !== 'undefined' && document.cookie.includes('auth_token=');

  const { userData, isUserDataLoading } = useGetUserDetailsQuery(undefined, {
    // Only fetch when a session cookie is present to avoid CORS/preflight loops
    skip: !hasSessionCookie,
    selectFromResult: ({ data, isLoading }) => {
      return {
        userData: data?.data,
        isUserDataLoading: isLoading,
      };
    },
  });

  const USER_INFO = "/user-info";
  const USER_PHOTO = "/user-photo";
  const USER_TAGS = "/user-tags";
  const AGE_CONFIRMATION = "/age-confirmation";
  const HOME = "/home";

  const getNextRoute = useCallback(
    (userData: UserBase) => {
      switch (true) {
        case !userData.hasPersonalInfo:
          return USER_INFO;
        case !userData.hasPhotoInfo:
          return USER_PHOTO;
        case !userData.hasSelectedInterest:
          return USER_TAGS;
        default:
          return HOME;
      }
    },
    [userData]
  );

  // useEffect(() => {
  //   if (!userData) return;

  //   // const nextRoute = getNextRoute(userData);
  //   // router.push(nextRoute);
  //   const nextRoute = getNextRoute(userData);
  //   router.push(nextRoute);
  // }, [userData, getNextRoute]);

  const contextValue: IUserOnboardingContext = {
    user: userData,
  };

  return (
    <UserOnboardingContext.Provider value={contextValue}>
      {props.children}
    </UserOnboardingContext.Provider>
  );
};

export default UserOnboardingContext;
