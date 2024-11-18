import { UserBase } from "../haveme/UserBase";

export interface IFollowingResponse {
  data: FollowingResponseObj[];
}

interface FollowingResponseObj {
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  owner: UserBase;
  followingTo: UserBase;
}
