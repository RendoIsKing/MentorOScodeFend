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

  const Stat = ({ label, value, onClick }: { label: string; value?: number; onClick?: () => void }) => (
    <button onClick={onClick} className="text-center">
      <p className={`text-lg font-semibold ${fontItalic.className}`}>{millify(value || 0)}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </button>
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-6 text-center justify-items-center">
        <Stat label="Following" value={followingCount} onClick={() => router.push("/followers?tab=following")} />
        <Stat label="Followers" value={followersCount} onClick={() => router.push("/followers?tab=followers")} />
        <Stat label="Subscribers" value={subscribersCount} onClick={() => router.push("/followers?tab=subscribers")} />
      </div>
    </div>
  );
};

export default UserStats;
