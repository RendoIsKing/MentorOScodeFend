export interface TransactionMetaObject {
  pages: number;
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface TransactionObject {
  _id: string;
  userId: string;
  amount: number;
  stripePaymentIntentId: string;
  stripeProductId: string;
  productId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  type: string;
}

export interface IGetTransactionResponse {
  data: TransactionObject[];
  meta: TransactionMetaObject;
}
