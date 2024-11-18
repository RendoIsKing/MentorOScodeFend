export interface GetInterestObject {
  _id: string;
  __v: string;
  addedBy: string;
  createdAt: Date;
  deletedAt: Date;
  updatedAt: Date;
  slug: string;
  isAvailable: boolean;
  isDeleted: boolean;
  title: string;
}

export interface GetInterestMetaObject {
  page: number;
  pages: number;
  perPage: number;
  total: number;
}

export interface IGetInterestResponse {
  data: GetInterestObject[];
  meta: GetInterestMetaObject;
}
