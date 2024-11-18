// import CircularProgress from '@mui/material/CircularProgress';
import React from "react";

import { LoaderIcon } from "lucide-react";

interface LoadingComponentProps {
  loading: boolean;
  children: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingComponentProps> = ({
  loading,
  children,
}) => {
  return (
    <>
      {loading ? (
        <div className="w-full h-full flex justify-center items-center">
          <LoaderIcon className="my-28 h-16 w-16 text-primary/60 animate-spin" />
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default LoadingSpinner;
