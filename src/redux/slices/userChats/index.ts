// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// // Define interfaces for your request and response types
// interface NewItem {
//     userId: string; // For the chat message
//   }
// interface ApiResponse {
//   id: number; // Response fields for the chat API
//   name: string;
//   description: string;
// }
// // Create a single API slice
// export const userSliceApi = createApi({
//   reducerPath: 'userApi',
//   baseQuery: fetchBaseQuery({ baseUrl: 'http://54.147.194.28/api/chat' }), // Same base URL for both
//   endpoints: (builder) => ({
//     getChat: builder.query<ApiResponse, NewItem>({
//       query: (userId) => ({
//         url: `/show-chat?userId=${userId}`,
//         method: 'GET',
//       }),
//     }),
// }),
// });
// export const { useGetChatQuery } = userSliceApi;



import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define interfaces for your request and response types
interface NewItem {
  userId: string; // For the chat message
}

interface ChatMessage {
  createdAt: string;
  sender: string;
  chatMessage: string;
  userId: string;
}
interface ApiResponse {
  id: number; // Response fields for the chat API
  name: string;
  description: string;
  chat: ChatMessage[];
}

// Create a single API slice
export const userSliceApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://apistaging.haveme.net/api/' }),
  endpoints: (builder) => ({
    getChat: builder.query<ApiResponse, string>({
      query: ( userId ) => ({
        url: `chat/show-chat/${userId}`,
        method: 'GET',
      }),
    }),
    submitAvatar: builder.mutation({
      query: (avatarUrl) => ({
        url: 'user/addAvatar',
        method: 'PUT',
        body: avatarUrl,
      }),
    }),
    getAvatar: builder.query({
      query: () => 'user/show-avatar',
    }),
    deleteAvatar: builder.mutation<void, void>({
      query: () => ({
        url: 'user/remove-avatar',
        method: 'DELETE'
      }),
    }),
  }),
});
export const { useGetChatQuery, useSubmitAvatarMutation, useGetAvatarQuery, useDeleteAvatarMutation } = userSliceApi;