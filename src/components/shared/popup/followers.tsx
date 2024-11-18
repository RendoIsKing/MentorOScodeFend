import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import Followers from "./followers-tab";
import { ABeeZee } from "next/font/google";
import millify from "millify";
import { useUserOnboardingContext } from "@/context/UserOnboarding";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

export interface IFollowerPopupProps {
  followersCount?: number;
  followingCount?: number;
  subscribersCount?: number;
  isOwnProfile?: boolean;
}
const FollowerPopup: React.FC<IFollowerPopupProps> = ({
  followersCount,
  followingCount,
  subscribersCount,
  isOwnProfile,
}) => {
  const { user } = useUserOnboardingContext();

  const [tabValue, setTabValue] = useState<string>("");

  return (
    <Dialog>
      {isOwnProfile ? (
        <>
          <DialogTrigger asChild>
            <div
              className="cursor-pointer"
              onClick={() => setTabValue("following")}
            >
              <div>
                <p className={`text-lg  text-white ${fontItalic.className}`}>
                  {millify(followingCount || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </DialogTrigger>

          <DialogTrigger asChild>
            <div
              className="cursor-pointer"
              onClick={() => setTabValue("followers")}
            >
              <div>
                <p className={`text-lg  text-white ${fontItalic.className}`}>
                  {millify(followersCount || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
            </div>
          </DialogTrigger>

          <DialogTrigger asChild>
            <div
              className="cursor-pointer"
              onClick={() => setTabValue("subscribers")}
            >
              <div>
                <p className={`text-lg  text-white ${fontItalic.className}`}>
                  {millify(subscribersCount || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Subscribers</p>
              </div>
            </div>
          </DialogTrigger>
        </>
      ) : (
        <>
          <div>
            <p className={`text-lg  text-white ${fontItalic.className}`}>
              {millify(followersCount || 0)}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>

          <div>
            <p className={`text-lg  text-white ${fontItalic.className}`}>
              {millify(subscribersCount || 0)}
            </p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </div>
        </>
      )}

      {isOwnProfile && (
        <DialogContent className="p-0 w-full max-w-[30%]">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <p
                className={`grow text-center text-xl  mt-2 ${fontItalic.className}`}
              >
                @{user?.userName}
              </p>
            </div>
          </DialogHeader>
          <Followers tabValue={tabValue} />
        </DialogContent>
      )}
    </Dialog>
  );
};
export default FollowerPopup;
