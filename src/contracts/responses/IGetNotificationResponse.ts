export interface NotificationResponseObject {
  _id: string;
  title: string;
  description: string;
  sentTo: string[];
  readAt: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  deletedAt: string | null;
  isDeleted: boolean;
  notificationOnPost?: string;
  notificationFromUserDetails?: string;
}

export interface IGetNotificationMetaObject {
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface IGetNotificationResponse {
  data: NotificationResponseObject[];
  meta: IGetNotificationMetaObject;
}
