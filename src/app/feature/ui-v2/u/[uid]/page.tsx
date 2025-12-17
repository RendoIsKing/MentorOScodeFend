"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useFollowUserMutation, useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";
import { useGetPostsByUserNameQuery } from "@/redux/services/haveme/posts";
import { adaptPostsToProfileThumbs, adaptUserToUiV2ProfileUser } from "@/lib/adapters/profile";
import { UiV2ProfileScaffold } from "@/components/ui-v2/profile/UiV2ProfileScaffold";
import { createConversation } from "@/lib/api/conversations";

export default function UiV2VisitingProfilePage() {
  const router = useRouter();
  const params = useParams() as any;
  const uid = String(params?.uid || "");

  const { data: me } = useGetUserDetailsQuery();
  const meUser = (me as any)?.data;

  const { data: userRes } = useGetUserDetailsByUserNameQuery({ userName: uid } as any, { skip: !uid });
  const targetRaw = (userRes as any)?.data;

  const user = React.useMemo(() => adaptUserToUiV2ProfileUser(targetRaw || {}), [targetRaw]);

  const isOwnProfile =
    Boolean(meUser?._id && user.id && String(meUser._id) === String(user.id)) ||
    Boolean(meUser?.userName && uid && String(meUser.userName).toLowerCase() === uid.toLowerCase());

  const [followUser, { isLoading: followBusy }] = useFollowUserMutation();
  const [isFollowing, setIsFollowing] = React.useState<boolean>(Boolean(user.isFollowing));
  React.useEffect(() => {
    setIsFollowing(Boolean(user.isFollowing));
  }, [user.id, user.isFollowing]);

  const onFollowToggle = async () => {
    if (followBusy || !user.id) return;
    try {
      const res: any = await (followUser as any)({ followingTo: user.id }).unwrap?.();
      const next = Boolean(res?.data?.isFollowing ?? !isFollowing);
      setIsFollowing(next);
      // keep feed follow-pill cache consistent
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem("followedAuthors") : null;
        const map = raw ? JSON.parse(raw) : {};
        map[String(user.id)] = next;
        map[String(user.userName)] = next;
        map[String(user.userName).toLowerCase()] = next;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("followedAuthors", JSON.stringify(map));
          window.dispatchEvent(new Event("follow-cache-changed"));
        }
      } catch {}
    } catch {}
  };

  const { data: postsRes } = useGetPostsByUserNameQuery(
    { userName: uid, page: 1, perPage: 60, filter: "posts" } as any,
    { skip: !uid }
  );
  const postsRaw = (postsRes as any)?.data ?? [];
  const posts = React.useMemo(() => adaptPostsToProfileThumbs(postsRaw), [postsRaw]);

  const onMessage = () => {
    const unameNorm = String(user.userName || uid).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (unameNorm === "coachmajen") return router.push("/coach-majen");
    if (!user.id) return;
    // Open/create a DM conversation and navigate to the new ui-v2 thread UI.
    return createConversation(String(user.id))
      .then((id) => router.push(`/feature/ui-v2/inbox/${encodeURIComponent(id)}`))
      .catch(() => {});
  };

  return (
    <UiV2ProfileScaffold
      mode="visitor"
      user={user}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      onFollowToggle={isOwnProfile ? undefined : onFollowToggle}
      onMessage={isOwnProfile ? undefined : onMessage}
      onFollowers={() => router.push(`/followers?uid=${encodeURIComponent(user.id)}&tab=followers`)}
      onFollowing={() => router.push(`/followers?uid=${encodeURIComponent(user.id)}&tab=following`)}
      posts={posts}
    />
  );
}


