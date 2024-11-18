import React from "react";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";
import { IFollowerPopupProps } from "../shared/popup/followers";
import millify from "millify";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IUserStatsProps extends IFollowerPopupProps {
  likeCount?: number;
  postsCount?: number;
}

const UserStats: React.FC<IUserStatsProps> = ({
  followersCount,
  followingCount,
  subscribersCount,
  isOwnProfile,
  likeCount,
  postsCount,
}) => {
  const router = useRouter();

  return (
    <div>
      {isOwnProfile ? (
        <div className="grid grid-cols-5 gap-2 text-center">
          <div onClick={() => router.push("/followers?tab=following")}>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(followingCount)}
            </p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
          <div onClick={() => router.push("/followers?tab=followers")}>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(followersCount)}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div onClick={() => router.push("/followers?tab=subscribers")}>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(subscribersCount)}
            </p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </div>
          <div>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(postsCount)}
            </p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </div>
          <div>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(likeCount)}
            </p>
            <p className="text-sm text-muted-foreground">Likes</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* <div onClick={() => router.push("/followers?tab=following")}>
          <p className={`text-lg font-semibold  ${fontItalic.className}`}>
            {millify(followingCount)}
          </p>
          <p className="text-sm text-muted-foreground">Following</p>
        </div> */}
          <div>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(followersCount)}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(subscribersCount)}
            </p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </div>
          <div>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(postsCount)}
            </p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </div>
          <div>
            <p className={`text-lg font-semibold  ${fontItalic.className}`}>
              {millify(likeCount)}
            </p>
            <p className="text-sm text-muted-foreground">Likes</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStats;
