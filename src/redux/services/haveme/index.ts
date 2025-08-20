import { HAVE_ME_API_REDUCER_KEY } from "@/contracts/reduxResourceTags";
import { IUserLoginRequest } from "@/contracts/requests/IUserLoginRequest";
import { IAuthRequest } from "@/contracts/requests/IAuthRequest";
import { IVerifyOtpRequest } from "@/contracts/requests/IVerifyOtpRequest";
import { IApiErrorResponse } from "@/contracts/responses/IApiErrorResponse";
import { IUserAuthErrorResponse } from "@/contracts/responses/IUserAuthErrorResponse";
import { IAuthResponse } from "@/contracts/responses/IAuthResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IUserLoginResponse } from "@/contracts/responses/IUserLoginResponse";
import {
  IVerifyOtpResponse,
  VerifyOtpResponseObject,
} from "@/contracts/responses/IVerifyOtpResponse";
import { AUTH_TOKEN } from "@/redux/slices/auth";
import { RootState } from "@/redux/store";
import { ICheckUsernameResponse } from "@/contracts/responses/ICheckUsernameResponse";
import { ICheckUsernameRequest } from "@/contracts/requests/ICheckUsernameRequest";
import { IVerifyDocumentRequest } from "@/contracts/requests/IVerifyDocument";
import {
  ICreateUserResponse,
  IUpdateUserResponse,
} from "@/contracts/responses/ICreateUserResponse";
import {
  ICreateUserRequest,
  IUpdateUserRequest,
} from "@/contracts/requests/ICreateUserRequest";
import { IGetInterestResponse } from "@/contracts/responses/IGetInterestResponse";
import { IUpdateInterestResponse } from "@/contracts/responses/IUpdateInterestResponse";
import { IUpdateInterestRequest } from "@/contracts/requests/IUpdateInterestRequest";
import { IUploadFileResponse } from "@/contracts/responses/IUploadFileResponse";
import { IUploadFileRequest } from "@/contracts/requests/IUploadFileRequest";
import { ISkipUserPhotoRequest } from "@/contracts/requests/ISkipUserPhotoRequest";
import { IUploadDocumentRequest } from "@/contracts/requests/IUploadDocumentRequest";
import { IGetCurrentUserResponse } from "@/contracts/responses/IGetCurrentUserResponse";
import {
  TAG_GET_USER_INFO,
  TAG_GET_USER_PLANS,
  TAG_GET_FILE_INFO,
  TAG_GET_COMMENTS_BY_POST_ID,
  TAG_GET_FILE_INFO_BY_ID,
  TAG_GET_USER_DETAILS_BY_USER_NAME,
  TAG_GET_USER_POSTS_BY_USERNAME,
  TAG_GET_FOLLOWERS_LIST,
  TAG_GET_FOLLOWING_LIST,
  TAG_GET_USER_CARDS_LIST,
  TAG_GET_USER_ENTITLEMENTS,
  TAG_GET_USER_TRANSACTIONS,
  TAG_GET_SUBSCRIBERS_LIST,
  TAG_GET_TAGGED_USERS_LIST,
  TAG_GET_SEARCH_USERS,
} from "@/contracts/haveme/haveMeApiTags";
import { IGetFileRequest } from "@/contracts/requests/IGetFileRequest";
import { IGetFileResponse } from "@/contracts/requests/IGetFileResponse";
import { IValidateOtpResponse } from "@/contracts/requests/IValidateOtpResponse";
import { IValidateOtpRequest } from "@/contracts/requests/IValidateOtpRequest";

const defaultBase = "/api/backend"; // proxied via next.config.js rewrites in dev

export const havemeApi = createApi({
  reducerPath: HAVE_ME_API_REDUCER_KEY,
  tagTypes: [
    TAG_GET_USER_INFO,
    TAG_GET_USER_PLANS,
    TAG_GET_FILE_INFO,
    TAG_GET_COMMENTS_BY_POST_ID,
    TAG_GET_FILE_INFO_BY_ID,
    TAG_GET_USER_DETAILS_BY_USER_NAME,
    TAG_GET_USER_POSTS_BY_USERNAME,
    TAG_GET_FOLLOWERS_LIST,
    TAG_GET_FOLLOWING_LIST,
    TAG_GET_SUBSCRIBERS_LIST,
    TAG_GET_USER_CARDS_LIST,
    TAG_GET_USER_ENTITLEMENTS,
    TAG_GET_USER_TRANSACTIONS,
    TAG_GET_TAGGED_USERS_LIST,
    TAG_GET_SEARCH_USERS,
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_SERVER || defaultBase}/v1`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("ngrok-skip-browser-warning", "123");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserDetails: builder.query<IGetCurrentUserResponse, void>({
      providesTags: [TAG_GET_USER_INFO],
      query: (body) => {
        return {
          url: "/auth/me",
          method: "get",
        };
      },
    }),
    loginUser: builder.mutation<IUserLoginResponse, IUserLoginRequest>({
      query: (body) => {
        // Dynamically construct the request body based on login method
        const requestBody = body.email
          ? {
              email: body.email,
              password: body.password,
            }
          : {
              phoneNumber: body.phoneNumber,
              dialCode: body.dialCode.replace("+", ""),
              password: body.password,
            };

        return {
          url: "/auth/user-login",
          method: "POST",
          body: requestBody,
        };
      },
    }),
    registerUser: builder.mutation<IAuthResponse, IAuthRequest>({
      query: (body) => {
        return {
          url: "/auth/user-login",
          method: "post",
          body: {
            phoneNumber: body.phoneNumber,
            dialCode: body.prefix.replace("+", ""),
          },
        };
      },
    }),
    forgotPassword: builder.mutation<IAuthResponse, IAuthRequest>({
      query: (body) => {
        return {
          url: "/auth/forget-password",
          method: "post",
          body: {
            phoneNumber: body.phoneNumber,
            dialCode: body.prefix.replace("+", ""),
          },
        };
      },
    }),
    verifyOtp: builder.mutation<VerifyOtpResponseObject, IVerifyOtpRequest>({
      invalidatesTags: [TAG_GET_USER_INFO],
      query: (body) => {
        return {
          url: "/auth/verify-otp",
          method: "post",
          body: {
            ...body,
            otp: body.otp,
          },
        };
      },
    }),
    checkUsername: builder.query<ICheckUsernameResponse, ICheckUsernameRequest>(
      {
        query: (body) => {
          return {
            url: `/user/user-name-availability?username=${body.username}`,
            method: "get",
          };
        },
      }
    ),
    createUser: builder.mutation<ICreateUserResponse, ICreateUserRequest>({
      invalidatesTags: [TAG_GET_USER_INFO],
      query: (body) => {
        return {
          url: "/user/account",
          method: "post",
          body,
        };
      },
    }),
    // uploadFile: builder.mutation<any, any>({
    //   query: (body) => ({
    //     url: `files/upload`,
    //     method: "POST",
    //     body,
    //   }),
    // }),

    uploadDocument: builder.mutation<any, IUploadDocumentRequest>({
      invalidatesTags: [TAG_GET_USER_INFO],
      query: (body) => {
        return {
          url: `/documents`,
          method: "post",
          body,
        };
      },
    }),
    // updateUser: builder.mutation<IUpdateUserResponse, IUpdateUserRequest>({
    //   query: (body) => {
    //     return {
    //       url: `/user/${body.id}`,
    //       method: "post",
    //       body,
    //     };
    //   },
    // }),
    // providesTags: []
    uploadFile: builder.mutation<any, FormData>({
      invalidatesTags: [TAG_GET_USER_INFO],
      query: (body) => {
        return {
          url: "/user/file-upload",
          method: "post",
          body,
        };
      },
    }),
    deleteFile: builder.mutation<void, string>({
      invalidatesTags: [TAG_GET_USER_INFO],
      query: (fileId) => {
        return {
          url: `/user/file-remove/${fileId}`,
          method: "delete",
        };
      },
    }),

    updateInterests: builder.mutation<
      IUpdateInterestResponse,
      IUpdateInterestRequest
    >({
      invalidatesTags: [TAG_GET_USER_INFO],
      query: (body) => {
        return {
          url: "/interests/user",
          method: "post",
          body,
        };
      },
    }),
    getInterests: builder.query<IGetInterestResponse, void>({
      query: (body) => {
        return {
          url: "/interests",
          method: "get",
        };
      },
    }),
    skipUserPhoto: builder.mutation<any, ISkipUserPhotoRequest>({
      invalidatesTags: [TAG_GET_USER_INFO],
      query: (body) => {
        return {
          url: "/user/hasPhotoSkipped",
          method: "post",
          body,
        };
      },
    }),
    validateOtp: builder.mutation<IValidateOtpResponse, IValidateOtpRequest>({
      query: (body) => {
        return {
          url: "/auth/validate-otp",
          method: "POST",
          body: {
            dialCode: body.dialCode.replace("+", ""), // Remove "+" if needed
            phoneNumber: body.phoneNumber,
            otp: body.otp,
          },
        };
      },
    }),
    resetPassword: builder.mutation<
      void,
      {
        countryCode: string;
        mobileNumber: string;
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "PUT",
        body: {
          dialCode: body.countryCode.replace("+", ""), // Ensure dial code does not include "+"
          phoneNumber: body.mobileNumber,
          newPassword: body.newPassword,
          confirmPassword: body.confirmPassword,
        },
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useLazyCheckUsernameQuery,
  useCreateUserMutation,
  useUploadFileMutation,
  useUploadDocumentMutation,
  useUpdateInterestsMutation,
  useGetInterestsQuery,
  useSkipUserPhotoMutation,
  useDeleteFileMutation,
  useGetUserDetailsQuery,
  useValidateOtpMutation,
  useResetPasswordMutation,
} = havemeApi;
