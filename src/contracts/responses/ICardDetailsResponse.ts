interface CardDetails {
  userId: string;
  cardId: string;
  object: string;
  address_city: string | null;
  address_country: string;
  brand: string;
  country: string;
  cvc_check: string;
  dynamic_last4: string | null;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  last4: string;
  tokenization_method: string | null;
  wallet: string | null;
  isActive: boolean;
  activatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ICardDetailsResponse {
  cardDetails: CardDetails;
  message: string;
}
