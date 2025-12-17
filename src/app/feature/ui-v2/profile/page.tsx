"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetPostsByUserNameQuery } from "@/redux/services/haveme/posts";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";
import { adaptPostsToProfileThumbs, adaptUserToUiV2ProfileUser } from "@/lib/adapters/profile";
import { UiV2ProfileScaffold } from "@/components/ui-v2/profile/UiV2ProfileScaffold";

export default function UiV2SelfProfilePage() {
  const router = useRouter();
  const { data: me, refetch } = useGetUserDetailsQuery();
  const meUser = (me as any)?.data;
  const [updateMe, { isLoading: becomingMentor }] = useUpdateMeMutation();

  const user = React.useMemo(() => adaptUserToUiV2ProfileUser(meUser || {}), [meUser]);

  const { data: postsRes } = useGetPostsByUserNameQuery(
    { userName: user.id || String(meUser?._id || ""), page: 1, perPage: 60, filter: "posts" } as any,
    { skip: !user.id }
  );
  const postsRaw = (postsRes as any)?.data ?? [];
  const posts = React.useMemo(() => adaptPostsToProfileThumbs(postsRaw), [postsRaw]);

  return (
    <UiV2ProfileScaffold
      mode="self"
      user={user}
      isOwnProfile={true}
      isFollowing={false}
      onSettings={() => router.push("/settings")}
      onEditProfile={() => router.push("/edit-profile")}
      onBecomeMentor={async () => {
        try {
          await (updateMe as any)({ isMentor: true }).unwrap?.();
        } catch {}
        try { await (refetch as any)?.(); } catch {}
      }}
      onFollowers={() => router.push("/followers?tab=followers")}
      onFollowing={() => router.push("/followers?tab=following")}
      posts={posts}
    />
  );
}


