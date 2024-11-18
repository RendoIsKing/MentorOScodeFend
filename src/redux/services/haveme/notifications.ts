import { havemeApi } from ".";
import { IGetNotificationRequest } from "@/contracts/requests/IGetNotificationRequest";
import { ISendNotificationRequest } from "@/contracts/requests/ISendNotificationRequest";
import { IGetNotificationResponse } from "@/contracts/responses/IGetNotificationResponse";

export const notificationApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    sendNotification: builder.mutation<any, ISendNotificationRequest>({
      query: (body) => ({
        url: `/notifications`,
        method: "POST",
        body,
      }),
    }),

    getNotification: builder.query<
      IGetNotificationResponse,
      IGetNotificationRequest
    >({
      query: ({ page, perPage }) => ({
        url: `/notifications?page=${page}&perPage=${perPage}`,
        method: "get",
      }),
    }),
    updateFCMToken: builder.mutation<any, any>({
      query: (body) => ({
        url: "/user/fcm-token",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSendNotificationMutation,
  useGetNotificationQuery,
  useUpdateFCMTokenMutation,
} = notificationApi;
