"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ABeeZee } from "next/font/google";
import { useFollowUserMutation, usersApi } from "@/redux/services/haveme/user";
import { toast } from "../ui/use-toast";
import SubscribePlan from "../shared/popup/subscribe-plan";
import { useSendNotificationMutation } from "@/redux/services/haveme/notifications";
import { useAppDispatch } from "@/redux/store";
import { TAG_GET_USER_DETAILS_BY_USER_NAME, TAG_GET_USER_INFO } from "@/contracts/haveme/haveMeApiTags";

const fontItalic = ABeeZee({ subsets: ["latin"], weight: ["400"], style: "italic" });

const ProfileButtons = ({ userDetailsData }) => {
  const [followUser] = useFollowUserMutation();
  const [sendNotification] = useSendNotificationMutation();
  const appDispatch = useAppDispatch();

  const [isFollowingLocal, setIsFollowingLocal] = useState<boolean | undefined>(
    typeof userDetailsData?.isFollowing === "boolean" ? Boolean(userDetailsData?.isFollowing) : undefined
  );

  // Prefer cache if present; otherwise use server and persist to cache.
  useEffect(() => {
    try {
      const id = userDetailsData?._id ? String(userDetailsData._id) : "";
      const uname = (userDetailsData?.userName || "").toString();
      if (!id && !uname) return;
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("followedAuthors") : null;
      const map = raw ? JSON.parse(raw) : {};
      const byId = id ? map[id] : undefined;
      const byUser = uname ? map[uname] : undefined;
      const byUserLc = uname ? map[uname.toLowerCase()] : undefined;
      const cacheFlag = typeof byId === "boolean" ? byId : (typeof byUser === "boolean" ? byUser : (typeof byUserLc === "boolean" ? byUserLc : undefined));
      const serverFlag = typeof userDetailsData?.isFollowing === "boolean" ? Boolean(userDetailsData.isFollowing) : undefined;
      if (typeof cacheFlag === "boolean") {
        setIsFollowingLocal(cacheFlag);
        return;
      }
      if (typeof serverFlag === "boolean") {
        setIsFollowingLocal(serverFlag);
        // seed cache so next load is instant
        map[id] = serverFlag; if (uname) map[uname] = serverFlag; if (uname) map[uname.toLowerCase()] = serverFlag;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('followedAuthors', JSON.stringify(map));
          const evt = new Event('follow-cache-changed');
          window.dispatchEvent(evt);
        }
        return;
      }
    } catch {
      if (typeof userDetailsData?.isFollowing === "boolean") setIsFollowingLocal(Boolean(userDetailsData.isFollowing));
    }
  }, [userDetailsData?._id, userDetailsData?.userName, userDetailsData?.isFollowing]);

  // Sync with changes in other tabs/windows
  useEffect(() => {
    const syncFromCache = () => {
      try {
        const id = userDetailsData?._id ? String(userDetailsData._id) : "";
        const uname = (userDetailsData?.userName || "").toString();
        const raw = typeof window !== "undefined" ? window.localStorage.getItem("followedAuthors") : null;
        const map = raw ? JSON.parse(raw) : {};
        const byId = id ? map[id] : undefined;
        const byUser = uname ? map[uname] : undefined;
        const byUserLc = uname ? map[uname.toLowerCase()] : undefined;
        const explicit = typeof byId === "boolean" ? byId : (typeof byUser === "boolean" ? byUser : (typeof byUserLc === "boolean" ? byUserLc : undefined));
        if (typeof explicit === "boolean") setIsFollowingLocal(explicit);
      } catch {}
    };
    const onStorage = (e?: StorageEvent) => { if (!e || e.key === 'followedAuthors') syncFromCache(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage as any);
      window.addEventListener('follow-cache-changed', syncFromCache as any);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage as any);
        window.removeEventListener('follow-cache-changed', syncFromCache as any);
      }
    };
  }, [userDetailsData?._id, userDetailsData?.userName]);

  const handleFollowClick = useCallback(
    async (id: string) => {
      const wasFollowing = Boolean(isFollowingLocal);
      const next = !wasFollowing;
      setIsFollowingLocal(next);
      try {
        await followUser({ followingTo: id }).unwrap();
        toast({ variant: "success", description: next ? "Now following." : "Unfollowed." });
        sendNotification({ title: "Follow notification", description: "User followed notification.", type: "push" });
        try {
          const raw = typeof window !== "undefined" ? window.localStorage.getItem("followedAuthors") : null;
          const map = raw ? JSON.parse(raw) : {};
          const uname = (userDetailsData?.userName || "").toString();
          const unameLc = uname.toLowerCase();
          if (id) map[String(id)] = next; if (uname) map[String(uname)] = next; if (unameLc) map[String(unameLc)] = next;
          if (typeof window !== "undefined") {
            window.localStorage.setItem("followedAuthors", JSON.stringify(map));
            const evt = new Event("follow-cache-changed");
            window.dispatchEvent(evt);
          }
        } catch {}
        appDispatch(usersApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME, TAG_GET_USER_INFO] as any));
      } catch (err: any) {
        setIsFollowingLocal(wasFollowing);
        toast({ variant: "destructive", description: err?.message || "Something went wrong." });
      }
    },
    [followUser, sendNotification, appDispatch, isFollowingLocal, userDetailsData?.userName]
  );

  return (
    <div className="flex flex-col">
      <div className="flex">
        <Button
          variant={"secondary"}
          size="sleek"
          className={`py-2 px-4  rounded-3xl bg-primary w-28 ${fontItalic.className}`}
          onClick={() => userDetailsData?._id && handleFollowClick(String(userDetailsData._id))}
        >
          {isFollowingLocal ? "Unfollow" : "Follow"}
        </Button>
      </div>
      <div className="flex justify-end mt-2">
        <SubscribePlan />
      </div>
    </div>
  );
};

export default ProfileButtons;
