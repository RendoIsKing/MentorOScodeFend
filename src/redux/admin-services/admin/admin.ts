import { verify } from "crypto";
import {
  TAG_GET_INTERESTS,
  TAG_GET_REPORTS,
  TAG_GET_USERS,
  TAG_GET_VERIFYDOCUMENT,
} from "@/contracts/haveMeAPITags";
import { adminApi } from "..";

export const adminUserApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      providesTags: [TAG_GET_USERS],
      query: ({ page, per_page, searchTerm }) => {
        return {
          url: `user?page=${page}&perPage=${per_page}&search=${searchTerm}`,
          method: "GET",
        };
      },
    }),

    getPosts: builder.query({
      query: ({ page, per_page, user }) => {
        return {
          url: `post?page=${page}&perPage=${per_page}&user=${user}`,
          method: "GET",
        };
      },
    }),

    getUsersDocuments: builder.query({
      providesTags: [TAG_GET_VERIFYDOCUMENT],
      query: ({ page, per_page }) => {
        return {
          url: `documents?page=${page}&perPage=${per_page}`,
          method: "GET",
        };
      },
    }),
    getUsersInterests: builder.query({
      providesTags: [TAG_GET_INTERESTS],
      query: ({ page, per_page }) => {
        return {
          url: `interests?page=${page}&perPage=${per_page}`,
          method: "GET",
        };
      },
    }),

    getIndividualUser: builder.query({
      query: (id) =>
        // console.log(id),
        ({
          url: `user/${id}`,
          method: "GET",
        }),
    }),

    getUserByName: builder.query({
      query: (id) => {
        return {
          url: `/user/find/?userName=${id}`,
          method: "GET",
        };
      },
    }),

    addPost: builder.mutation({
      query: (body) => ({
        url: `posts`,
        method: "POST",
        body,
      }),
    }),

    updatePost: builder.mutation({
      query: (body) => ({
        url: `posts/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    uploadImage: builder.mutation({
      query: (body) => ({
        url: `files/upload`,
        method: "POST",
        body,
      }),
    }),

    createUser: builder.mutation({
      query: (body) => ({
        url: `user`,
        method: "POST",
        body,
      }),
    }),

    createUserInterest: builder.mutation({
      invalidatesTags: [TAG_GET_INTERESTS],
      query: (body) => ({
        url: `interests`,
        method: "POST",
        body,
      }),
    }),

    updateUserInterest: builder.mutation({
      invalidatesTags: [TAG_GET_INTERESTS],
      query: (body) => {
        //console.log("body", body);
        return {
          url: `interests/update/${body.id}`,
          method: "POST",
          body: {
            isAvailable: body.isAvailable,
          },
        };
      },
    }),

    updateUser: builder.mutation({
      query: (body) => {
        //console.log("body", body);
        return {
          url: `user/${body.id}`,
          method: "POST",
          body: body.updatedDetails,
        };
      },
    }),
    updateUserStatus: builder.mutation({
      invalidatesTags: [TAG_GET_USERS],
      query: (body) => {
        return {
          url: `user/${body.id}/status?status=${body.newStatus}`,
          method: "PUT",
        };
      },
    }),
    grantUserFullPermission: builder.mutation({
      invalidatesTags: [TAG_GET_USERS],
      query: (id) => {
        return {
          url: `user/${id}/make-it-free`,
          method: "PATCH",
        };
      },
    }),
    deleteUserInterest: builder.mutation({
      invalidatesTags: [TAG_GET_INTERESTS],
      query: (id) => ({
        url: `interests/${id}`,
        method: "DELETE",
      }),
    }),

    deleteUser: builder.mutation({
      invalidatesTags: [TAG_GET_USERS],
      query: (body) => ({
        url: `user/${body}`,
        method: "DELETE",
      }),
    }),

    verifyDocument: builder.mutation({
      invalidatesTags: [TAG_GET_VERIFYDOCUMENT],
      query: (body) => {
        return {
          url: `documents/verify/${body}`,
          method: "POST",
          body,
        };
      },
    }),

    verifyStatus: builder.mutation({
      invalidatesTags: [TAG_GET_REPORTS],
      query: (body) => {
        return {
          url: `/more-actions/update-report/${body.id}`,
          method: "POST",
          body: {
            reportStatus: body?.reportStatus,
          },
        };
      },
    }),

    downloadDocument: builder.query({
      query: (docId) => ({
        url: `user/file-download/${docId}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    getReports: builder.query({
      providesTags: [TAG_GET_REPORTS],
      query: () => ({
        url: `more-actions/query`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useVerifyStatusMutation,
  useGetReportsQuery,
  useGetUsersQuery,
  useGetUsersInterestsQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useUploadImageMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersDocumentsQuery,
  useGetIndividualUserQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useGrantUserFullPermissionMutation,
  useCreateUserInterestMutation,
  useVerifyDocumentMutation,
  useUpdateUserInterestMutation,
  useDeleteUserInterestMutation,
  useGetPostsQuery,
  useLazyDownloadDocumentQuery,
  useLazyGetUserByNameQuery,
} = adminUserApi;
