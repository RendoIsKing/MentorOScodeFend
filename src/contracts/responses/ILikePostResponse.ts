export interface LikePostResponseObject {
  type: string;
  post: string;
  user: string;
  replies: [];
  likes: [];
  interactedBy: string;
  isDeleted: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ILikePostResponse {
  data: LikePostResponseObject;
  message: string;
}
