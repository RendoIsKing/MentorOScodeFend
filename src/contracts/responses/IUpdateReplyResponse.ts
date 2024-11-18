export interface CommentReplyObject {
  _id: string;
  type: string;
  post: string;
  user: string;
  replies: CommentReplyObject[];
  likes: any[];
  interactedBy: string;
  comment: string;
  collectionId: any[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IUpdateReplyResponse {
  data: CommentReplyObject;
  message: string;
}
