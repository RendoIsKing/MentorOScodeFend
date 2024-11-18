import { User } from "../haveme/UserBase";

export interface CommentPostResponseObject {
  type: string;
  post: string;
  user: string;
  replies: CommentPostResponseObject[];
  likes: string[];
  interactedBy: User;
  comment: string;
  collectionId: [];
  isDeleted: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IUpdateCommentPostResponse {
  data: CommentPostResponseObject[];
  message: string;
}

export interface IGetCommentPostResponse {
  data: CommentPostResponseObject[];
  message: string;
}
