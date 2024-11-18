import React, { createContext, useContext, useMemo, useState } from "react";

export interface IPostModalContext {
  isPostModalOpen: boolean;
  togglePostModalOpen(value: boolean): void;
}

export const PostModalContext = createContext<IPostModalContext>(
  {} as IPostModalContext
);

export const usePostModalContext = () => {
  const context = useContext(PostModalContext);

  if (!context) {
    throw new Error(
      "usePostModalContext must be used within a PostModalContextProvider"
    );
  }

  return context;
};

export const PostModalProvider = (props: any) => {
  const [postModalOpen, setPostModalOpen] = useState<boolean>(true);

  // Memoize the context value
  const contextValue = useMemo(() => {
    const togglePostModalOpen = (isOpen: boolean) => {
      setPostModalOpen(isOpen);
    };
    return {
      isPostModalOpen: postModalOpen,
      togglePostModalOpen: togglePostModalOpen,
    };
  }, [postModalOpen]);
  return (
    <PostModalContext.Provider value={contextValue}>
      {props.children}
    </PostModalContext.Provider>
  );
};

export default PostModalProvider;
