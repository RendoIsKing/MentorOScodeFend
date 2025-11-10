import { IGetCurrentUserResponse } from "@/contracts/responses/IGetCurrentUserResponse";

export function normalizeMeResponse(data: IGetCurrentUserResponse | undefined) {
  if (!data) return null;
  const raw: any = (data as any)?.data;
  const user = raw?.user ? raw.user : raw;
  if (!user) return null;

  return {
    _id: user._id ?? null,
    fullName: user.fullName ?? null,
    userName: user.userName ?? null,
    email: user.email ?? null,
    phoneNumber: user.phoneNumber ?? null,
    dialCode: user.dialCode ?? null,
    gender: user.gender ?? null,
    dob: user.dob ?? null,
    bio: user.bio ?? null,
    instagramLink: user.instagramLink ?? null,
    youtubeLink: user.youtubeLink ?? null,
    tiktokLink: user.tiktokLink ?? null,
    facebookLink: user.facebookLink ?? null,
    photoId: user.photoId ?? null,
    coverPhotoId: user.coverPhotoId ?? null,
    photo: user.photo ?? null,
    coverPhoto: user.coverPhoto ?? null,
    hasPersonalInfo: user.hasPersonalInfo === true,
    hasPhotoInfo: user.hasPhotoInfo === true,
    hasSelectedInterest: user.hasSelectedInterest === true,
    hasConfirmedAge: user.hasConfirmedAge === true,
    isVerified: user.isVerified === true,
    isActive: user.isActive === true,
    isDeleted: user.isDeleted === true,
    googleId: user.googleId ?? null,
    followersCount: user.followersCount ?? 0,
    followingCount: user.followingCount ?? 0,
    postsCount: user.postsCount ?? 0,
    totalLikes: user.totalLikes ?? 0,
    subscriberCount: user.subscriberCount ?? 0,
    isFollowing: user.isFollowing === true,
  };
}


