export interface CreateImpressionObject {
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
export interface ICreateImpressionResponse {
  data: CreateImpressionObject;
  message: string;
}
