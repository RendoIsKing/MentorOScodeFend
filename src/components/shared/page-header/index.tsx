// import { fontItalic }/ from "@/app/layout";
import React from "react";
import { ABeeZee } from "next/font/google";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IPageHeaderProps {
  title: string;
  description: string;
}

const PageHeader: React.FC<IPageHeaderProps> = ({ title, description }) => {
  return (
    <div>
      <h1 className={`${fontItalic.className} text-3xl`}>{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );
};

export default PageHeader;
