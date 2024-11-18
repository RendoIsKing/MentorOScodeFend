import React, { createContext, useState, useMemo } from "react";

interface IContentUploadContext {
  isContentUploadOpen: boolean;
  toggleContentUploadOpen: (isOpen: boolean) => void;
}

export const ContentUploadContext = createContext<IContentUploadContext>({
  isContentUploadOpen: false,
  toggleContentUploadOpen: () => {}, // Initial function placeholder
});

interface IContentUploadProviderProps {
  children: React.ReactNode;
}

export const useContentUploadContext = () => {
  const context = React.useContext(ContentUploadContext);

  if (!context) {
    throw new Error("The component is not within a ContentUploadProvider");
  }

  return context;
};

const ContentUploadProvider: React.FC<IContentUploadProviderProps> = ({
  children,
}) => {
  const [contentUploadOpen, setContentUploadOpen] = useState<boolean>(false);

  // Memoize the context value
  const contextValue = useMemo(() => {
    const toggleContentUploadOpen = (isOpen: boolean) => {
      setContentUploadOpen(isOpen);
    };
    return {
      isContentUploadOpen: contentUploadOpen,
      toggleContentUploadOpen: toggleContentUploadOpen,
    };
  }, [contentUploadOpen]);

  return (
    <ContentUploadContext.Provider value={contextValue}>
      {children}
    </ContentUploadContext.Provider>
  );
};

export default ContentUploadProvider;
