"use client";
import React, { Suspense, useMemo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InnerPageHeader from "@/components/shared/inner-page-header";
import AvatarWithDescription from "@/components/shared/avatar-with-description";
import { baseServerUrl, cn } from "@/lib/utils";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useFollowUserMutation,
  useGetFollowerListQuery,
  useGetFollowingListQuery,
  useGetSubscriberListQuery,
  usersApi,
} from "@/redux/services/haveme/user";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import millify from "millify";
import { toast } from "@/components/ui/use-toast";
import { useSendNotificationMutation } from "@/redux/services/haveme/notifications";
import { useAppDispatch } from "@/redux/store";
import {
  TAG_GET_FOLLOWERS_LIST,
  TAG_GET_FOLLOWING_LIST,
} from "@/contracts/haveme/haveMeApiTags";

const userData = {
  followers: 237,
  following: 3420,
  subscribers: 34,
  followersData: [
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "follower",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "following",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "follower",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "following",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
    {
      imageUrl: "/assets/images/Home/small-profile-img.svg",
      ImageFallBackText: "CJ",
      userName: "Christina Jack",
      userNameTag: "@username",
      type: "subscriber",
    },
  ],
};

interface ITabsModalProps {
  tabValue?: string | any;
}

const Followers: React.FC<ITabsModalProps> = ({ tabValue }) => {
  const { isMobile } = useClientHardwareInfo();
  const isUser = true;
  const searchParams = useSearchParams();
  const { user } = useUserOnboardingContext();
  const [followUser] = useFollowUserMutation();
  const [sendNotification] = useSendNotificationMutation();

  const { data: followersData } = useGetFollowerListQuery(user?._id);
  const { data: followingData } = useGetFollowingListQuery(user?._id);
  const { data: subscriberData } = useGetSubscriberListQuery(user?._id);
  const [isFollow, setIsFollow] = useState(false);
  const appDispatch = useAppDispatch();

  const selectedTab = useMemo(() => {
    const fromQuery = searchParams.get("tab") || "";
    const fromProp = tabValue || "";
    // Prefer explicit query param; fall back to prop; finally default to 'followers'
    return (fromQuery || fromProp || "followers") as string;
  }, [tabValue, searchParams]);

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
            usersApi.util.invalidateTags([
              TAG_GET_FOLLOWING_LIST,
              TAG_GET_FOLLOWERS_LIST,
            ])
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
    <>
      {isMobile && (
        <InnerPageHeader showBackButton={true} title={user?.fullName} />
      )}

      {selectedTab && (
        <Tabs defaultValue={selectedTab} className=" p-5 sm:pt-0">
          <TabsList
            className={cn(
              "grid w-full bg-transparent border-t border-b border-secondary",
              isUser ? "grid-cols-3" : "grid-cols-2"
            )}
          >
            <div>
              <TabsTrigger
                value="following"
                className="w-full data-[state=active]:text-primary data-[state=active]:border-b border-primary  data-[state=active]:bg-transparent data-[state=active]:italic lg:py-4 lg:text-xl"
              >
                {`${millify(followingData?.data.length)} Following`}
              </TabsTrigger>
            </div>
            <div>
              <TabsTrigger
                value="followers"
                className="w-full data-[state=active]:text-primary data-[state=active]:border-b border-primary   data-[state=active]:bg-transparent data-[state=active]:italic lg:py-4 lg:text-xl"
              >
                {`${millify(followersData?.data.length)} Follower`}
              </TabsTrigger>
            </div>

            {isUser && (
              <div>
                <TabsTrigger
                  value="subscribers"
                  className="w-full data-[state=active]:text-primary data-[state=active]:border-b border-primary  data-[state=active]:bg-transparent data-[state=active]:italic lg:py-4 lg:text-xl"
                >
                  {`${millify(subscriberData?.data.length)} Subscribers`}
                </TabsTrigger>
              </div>
            )}
          </TabsList>

          <ScrollArea className="h-[50rem] lg:h-[27rem]">
            <TabsContent value="followers">
              {followersData?.data?.map((user, index) => (
                <div
                  key={user?.owner?._id}
                  className="flex justify-between my-4 mr-4"
                >
                  <a href={`/${String(user?.owner?.userName || '').toLowerCase()}`} className="flex-1">
                    <AvatarWithDescription
                      imageUrl={`${baseServerUrl}/${user?.owner?.photo?.path}`}
                      ImageFallBackText={user?.owner?.userName}
                      userName={user?.owner?.fullName}
                      userNameTag={user?.owner?.userName}
                    />
                  </a>
                  <Button
                    size={"sleek"}
                    className="py-4 bg-primary text-white"
                    onClick={() => handleFollowClick(user?.owner?._id)}
                  >
                    {user?.isFollowingBack ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="following">
              {followingData?.data?.map((user, index) => (
                <div
                  key={user?.followingTo?._id}
                  className="flex justify-between my-4 mr-4"
                >
                  <a href={`/${String(user?.followingTo?.userName || '').toLowerCase()}`} className="flex-1">
                    <AvatarWithDescription
                      imageUrl={`${baseServerUrl}/${user?.followingTo?.photo?.path}`}
                      ImageFallBackText={user?.followingTo?.userName}
                      userName={user?.followingTo?.fullName}
                      userNameTag={user?.followingTo?.userName}
                    />
                  </a>
                  <Button
                    size={"sleek"}
                    className="py-4 bg-primary text-white"
                    onClick={() => handleFollowClick(user?.followingTo?._id)}
                  >
                    Unfollow
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="subscribers">
              {subscriberData?.data?.map((data, index) => (
                <div key={index} className="flex justify-between my-4 mr-4">
                  <AvatarWithDescription
                    imageUrl={`${baseServerUrl}/${data?.photoId}`}
                    ImageFallBackText={data?.userName}
                    userName={data?.fullName}
                    userNameTag={data?.userName}
                  />
                  <Button
                    size={"sleek"}
                    className="py-4 text-[#04AD9C] border-2 border-[#04AD9C] rounded-2xl bg-transparent hover:bg-transparent"
                  >
                    Subscribe
                  </Button>
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      )}
    </>
  );
};

const FollowersWithSuspense: React.FC<ITabsModalProps> = (props) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Followers {...props} />
  </Suspense>
);

export default FollowersWithSuspense;
