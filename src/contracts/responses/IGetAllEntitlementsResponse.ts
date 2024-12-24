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
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  stripeProductId: string;
  stripeProductFeatureIds: string[];
  featureIds: string[];
  stripeProductObject: {
    id: string;
    object: string;
    active: boolean;
  };
  planType: string;
  userId: string;
  isDeleted: boolean;
  deletedAt: string | null;
  permissions: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  success: boolean;
  data: IGetOnePlanForAllObject | IGetOnePlanForAllObject[];
  meta?: IGetAllEntitlementsMetaObject;
}

export interface IGetAllEntitlementsResponse {
  data: IGetAllEntitlementsObject[];
  meta: IGetAllEntitlementsMetaObject;
}
