import { entitlementsObj } from "../requests/ICreateSubscriptionPlan";

export interface ISubscriptionPlanObject {
  _id: string;
  title: string;
  price: number;
  stripeProductFeatureIds: [];
  features: entitlementsObj[];
  planType: string;
  userId: string;
  isDeleted: boolean;
  deletedAt: Date;
  permissions: entitlementsObj[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  isJoined?: boolean
}

export interface IGetSubscriptionPlanResponse {
  data: ISubscriptionPlanObject[];
}
