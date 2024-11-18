import { UserTag } from "@/context/UserTags";
import { UserBase } from "../haveme/UserBase";

export interface Connection {
  _id: string;
  owner: string;
  followingTo: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface MediaFile {
  _id: string;
  path: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PostMediaObject {
  mediaId: string;
  mediaType: string;
  _id?: string;
}
export interface PostMediaFileObject {
  _id: string;
  path: string;
  isDeleted: false;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
type UserPhoto = {
  _id: string;
  path: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

export interface IPostContentObject {
  _id: string;
  media: PostMediaObject[];
  content: string;
  orientation: string; // New field added
  tags: string[];
  privacy: "public" | "subscriber" | "pay-per-view";
  status: string;
  user: string;
  isActive: boolean;
  isDeleted: boolean;
  type: string; // New field added
  createdAt: string;
  updatedAt: string;
  __v: number;
  connections: Connection[]; // New field added
  mediaFiles: MediaFile[];
  userInfo: UserBase;
  userPhoto: UserPhoto[];

  likesCount: number; // New field added
  likeInteractions: any[]; // Assuming this will be an array of objects similar to the example provided
  savedInteractions: any[]; // Assuming this will be an array of objects similar to the example provided
  savedCount: number; // New field added
  commentsCount: number; // New field added
  isLiked: boolean;
  isSaved: boolean;
  userTags?: UserTag[];
  isPaid: boolean;
  isPinned: boolean;
}

export interface IPostContentResponse {
  data: IPostContentObject[];
  meta?: {
    total: number;
    page: number;
    perPage: number;
    pageCount: number;
  };
}
