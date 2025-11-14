import React from "react";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";
import { IFollowerPopupProps } from "../shared/popup/followers";
import millify from "millify";
import {
  useGetFollowerListQuery,
  useGetFollowingListQuery,
  useGetSubscriberListQuery,
} from "@/redux/services/haveme/user";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IUserStatsProps extends IFollowerPopupProps {
  likeCount?: number;
  postsCount?: number;
  userId?: string;
}

const UserStats: React.FC<IUserStatsProps> = ({
  followersCount,
  followingCount,
  subscribersCount,
  isOwnProfile,
  likeCount,
  postsCount,
  userId,
}) => {
  const router = useRouter();
  // If profile counts are stale or missing on own profile, derive from lists
  const enableDerivedCounts = Boolean(isOwnProfile && userId);
  const { data: followersList } = useGetFollowerListQuery(userId as any, { skip: !enableDerivedCounts });
  const { data: followingList } = useGetFollowingListQuery(userId as any, { skip: !enableDerivedCounts });
  const { data: subscribersList } = useGetSubscriberListQuery(userId as any, { skip: !enableDerivedCounts });

  const displayFollowing = (enableDerivedCounts ? (followingList?.data?.length ?? undefined) : undefined) ?? (followingCount ?? 0);
  const displayFollowers = (enableDerivedCounts ? (followersList?.data?.length ?? undefined) : undefined) ?? (followersCount ?? 0);
  const displaySubscribers = (enableDerivedCounts ? (subscribersList?.data?.length ?? undefined) : undefined) ?? (subscribersCount ?? 0);

  const Stat = ({ label, value, onClick }: { label: string; value?: number; onClick?: () => void }) => (
    <button onClick={onClick} className="text-center">
      <p className={`text-lg font-semibold ${fontItalic.className}`}>{millify(value || 0)}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </button>
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-6 text-center justify-items-center">
        <Stat label="Following" value={displayFollowing} onClick={() => router.push(`/followers?tab=following${userId ? `&uid=${encodeURIComponent(userId)}` : ""}`)} />
        <Stat label="Followers" value={displayFollowers} onClick={() => router.push(`/followers?tab=followers${userId ? `&uid=${encodeURIComponent(userId)}` : ""}`)} />
        <Stat label="Subscribers" value={displaySubscribers} onClick={() => router.push(`/followers?tab=subscribers${userId ? `&uid=${encodeURIComponent(userId)}` : ""}`)} />
      </div>
    </div>
  );
};

export default UserStats;
