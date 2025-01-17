import { useEffect, useState } from "react";

const useIntersectionObserver = (callback, options) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (callback) callback(entry);
      });
    }, options);

    const currentElements = elements.filter(Boolean);

    currentElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      currentElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [elements, options, callback]);

  return setElements;
};

export default useIntersectionObserver;
