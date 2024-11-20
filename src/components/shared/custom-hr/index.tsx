import React from "react";

const CustomHr = () => {
  return (
    <div className="inline-flex relative items-center justify-center w-full">
      <hr className="w-full h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">
        OR
      </span>
    </div>
  );
};

export default CustomHr;
