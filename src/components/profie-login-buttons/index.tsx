"use client";
import React, { useCallback } from "react";
import { Button } from "../ui/button";
import AlertPopup from "../shared/popup";
import { ABeeZee } from "next/font/google";
import { useFollowUserMutation, usersApi } from "@/redux/services/haveme/user";
import { toast } from "../ui/use-toast";
import SubscribePlan from "../shared/popup/subscribe-plan";
import { useSendNotificationMutation } from "@/redux/services/haveme/notifications";
import { useAppDispatch } from "@/redux/store";
import {
  TAG_GET_USER_DETAILS_BY_USER_NAME,
  TAG_GET_USER_INFO,
} from "@/contracts/haveme/haveMeApiTags";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const ProfileButtons = ({ userDetailsData }) => {
  const [followUser] = useFollowUserMutation();
  const [sendNotification] = useSendNotificationMutation();
  const appDispatch = useAppDispatch();

  const handleFollowClick = useCallback(
    async (id) => {
      await followUser({ followingTo: id })
        .unwrap()
        .then((res) => {
          toast({
            variant: "success",
            description: res.message || "User Followed.",
          });

          sendNotification({
            title: "Follow notification",
            description: "User followed notification.",
            type: "push",
          });
          appDispatch(
            usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME])
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
    <div className="flex flex-col">
      <div className="flex">
        <Button
          variant={"secondary"}
          size="sleek"
          className={`py-2 px-4  rounded-3xl bg-primary w-28 ${fontItalic.className}`}
          onClick={() => handleFollowClick(userDetailsData?._id)}
        >
          {userDetailsData?.isFollowing ? "Unfollow" : "Follow"}
        </Button>
        {/* below is take me home button don't be confused with actual subscribe */}
        <AlertPopup
          headerText="Jaylon Stanton"
          bodyText="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
          footerText="$20 Monthly"
          color={false}
          showVerifiedIcon={false}
          showTakeMeHomeButton={true}
        />
      </div>
      <div className="flex justify-end mt-2">
        <>
          <SubscribePlan />
        </>
      </div>
    </div>
  );
};

export default ProfileButtons;
