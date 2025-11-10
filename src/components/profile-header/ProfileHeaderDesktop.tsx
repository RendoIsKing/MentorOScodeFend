"use client";
import { Avatar } from "@radix-ui/react-avatar";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import ContentUploadOptions from "../upload-content-options";
import ProfileButtons from "../profie-login-buttons";
import ShareOthersPopup from "../shared/shareOthers/shareOthersPopup";
import SendMessagePopup from "../shared/popup/send-message-popup";
import NotificationSettingModal from "../notification-setting-modal";
import FollowerPopup from "../shared/popup/followers";
import { Separator } from "../ui/separator";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { Ban, BellOff, Ellipsis, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import ReportProblemAlert from "../report-problem";
import SocialInstagram from "@/assets/images/my-Profile/instagram.svg";
import SocialYoutube from "@/assets/images/my-Profile/youtube.svg";
import SocialTiktok from "@/assets/images/my-Profile/tiktok.svg";
import { ABeeZee } from "next/font/google";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";
import { useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";
import { baseServerUrl, cn } from "@/lib/utils";
import UserStats from "@/components/user-stats";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

function ProfileHeaderDesktop() {
  const router = useRouter();
  const userName = useParams();

  const { data, isLoading, isError, refetch } = useGetUserDetailsQuery();

  const { userDetailsData } = useGetUserDetailsByUserNameQuery(
    { userName: userName.uid as string },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          userDetailsData: data?.data,
        };
      },
    }
  );

  // Robust own-profile detection (by id or username)
  const isOwnProfile = useMemo(() => {
    const currentId = data?.data?._id;
    const targetId = userDetailsData?._id;
    const byId = !!(currentId && targetId && currentId === targetId);
    const routeUid = (userName?.uid as string) || "";
    const byUserName =
      (data?.data?.userName || "").toLowerCase() === routeUid.toLowerCase();
    return byId || byUserName;
  }, [data, userDetailsData, userName]);

  // View-as toggle
  const [viewAsVisitor, setViewAsVisitor] = useState(false);
  const isOwnerRendered = isOwnProfile && !viewAsVisitor;

  // Inline bio editing
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [localBio, setLocalBio] = useState<string | undefined>(undefined);
  const [updateMe, { isLoading: isSavingBio }] = useUpdateMeMutation();

  const startEditBio = () => {
    const currentBio = (localBio !== undefined ? localBio : (data?.data?.bio || ""));
    setBioDraft(currentBio);
    setIsEditingBio(true);
  };

  const saveBio = async () => {
    try {
      await updateMe({ bio: bioDraft }).unwrap();
      setLocalBio(bioDraft);
      setIsEditingBio(false);
      try { await refetch(); } catch {}
    } catch (e) {
      setIsEditingBio(false);
    }
  };

  const [openShareModel, setOpenShareModel] = useState(false);
  const [openChatPopup, setOpenChatPopup] = useState(false);
  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);

  if (isError) {
    return <h1>Error fetching</h1>;
  }
  return (
    <div>
      <div className="relative">
        {(() => {
          const owner = isOwnerRendered ? (data as any)?.data : (userDetailsData as any);
          const base = '/api/backend';
          const coverId = owner?.coverPhoto?._id || owner?.coverPhotoId;
          const coverPath = owner?.coverPhoto?.path;
          // Prefer static file path (actual image) over id endpoint (JSON metadata)
          const baseCover = coverPath ? `${base}/${coverPath}` : (coverId ? `${base}/v1/user/files/${String(coverId)}` : undefined);
          const coverUrl = baseCover ? `${baseCover}?v=${encodeURIComponent(String(coverPath || coverId || ''))}` : undefined;
          const fallback = 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
          return (
            <img
              className="w-full h-64 object-cover"
              src={coverUrl || fallback}
              alt="cover"
              loading="lazy"
              decoding="async"
            />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40">
          {!isOwnerRendered && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="float-end inline-block">
                    <Button variant={"link"} size={"icon"} className=" bg-muted-foreground/50 m-8">
                      <Ellipsis strokeWidth={3} className="text-white" />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2 mx-10 -my-5 border-border bg-card inline-block" side="bottom">
                  <div className="flex items-center justify-between px-4 py-2 my-4">
                    <div className="flex items-center space-x-2 mr-4">
                      <BellOff />
                      <span>Mute Notifications</span>
                    </div>
                    <Switch id="mute-notifications" />
                  </div>
                  <Button variant={"link"} className="w-full text-destructive flex justify-start gap-2">
                    <Ban /> Block
                  </Button>
                  <Button variant={"link"} className="flex justify-between text-destructive" onClick={() => setIsReportUserOpen(true)}>
                    <div className="flex gap-2">
                      <Info /> Report User
                    </div>
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      <div className="flex px-4 -mt-24 ">
        <Avatar className="block relative w-56">
          {(() => {
            const owner = isOwnerRendered ? (data as any)?.data : (userDetailsData as any);
          const base = '/api/backend';
          const rawPath = owner?.photo?.path;
          const avatarPath = (rawPath && rawPath !== 'undefined' && rawPath !== 'null') ? rawPath : undefined;
          const avatarId = owner?.photo?._id || owner?.photoId;
          // Prefer static file path (actual image) over id endpoint (JSON metadata)
          const baseUrl = avatarPath ? `${base}/${avatarPath}` : (avatarId ? `${base}/v1/user/files/${String(avatarId)}` : undefined);
          const bust = (avatarPath || avatarId) ? `?v=${encodeURIComponent(String(avatarPath || avatarId))}` : '';
            return (
              <img
                alt="profile image"
              src={(baseUrl ? (baseUrl + bust) : '/assets/images/Home/small-profile-img.svg')}
                className="rounded-full mx-2 lg:h-40 lg:w-40 object-cover"
                loading="lazy"
                decoding="async"
              />
            );
          })()}
        </Avatar>
        <div className="flex gap-8 flex-col relative w-full m-8">
          <div>
            <div className="flex gap-8 items-center justify-between">
              <div className="flex gap-8 items-center">
                <h1 className=" text-2xl text-gray-100">
                  {isOwnerRendered ? data?.data?.fullName : userDetailsData?.fullName}
                </h1>
                {isOwnerRendered ? (
                  <img onClick={() => setOpenShareModel(true)} src="/assets/images/my-Profile/share.svg" className="cursor-pointer" alt="share" loading="lazy" decoding="async" />
                ) : (
                  <div className="flex w-[84px] justify-between">
                    <img onClick={() => {
                      const uname = (userDetailsData?.userName || '').toString().toLowerCase();
                      if (uname.replace(/-/g,'') === 'coachmajen') {
                        return router.push('/coach-majen');
                      }
                      setOpenChatPopup(true);
                    }} src="/assets/images/search-user-profile/inbox-message.svg" className="cursor-pointer" alt="message" loading="lazy" decoding="async" />
                    <img src="/assets/images/Sidebar/notification-bing.svg" className="cursor-pointer" alt="notification" onClick={() => setIsNotificationModal(true)} loading="lazy" decoding="async" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {isOwnProfile && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">View as</span>
                    <Switch checked={viewAsVisitor} onCheckedChange={setViewAsVisitor} />
                  </div>
                )}
                {isOwnerRendered && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={"secondary"} size="sleek" className={`py-2 px-4 rounded-3xl ${fontItalic.className}`}>Edit</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => router.push("/edit-profile")}>Edit Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/edit-avatar")}>Edit Avatar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/subscription")}>Edit Subscription</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <p className="text-gray-300">@{isOwnerRendered ? data?.data?.userName : userDetailsData?.userName}</p>
          </div>

          <div className="flex justify-between">
            <div className="flex flex-col gap-6 pr-4 w-4/6">
              <div className="text-sm">
                <p className="text-muted-foreground flex items-center gap-3">
                  Bio
                  {isOwnerRendered && !isEditingBio && (
                    <Button variant="link" className="p-0 h-auto" onClick={startEditBio}>Edit Bio</Button>
                  )}
                </p>
                {isOwnerRendered && isEditingBio ? (
                  <div className="w-[75%]">
                    <textarea
                      className="w-full rounded-md bg-background border p-2"
                      rows={3}
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={saveBio} disabled={isSavingBio}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingBio(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="pb-2 w-[75%]">{(isOwnerRendered ? (localBio !== undefined ? localBio : (data?.data?.bio || "")) : "") || ""}</p>
                )}
                <Separator />
              </div>
              {/* Desktop stats: show for both self and others */}
              {isOwnerRendered ? (
                <UserStats
                  isOwnProfile={true}
                  followersCount={data?.data?.followersCount}
                  followingCount={data?.data?.followingCount}
                  subscribersCount={data?.data?.subscriberCount}
                  postsCount={data?.data?.postsCount}
                  likeCount={data?.data?.totalLikes}
                />
              ) : (
                <UserStats
                  isOwnProfile={false}
                  followersCount={userDetailsData?.followersCount}
                  followingCount={userDetailsData?.followingCount}
                  subscribersCount={userDetailsData?.subscriberCount}
                  postsCount={userDetailsData?.postsCount}
                  likeCount={userDetailsData?.totalLikes}
                />
              )}
              <div className="flex">
                <ContentUploadOptions />
              </div>
            </div>
            {isOwnerRendered ? null : (
              <div>
                <ProfileButtons userDetailsData={userDetailsData} />
              </div>
            )}
          </div>
        </div>
      </div>

      {openShareModel && (
        <ShareOthersPopup open={openShareModel} setOpenShareModel={setOpenShareModel} />
      )}

      {openChatPopup && (
        <SendMessagePopup openPopup={openChatPopup} setOpenPopup={setOpenChatPopup} />
      )}
      <NotificationSettingModal
        openPopup={isNotificationModal}
        titleText="Upload your ID proof"
        btnText="Upload Your ID"
        titleDescription="You can upload forms of identification like passport, driver license or ID card. Result can take 2 days"
        setOpenPopup={setIsNotificationModal}
        imageUrl="\assets\images\pending-verification\pending-verification.svg"
      />

      {isReportUserOpen && (
        <ReportProblemAlert isOpen={isReportUserOpen} onClose={() => setIsReportUserOpen(false)} userId={data?.data?._id} />
      )}
    </div>
  );
}

export default ProfileHeaderDesktop;
