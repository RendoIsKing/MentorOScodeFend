"use client";
import React, { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tags } from "lucide-react";
import AvatarWithDescription from "../shared/avatar-with-description";
import { Button } from "../ui/button";
import { baseServerUrl, getInitials } from "@/lib/utils";
import { useFollowUserMutation } from "@/redux/services/haveme/user";
import { toast } from "../ui/use-toast";
import { useSendNotificationMutation } from "@/redux/services/haveme/notifications";
import { useAppDispatch } from "@/redux/store";
import { TAG_GET_TAGGED_USERS_LIST } from "@/contracts/haveme/haveMeApiTags";
import {
  postsApi,
  useLazyGetTaggedUserListQuery,
} from "@/redux/services/haveme/posts";

interface ITaggedUserPopupProps {
  postId: string;
}

const TaggedUserPopup = ({ postId }: ITaggedUserPopupProps) => {
  const [getTaggedUserList, { data: tagListDetails }] =
    useLazyGetTaggedUserListQuery();

  const [followUser] = useFollowUserMutation();
  const [sendNotification] = useSendNotificationMutation();
  const appDispatch = useAppDispatch();

  const handleFollowClick = useCallback(
    async (id) => {
      await followUser({ followingTo: id })
        .unwrap()
        .then((res) => {
          toast({
            duration: 1000,
            variant: "success",
            description: res.message || "User Followed.",
          });
          sendNotification({
            title: "Follow notification",
            description: "User followed notification.",
            type: "push",
          });
          appDispatch(
            postsApi.util.invalidateTags([TAG_GET_TAGGED_USERS_LIST])
          );
        })
        .catch((err) => {
          toast({
            variant: "destructive",
            description: err.message || "Something went wrong.",
          });
        });
    },
    [followUser]
  );
  return (
    <div>
      <Dialog>
        <DialogTrigger onClick={() => getTaggedUserList(postId)}>
          <Tags size={32} className="my-2" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tagged Users</DialogTitle>
            <DialogDescription>
              Following is the list of tagged users:
              {tagListDetails?.taggedUsers?.map((user, index) => (
                <div key={user?._id} className="flex justify-between my-4 mr-4">
                  <AvatarWithDescription
                    imageUrl={`${baseServerUrl}/${user?.photo?.path}`}
                    ImageFallBackText={getInitials(user?.fullName)}
                    userName={user?.fullName}
                    userNameTag={user?.userName}
                  />
                  <Button
                    size={"sleek"}
                    className="py-4 bg-primary text-white"
                    onClick={() => handleFollowClick(user?._id)}
                  >
                    {user?.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              ))}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaggedUserPopup;
