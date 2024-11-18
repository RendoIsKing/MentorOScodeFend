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

export interface IGetAllEntitlementsResponse {
  data: IGetAllEntitlementsObject[];
  meta: IGetAllEntitlementsMetaObject;
}
