import { baseServerUrl } from "./utils";

export function getUserAvatarUrl(
  user: any,
  fallback: string = "/assets/images/Home/small-profile-img.svg"
) {
  const base = baseServerUrl;
  const avatarPath = user?.photo?.path;
  const avatarId = user?.photo?._id || user?.photoId;
  const updatedAt = user?.photo?.updatedAt || user?.updatedAt;
  // Use only stable server-provided timestamps to avoid SSR/CSR mismatches
  const cacheBuster = updatedAt ? new Date(updatedAt).getTime() : undefined;

  if (avatarPath && !String(avatarPath).includes("undefined") && !String(avatarPath).includes("null")) {
    // If path is absolute, return as-is (append version if possible and no existing query)
    if (/^https?:\/\/+/i.test(String(avatarPath))) {
      return cacheBuster
        ? appendVersion(String(avatarPath), cacheBuster)
        : String(avatarPath);
    }
    return `${base}/${avatarPath}${cacheBuster ? `?v=${cacheBuster}` : ""}`;
  }
  if (avatarId) {
    return `${base}/v1/user/files/${String(avatarId)}${cacheBuster ? `?v=${cacheBuster}` : ""}`;
  }
  return fallback;
}

export function getUserCoverUrl(
  user: any,
  fallback: string = "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
) {
  const base = baseServerUrl;
  const coverPath = user?.coverPhoto?.path;
  const coverId = user?.coverPhoto?._id || user?.coverPhotoId;
  const updatedAt = user?.coverPhoto?.updatedAt || user?.updatedAt;
  const cacheBuster = updatedAt ? new Date(updatedAt).getTime() : undefined;

  if (coverPath && !String(coverPath).includes("undefined") && !String(coverPath).includes("null")) {
    if (/^https?:\/\/+/i.test(String(coverPath))) {
      return cacheBuster
        ? appendVersion(String(coverPath), cacheBuster)
        : String(coverPath);
    }
    return `${base}/${coverPath}${cacheBuster ? `?v=${cacheBuster}` : ""}`;
  }
  if (coverId) {
    return `${base}/v1/user/files/${String(coverId)}${cacheBuster ? `?v=${cacheBuster}` : ""}`;
  }
  return fallback;
}

function appendVersion(url: string, v: string | number) {
  if (!v && v !== 0) return url;
  return url.includes("?") ? `${url}&v=${v}` : `${url}?v=${v}`;
}


