import { useMemo } from "react";
import { ABeeZee } from "next/font/google";

export const useAppFonts = () => {
  const fontRegular = ABeeZee({
    subsets: ["latin"],
    weight: ["400"],
    style: "normal",
  });

  const fontItalic = ABeeZee({
    subsets: ["latin"],
    weight: ["400"],
    style: "italic",
  });

  return [fontRegular, fontItalic];
};
