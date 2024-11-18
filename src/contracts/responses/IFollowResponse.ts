import { UserBase } from "../haveme/UserBase";

export interface IFollowResponse {
  data: FollowResponseObj[];
}

interface FollowResponseObj {
  isFollowingBack: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  owner: UserBase;
  followingTo: UserBase;
}
