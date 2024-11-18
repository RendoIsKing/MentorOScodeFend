import {
  TAG_GET_COMMENTS_BY_POST_ID,
  TAG_GET_FILE_INFO,
  TAG_GET_FILE_INFO_BY_ID,
  TAG_GET_TAGGED_USERS_LIST,
  TAG_GET_USER_POSTS_BY_USERNAME,
} from "@/contracts/haveme/haveMeApiTags";
import { havemeApi } from ".";
import {
  IGetPostContentRequest,
  IPostContentRequest,
} from "@/contracts/requests/IPostContentRequest";
import { IPostContentResponse } from "@/contracts/responses/IPostContentResponse";
import { IPostObjectResponse } from "@/contracts/responses/IPostObjectResponse";
import { UploadFileResponseObject } from "@/contracts/responses/IUploadFileResponse";
import {
  IGetCommentPostResponse,
  IUpdateCommentPostResponse,
} from "@/contracts/responses/IUpdateCommentPostResponse";
import { IUpdateCommentPostRequest } from "@/contracts/requests/IUpdateCommentPostRequest";
import { IUpdateReplyRequest } from "@/contracts/requests/IUpdateReplyRequest";
import { IUpdateReplyResponse } from "@/contracts/responses/IUpdateReplyResponse";
import { metaDataObj } from "./search";
import { IPayForPostRequest } from "@/contracts/requests/IPayForPostRequest";
import { ILikePostResponse } from "@/contracts/responses/ILikePostResponse";

interface IGetPostByUserNameRequest {
  userName: string;
  page: number;
  perPage: number;
  filter: string;
}

interface IGetPostByUserNameResponse {
  data: IPostObjectResponse[];
  meta: metaDataObj;
}

export interface TaggedUsersList {
  _id: string;
  fullName: string;
  userName: string;
  photoId?: string;
  isFollowing: boolean;
  photo?: {
    path: string;
  };
}
interface ITaggedUserListResponse {
  taggedUsers: TaggedUsersList[];
  _id: string;
}

export const postsApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<IPostContentResponse, IPostContentRequest>({
      invalidatesTags: [TAG_GET_USER_POSTS_BY_USERNAME],
      query: (body) => ({
        url: `/post`,
        method: "POST",
        body,
      }),
    }),
    getPosts: builder.query<IPostContentResponse, IGetPostContentRequest>({
      providesTags: [TAG_GET_FILE_INFO],
      query: (body) => {
        let { page = 1, perPage = 10, search, filter = "all" } = body;
        let url = `/post?page=${page}&perPage=${perPage}&search=${search}&filter=${filter}`;
        return {
          url: url,
          method: "GET",
        };
      },
    }),
    getPostById: builder.query<IPostObjectResponse, string | string[]>({
      providesTags: [TAG_GET_FILE_INFO_BY_ID],
      query: (postId) => {
        return {
          url: `/post/${postId}`,
          method: "GET",
        };
      },
    }),
    getPostMediaById: builder.query<UploadFileResponseObject, string>({
      //   providesTags: [TAG_GET_FILE_INFO],
      query: (postId) => {
        return {
          url: `/user/files/${postId}`,
          method: "GET",
        };
      },
    }),

    likePost: builder.mutation<ILikePostResponse, string>({
      // invalidatesTags: [TAG_GET_FILE_INFO, TAG_GET_USER_POSTS_BY_USERNAME],
      query: (body) => ({
        url: `/interaction/toggle-like/${body}`,
        method: "POST",
      }),
    }),

    commentPost: builder.mutation<any, any>({
      // invalidatesTags: [TAG_GET_FILE_INFO],
      query: (body) => ({
        url: `/interaction/comment/${body}`,
        method: "POST",
      }),
    }),

    updatePostComment: builder.mutation<
      IUpdateCommentPostResponse,
      IUpdateCommentPostRequest
    >({
      invalidatesTags: [TAG_GET_COMMENTS_BY_POST_ID],
      query: (body) => ({
        url: `/interaction/comment/${body.postId}`,
        method: "POST",
        body: {
          comment: body.comment,
        },
      }),
    }),
    updateReplyComment: builder.mutation<
      IUpdateReplyResponse,
      IUpdateReplyRequest
    >({
      invalidatesTags: [TAG_GET_COMMENTS_BY_POST_ID],
      query: (body) => {
        return {
          url: `/interaction/reply-comment/${body.parentCommentId}`,
          method: "POST",
          body: {
            comment: body.reply,
          },
        };
      },
    }),
    getCommentsByPostId: builder.query<
      IGetCommentPostResponse,
      string | string[]
    >({
      providesTags: [TAG_GET_COMMENTS_BY_POST_ID],
      query: (postId) => ({
        url: `/interaction/comments/${postId}`,
        method: "GET",
      }),
    }),

    updatePost: builder.mutation<IPostContentResponse, IPostContentRequest>({
      invalidatesTags: [TAG_GET_FILE_INFO_BY_ID],
      query: (body) => ({
        url: `/post/${body.id}`,
        method: "POST",
        body,
      }),
    }),
    deletePost: builder.mutation<IPostContentResponse, string>({
      invalidatesTags: [TAG_GET_FILE_INFO, TAG_GET_USER_POSTS_BY_USERNAME],
      query: (postId) => ({
        url: `/post/${postId}`,
        method: "DELETE",
      }),
    }),

    getCurrentUserPosts: builder.query<
      IPostObjectResponse,
      IGetPostContentRequest
    >({
      providesTags: [TAG_GET_FILE_INFO],
      query: (body) => {
        let { page = 1, perPage = 10, filter = "posts" } = body;
        let url = `/post?page=${page}&perPage=${perPage}&filter=${filter}`;
        return {
          url: url,
          method: "GET",
        };
      },
    }),

    likeComment: builder.mutation<IPostContentResponse, string>({
      invalidatesTags: [TAG_GET_COMMENTS_BY_POST_ID],
      query: (commentId) => ({
        url: `/interaction/like-comment/${commentId}`,
        method: "POST",
      }),
    }),

    savePost: builder.mutation<IPostObjectResponse, string>({
      // invalidatesTags: [TAG_GET_FILE_INFO, TAG_GET_USER_POSTS_BY_USERNAME],
      query: (commentId) => ({
        url: `/interaction/toggle-saved/${commentId}`,
        method: "POST",
      }),
    }),

    deleteComment: builder.mutation<IPostContentResponse, string>({
      invalidatesTags: [TAG_GET_COMMENTS_BY_POST_ID],
      query: (commentId) => ({
        url: `/interaction/comment/${commentId}`,
        method: "DELETE",
      }),
    }),
    getPostsByUserName: builder.query<
      IGetPostByUserNameResponse,
      IGetPostByUserNameRequest
    >({
      providesTags: [TAG_GET_USER_POSTS_BY_USERNAME],
      query: ({ userName, page, perPage, filter }) => {
        return {
          url: `/post/users?userName=${userName}&page=${page}&perPage=${perPage}&filter=${filter}`,
          method: "GET",
        };
      },
    }),

    getStoriesByUserName: builder.query({
      providesTags: [TAG_GET_USER_POSTS_BY_USERNAME],
      query: ({ userName, page, perPage }) => {
        return {
          url: `/post/user-story?userName=${userName}&page=${page}&perPage=${perPage}`,
          method: "GET",
        };
      },
    }),

    getFollowingUsersStory: builder.query({
      providesTags: [TAG_GET_USER_POSTS_BY_USERNAME],
      query: ({ page, perPage }) => {
        return {
          url: `/post/story?page=${page}&perPage=${perPage}`,
          method: "GET",
        };
      },
    }),

    likeStory: builder.mutation({
      query: (storyId) => ({
        url: `/interaction/like-story/${storyId}`,
        method: "POST",
      }),
    }),

    payForPost: builder.mutation<any, IPayForPostRequest>({
      query: (body) => ({
        url: `/subscriptions/one-time`,
        method: "POST",
        body,
      }),
    }),

    getTaggedUserList: builder.query<
      ITaggedUserListResponse,
      string | string[]
    >({
      providesTags: [TAG_GET_TAGGED_USERS_LIST],
      query: (postId) => {
        return {
          url: `/post/tagged/${postId}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useUpdatePostMutation,
  useLikePostMutation,
  useCommentPostMutation,
  useGetCurrentUserPostsQuery,
  useGetPostByIdQuery,
  useGetPostMediaByIdQuery,
  useGetCommentsByPostIdQuery,
  useUpdatePostCommentMutation,
  useUpdateReplyCommentMutation,
  useDeletePostMutation,
  useLikeCommentMutation,
  useGetPostsByUserNameQuery,
  useDeleteCommentMutation,
  useSavePostMutation,
  useGetFollowingUsersStoryQuery,
  useGetStoriesByUserNameQuery,
  useLikeStoryMutation,
  usePayForPostMutation,
  useLazyGetTaggedUserListQuery,
} = postsApi;
