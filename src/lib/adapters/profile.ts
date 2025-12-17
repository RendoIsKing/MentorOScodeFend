import { baseServerUrl } from "@/lib/utils";
import { getUserAvatarUrl, getUserCoverUrl } from "@/lib/media";

export type UiV2ProfileUser = {
  id: string;
  fullName: string;
  userName: string;
  bio?: string;
  avatarUrl: string;
  coverUrl: string;
  isMentor: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
};

export type UiV2ProfilePostThumb = {
  id: string;
  thumbUrl: string;
  isVideo: boolean;
};

export function adaptUserToUiV2ProfileUser(user: any): UiV2ProfileUser {
  const id = String(user?._id || user?.id || "");
  const userName = String(user?.userName || "");
  const fullName = String(user?.fullName || user?.user?.fullName || userName || "");
  const bio = typeof user?.bio === "string" ? user.bio : undefined;
  const avatarUrl = getUserAvatarUrl(user);
  const coverUrl = getUserCoverUrl(user);
  const isMentor = Boolean(user?.isMentor || user?.isCreator || user?.mentor || user?.role === "mentor");
  return {
    id,
    fullName,
    userName,
    bio,
    avatarUrl,
    coverUrl,
    isMentor,
    followersCount: user?.followersCount,
    followingCount: user?.followingCount,
    postsCount: user?.postsCount,
    isFollowing: user?.isFollowing,
  };
}

export function adaptPostsToProfileThumbs(posts: any[]): UiV2ProfilePostThumb[] {
  const base = baseServerUrl || "/api/backend";
  return (Array.isArray(posts) ? posts : []).flatMap((p: any) => {
    const id = String(p?._id || p?.id || "");
    if (!id) return [];

    const mf = p?.mediaFiles?.[0];
    const pathMaybe: string | undefined = mf?.path || p?.media?.[0]?.path;
    const mime = mf?.mimeType || p?.media?.[0]?.mimeType || "";
    const isVideo = String(mime).startsWith("video/") || /\.(mp4|webm|mov)$/i.test(String(pathMaybe || ""));
    const fileId = mf?._id || mf?.id || p?.media?.[0]?.mediaId;

    let thumbUrl = "";
    if (fileId) thumbUrl = `${base}/v1/user/files/${String(fileId)}`;
    else if (pathMaybe) thumbUrl = String(pathMaybe).startsWith("http") ? String(pathMaybe) : `${base}/${String(pathMaybe)}`;
    if (!thumbUrl) return [];

    return [{ id, thumbUrl, isVideo }];
  });
}


