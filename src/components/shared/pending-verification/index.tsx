import React from "react";
import { ABeeZee } from "next/font/google";
import { cn } from "@/lib/utils";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IPendingVerificationProps {
  imgSrc?: string;
  title?: string;
  description?: string;
  type?: string;
}

const PendingVerification: React.FC<IPendingVerificationProps> = ({
  imgSrc,
  title,
  description,
  type = "muted",
}) => {
  return (
    <div className={cn(`flex py-3 px-4 w-full gap-2`, `bg-${type}`)}>
      <div>
        {/* <img
          src="/assets/images/pending-verification/pending-verification.svg"
          alt="pending-verification"
        /> */}
        <img src={imgSrc} alt="pending-verification" />
      </div>
      <div>
        <div className={`text-xl  ${fontItalic.className}`}>
          {/* {`We're reviewing your ID`} */}
          {title}
        </div>
        <div className="text-sm text-muted-foreground">
          {/* This process may take up to 2 days. You will be notified once the
          review is completed. After that, you can post your posts. */}
          {description}
        </div>
      </div>
    </div>
  );
};

export default PendingVerification;
