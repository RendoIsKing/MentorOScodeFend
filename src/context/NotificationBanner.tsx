import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useUserOnboardingContext } from "./UserOnboarding";

export interface INotificationBannerContext {
  banners: {
    content: IAppBanner[];
    add: (banner: IAppBanner) => void;
    remove: (bannerId: string) => void;
  };
}

export interface IAppBanner {
  id: string;
  cta?: React.ReactNode;
  type: "primary" | "destructive" | "secondary" | "muted" | "background";
  imgSrc: string;
  title: string;
  description: string;
}

export const NotificationBannerContext =
  createContext<INotificationBannerContext>({} as INotificationBannerContext);

export const useNotificationBannerContext = () => {
  const context = useContext(NotificationBannerContext);

  if (!context) {
    throw new Error(
      "useNotificationBannerContext must be used within a NotificationBannerContextProvider"
    );
  }

  return context;
};

export const NotificationBannerContextProvider = (props: any) => {
  const [open, setOpen] = React.useState(false);
  const [banners, setBanners] = React.useState<IAppBanner[]>([]);
  const { user } = useUserOnboardingContext();
  const handleClose = () => setOpen(false);

  const addBanner = useCallback((banner: IAppBanner) => {
    // add or update banner based on id
    setBanners((bannersInState) => {
      const bannerIndex = bannersInState.findIndex((b) => b.id === banner.id);
      if (bannerIndex !== -1) {
        const newBanners = [...bannersInState];
        newBanners[bannerIndex] = banner;
        return newBanners;
      } else {
        // add new banner
        return [...bannersInState, banner];
      }
    });
  }, []);

  const removeBanner = useCallback((bannerId: string) => {
    setBanners((banners) => banners.filter((banner) => banner.id !== bannerId));
  }, []);

  const hasDocumentVerified = "verifying-users";
  useEffect(() => {
    if (!user?.hasDocumentVerified) {
      addBanner({
        id: hasDocumentVerified,
        title: `We're reviewing your ID`,
        type: "muted",
        imgSrc: "/assets/images/pending-verification/pending-verification.svg",
        description: `This process may take up to 2 days. You will be notified once the
                review is completed. After that, you can post your posts`,
      });
    } else {
      removeBanner(hasDocumentVerified);
    }
  }, [removeBanner, addBanner, user?.hasDocumentVerified]);

  return (
    <NotificationBannerContext.Provider
      value={{
        banners: {
          content: banners,
          add: addBanner,
          remove: removeBanner,
        },
      }}
    >
      {props.children}
    </NotificationBannerContext.Provider>
  );
};

export default NotificationBannerContext;
