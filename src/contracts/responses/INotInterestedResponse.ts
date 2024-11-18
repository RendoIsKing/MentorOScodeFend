export interface NotInterestedObject {
  actionType: string;
  actionByUser: string;
  actionOnPost: string;
  isDeleted: boolean;
  deletedAt: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface INotInterestedResponse {
  data: NotInterestedObject;
  message: string;
}
