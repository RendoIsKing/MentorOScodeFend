import React from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface INotificationWithDescriptionProps {
  imageUrl: string;
  userImageUrl: string;
  title: string;
  type: string;
  description: string;
  // name: string;
  // time: string;
  // reply: string;
}

const NotificationDescription: React.FC<INotificationWithDescriptionProps> = ({
  imageUrl,
  userImageUrl,
  title,
  type,
  description,
  // name,
  // time,
  // description,
  // reply,
}) => {
  return (
    <div>
      <div className="flex justify-between">
        <div className="flex mt-3 mb-4">
          <div className="flex justify-between">
            <Image src={imageUrl} width={45} height={45} alt="post_img" />
            <div className="flex flex-col relative left-2">
              <Label>
                {title}{" "}
                <span className="text-sm text-muted-foreground">
                  {description}
                </span>{" "}
              </Label>
              <div className="text-sm text-muted-foreground mt-2">
                {/* <span className="text-primary">{title} </span> */}
                <Label>{type}</Label>
              </div>
            </div>
          </div>
        </div>
        <Image src={userImageUrl} alt="more" width={45} height={45} />
      </div>

      <Separator />
    </div>
  );
};

export default NotificationDescription;
