export interface ICreateSubscriptionRequest {
  title?: string;
  description?: string;
  planType: string;
  price: number;
  duration?: number;
  entitlements?: entitlementsObj[];
  permissions?: PerksObj[];
  _id?: string;
  featureIds?: entitlementsObj[];
  isJoined?: boolean;
}

interface PerksObj {
  feature?: string;
  isAvailable?: boolean;
}

export interface entitlementsObj {
  feature?: string;
  description?: string;
  isAvailable?: boolean;
}
