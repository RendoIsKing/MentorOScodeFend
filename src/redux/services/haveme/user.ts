import {
  TAG_GET_USER_DETAILS_BY_USER_NAME,
  TAG_GET_FILE_INFO,
  TAG_GET_USER_INFO,
  TAG_GET_FOLLOWERS_LIST,
  TAG_GET_FOLLOWING_LIST,
  TAG_GET_SUBSCRIBERS_LIST,
} from "@/contracts/haveme/haveMeApiTags";
import { havemeApi } from ".";
import {
  IGetPostContentRequest,
  IPostContentRequest,
} from "@/contracts/requests/IPostContentRequest";
import { UploadFileResponseObject } from "@/contracts/responses/IUploadFileResponse";
import { IUpdateUserRequest } from "@/contracts/requests/ICreateUserRequest";
import { IUpdateUserResponse } from "@/contracts/responses/ICreateUserResponse";
import { IGetCurrentUserResponse } from "@/contracts/responses/IGetCurrentUserResponse";
import { IGetUsernameDetailsRequest } from "@/contracts/requests/IGetUsernameDetailRequest";
import { IFollowResponse } from "@/contracts/responses/IFollowResponse";
import { IFollowingResponse } from "@/contracts/responses/IFollowingResponse";
import { IProcessUserDataRequest } from "@/contracts/requests/IProcessUserDataRequest";
import { IDownloadUserDataRequest } from "@/contracts/requests/IDownloadUserDataRequest";

export const usersApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserDetailsByUserName: builder.query<
      IGetCurrentUserResponse,
      IGetUsernameDetailsRequest
    >({
      providesTags: [TAG_GET_USER_DETAILS_BY_USER_NAME],
      query: ({ userName }) => {
        return {
          url: `user/find?userName=${userName}`,
          method: "GET",
        };
      },
    }),
    getUserProfilePhoto: builder.query<UploadFileResponseObject, string>({
      //   providesTags: [TAG_GET_FILE_INFO],
      query: (userId) => {
        return {
          url: `/user/files/${userId}`,
          method: "GET",
        };
      },
    }),

    updateUser: builder.mutation<IUpdateUserResponse, IUpdateUserRequest>({
      invalidatesTags: [TAG_GET_FILE_INFO],
      query: (body) => {
        return {
          url: `/user/${body.id}`,
          method: "POST",
          body,
        };
      },
    }),
    updateUserPhoto: builder.mutation<IUpdateUserResponse, IUpdateUserRequest>({
      invalidatesTags: [TAG_GET_FILE_INFO],
      query: (body) => {
        return {
          url: `/user/${body.id}`,
          method: "POST",
          body: {
            photoId: body.photoId,
          },
        };
      },
    }),
    updateUserCoverPhoto: builder.mutation<
      IUpdateUserResponse,
      IUpdateUserRequest
    >({
      invalidatesTags: [TAG_GET_FILE_INFO],
      query: (body) => {
        return {
          url: `/user/${body.id}`,
          method: "POST",
          body: {
            coverPhoto: body.photoId,
          },
        };
      },
    }),
    followUser: builder.mutation({
      invalidatesTags: [TAG_GET_FILE_INFO],
      query: (body) => {
        return {
          url: `user-connections/follow`,
          method: "POST",
          body,
        };
      },
    }),
    updateMe: builder.mutation<IUpdateUserResponse, IUpdateUserRequest>({
      invalidatesTags: [TAG_GET_USER_INFO],
      query: (body) => {
        return {
          url: `/auth/me`,
          method: "POST",
          body,
        };
      },
    }),
    getFollowerList: builder.query<IFollowResponse, string>({
      providesTags: [TAG_GET_FOLLOWERS_LIST],
      query: (userId) => {
        return {
          url: `/stats/followers/${userId}`,
          method: "GET",
        };
      },
    }),
    getFollowingList: builder.query<IFollowingResponse, string>({
      providesTags: [TAG_GET_FOLLOWING_LIST],
      query: (userId) => {
        return {
          url: `/stats/following/${userId}`,
          method: "GET",
        };
      },
    }),

    getSupport: builder.query({
      query: () => {
        return {
          url: `/support/faq`,
          method: "GET",
        };
      },
    }),

    getSubscriberList: builder.query({
      providesTags: [TAG_GET_SUBSCRIBERS_LIST],
      query: (userId) => {
        return {
          url: `/stats/subscribers/${userId}`,
          method: "GET",
        };
      },
    }),
    deleteAccount: builder.mutation<any, string>({
      query: (userId) => ({
        url: `user/${userId}`,
        method: "DELETE",
      }),
    }),
    processUserData: builder.query<any, IProcessUserDataRequest>({
      query: (body) => ({
        url: `/process-data`,
        method: "POST",
        body,
      }),
    }),
    getUserData: builder.query<any, void>({
      query: (body) => ({
        url: `/process-data`,
        method: "GET",
      }),
    }),
    downloadUserData: builder.query<any, IDownloadUserDataRequest>({
      query: (body) => ({
        url: `/process-data/download`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetUserDetailsByUserNameQuery,
  useLazyGetUserDetailsByUserNameQuery,
  useFollowUserMutation,
  useGetUserProfilePhotoQuery,
  useUpdateUserMutation,
  useUpdateMeMutation,
  useUpdateUserPhotoMutation,
  useUpdateUserCoverPhotoMutation,
  useGetFollowerListQuery,
  useGetFollowingListQuery,
  useGetSubscriberListQuery,
  useGetSupportQuery,
  useDeleteAccountMutation,
  useLazyProcessUserDataQuery,
  useLazyDownloadUserDataQuery,
  useLazyGetUserDataQuery,
} = usersApi;
