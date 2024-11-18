import React from "react";
import { Label } from "@/components/ui/label";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface ISystemNotificationProps {
  notifactionName: string;
  description: string;
}

const SystemNotificationWithData: React.FC<ISystemNotificationProps> = ({
  notifactionName,
  description,
}) => {
  return (
    <div>
      <div className={`mt-3 ${fontItalic.className}`}>
        <Label className="text-xl">{notifactionName}</Label>
      </div>
      <div className="mb-3">
        <Label className="text-muted-foreground text-base">{description}</Label>
      </div>
      <div className="border-t border-gray-500/100"></div>
    </div>
  );
};

export default SystemNotificationWithData;
