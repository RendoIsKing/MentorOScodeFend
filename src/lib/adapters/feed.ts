export type FullBleedPost = {
  id: string;
  type: "image" | "video";
  src: string;
  visibility?: "public" | "followers" | "subscribers";
  user?: {
    id?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    viewerFollows?: boolean;
  };
  caption?: string;
  createdAt?: string;
};

function getBaseProxy() {
  // Always use same-origin proxy (Next rewrite -> backend origin) so cookies + CORS work.
  return "/api/backend";
}

export function indexPostsById(items: any[]) {
  return new Map(items.map((p: any) => [String(p?._id ?? p?.id), p]));
}

export function adaptBackendPostsToFullBleedPosts(
  items: any[],
  opts: { me?: any; selfUserId?: string | null }
): FullBleedPost[] {
  const base = getBaseProxy();
  const me = opts.me;
  const selfUserId = opts.selfUserId || "";

  return items.flatMap((p: any) => {
    const m = p?.mediaFiles?.[0] || p?.mediaFiles?.[0];
    const pathMaybe: string | undefined =
      (m?.path as string | undefined) || (p?.media?.[0]?.path as string | undefined);

    const isVideo =
      (m?.mimeType && m.mimeType.startsWith("video/")) || /\.(mp4|webm|mov)$/i.test(pathMaybe || "");

    // Prefer id-based endpoint (works with S3 and local), fall back to path.
    const fileId =
      (m && (((m as any)?._id) || ((m as any)?.id))) || (p?.media?.[0]?.mediaId);

    let src = "";
    if (fileId) src = `${base}/v1/user/files/${String(fileId)}`;
    else if (pathMaybe) src = pathMaybe.startsWith("http") ? pathMaybe : `${base}/${pathMaybe}`;
    if (!src) return [] as FullBleedPost[];

    // Avatar: prefer a usable image path, fall back to id endpoint.
    const avatarPathRaw = p?.userInfo?.[0]?.photo?.path || p?.userPhoto?.[0]?.path;
    const safeAvatarPath =
      avatarPathRaw && avatarPathRaw !== "undefined" && avatarPathRaw !== "null"
        ? avatarPathRaw
        : undefined;
    const avatarFileId =
      p?.userInfo?.[0]?.photoId || p?.userPhoto?.[0]?._id || p?.userInfo?.[0]?.photo?._id;

    let avatarUrl = safeAvatarPath
      ? String(safeAvatarPath).startsWith("http")
        ? safeAvatarPath
        : `${base}/${safeAvatarPath}`
      : avatarFileId
        ? `${base}/v1/user/files/${String(avatarFileId)}`
        : undefined;

    // If this post belongs to the current user and avatar is still missing, fall back to /auth/me.
    try {
      const postUserId = String(p?.userInfo?.[0]?._id || "");
      if (!avatarUrl && selfUserId && postUserId && selfUserId === postUserId) {
        const mePhotoId = me?.data?.photo?._id || me?.data?.photoId;
        const mePhotoPath = me?.data?.photo?.path;
        if (mePhotoId) avatarUrl = `${base}/v1/user/files/${String(mePhotoId)}`;
        else if (mePhotoPath && !String(mePhotoPath).includes("undefined")) avatarUrl = `${base}/${mePhotoPath}`;
      }
    } catch {}

    const privacy: string | undefined = typeof p?.privacy === "string" ? p.privacy.toLowerCase() : undefined;
    const visibility =
      privacy === "followers"
        ? "followers"
        : privacy === "subscriber"
          ? "subscribers"
          : privacy === "public"
            ? "public"
            : undefined;

    return [
      {
        id: String(p?._id ?? p?.id),
        type: isVideo ? "video" : "image",
        src,
        user: {
          id: String(p?.userInfo?.[0]?._id || ""),
          username: String(p?.userInfo?.[0]?.userName || ""),
          displayName: String(p?.userInfo?.[0]?.fullName || ""),
          avatarUrl: avatarUrl && String(avatarUrl).includes("undefined") ? undefined : avatarUrl,
          viewerFollows: Boolean(p?.isFollowing),
        },
        caption: String(p?.content || ""),
        createdAt: p?.createdAt,
        visibility,
      },
    ];
  });
}


