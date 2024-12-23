export interface IPlatformSubscriptionObject {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  __v: number;
  status: string;
}

export interface IGetOnePlanForAllObject {
  platformSubscription: IPlatformSubscriptionObject[];
  title: string;
  description: string;
  price: number;
  duration: number;
  _id: string;
}

export interface IGetAllEntitlementsObject {
  slug?: string;
  feature: string;
  description: string;
  isAvailable: boolean;
}

export interface IGetAllEntitlementsMetaObject {
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}
export interface IGetOnePlanForAllResponse {
  data: IGetOnePlanForAllObject[];
  meta: IGetAllEntitlementsMetaObject;
}

export interface IGetAllEntitlementsResponse {
  data: IGetAllEntitlementsObject[];
  meta: IGetAllEntitlementsMetaObject;
}
