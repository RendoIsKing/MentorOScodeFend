import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import AvatarWithDescription from "../avatar-with-description";
import { useFollowUserMutation } from "@/redux/services/haveme/user";
import { toast } from "@/components/ui/use-toast";
import SubscribePlan from "../popup/subscribe-plan";
import { useAppDispatch } from "@/redux/store";

import { updateSearchUsers } from "@/redux/slices/adapters";

interface IUserCardProps {
  imageUrl: string;
  ImageFallBackText: string;
  userName: string;
  userNameTag: string;
  userId: string;
  isFollowing?: boolean;
  hasPlan?: boolean;
}

const UserCard: React.FC<IUserCardProps> = ({
  imageUrl,
  ImageFallBackText,
  userName,
  userNameTag,
  userId,
  isFollowing,
  hasPlan,
}) => {
  const [followUser] = useFollowUserMutation();
  const [isFollowingLocal, setIsFollowingLocal] = React.useState<boolean>(Boolean(isFollowing));
  React.useEffect(() => { setIsFollowingLocal(Boolean(isFollowing)); }, [isFollowing]);
  const appDispatch = useAppDispatch();

  const handleFollowClick: React.MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await followUser({ followingTo: userId })
      .unwrap()
      .then((res) => {
        toast({
          variant: "success",
          description: res.message || "User Followed.",
        });
        const isNowFollowing = Boolean(res?.data?.isFollowing ?? !isFollowingLocal);
        setIsFollowingLocal(isNowFollowing);
        appDispatch(updateSearchUsers({ _id: userId, isFollowing: isNowFollowing }));
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          description: err.message || "Something went wrong.",
        });
      });
  };

  const handleRedirect = async (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="flex justify-between bg-muted border-muted p-4">
      <CardHeader className="p-0">
        <AvatarWithDescription
          imageUrl={imageUrl}
          ImageFallBackText={ImageFallBackText}
          userName={userName}
          userNameTag={userNameTag}
          isTextMuted={true}
        />
      </CardHeader>
      <CardFooter
        className="flex justify-between p-0 gap-1 lg:gap-2"
        onClick={handleRedirect}
      >
        {hasPlan && <SubscribePlan type="card" userNameTag={userNameTag} />}
        <Button size="sleek" className="py-4 px-8" onClick={handleFollowClick}>
          {isFollowingLocal ? "Unfollow" : "Follow"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
