
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// Define interfaces for your request and response types
interface NewItem {
  query: string; // For the chat message
}



interface FormData {
  File: string; 
}
interface ApiResponse {
  id: number; // Response fields for the chat API
  name: string;
  description: string;
}
interface AvatarLogoRequest {
  imageData: string;
}
interface AvatarLogoResponse {
  url: string; // URL of the generated avatar/logo
}
// Create a single API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery(), // Same base URL for both
  endpoints: (builder) => ({
    // First POST API for chat messages
    createItem: builder.mutation<ApiResponse, NewItem>({
      query: (newItem) => ({
        url: 'https://ai-staging.haveme.net/chat', 
        method: 'POST',
        body: newItem,
      }),
    }),

    saveFile: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: 'https://ai-staging.haveme.net/save_file', 
        method: 'POST',
        body: formData,
      }),
    }),

    deleteAvatarTraining: builder.mutation<void, string>({
      query: (id) => ({
        url: `https://apistaging.haveme.net/api/file/removefile/${id}`,
        method: 'DELETE'
      }),
    }),

    getFiles: builder.query<any, void>({
      query: () => ({
        url: "https://apistaging.haveme.net/api/file/showfiles",
        method: 'GET',
      }),
    }),
    // Second POST API for generating avatar logos
    generateAvatar: builder.mutation<AvatarLogoResponse, AvatarLogoRequest>({
      query: (avatarLogoRequest) => ({
        url: 'https://ai-staging.haveme.net/get_avatar', // Endpoint for avatar/logo generation
        method: 'POST',
        body: avatarLogoRequest,
      }),
    }),
  }),
});
export const { useCreateItemMutation, useSaveFileMutation, useDeleteAvatarTrainingMutation, useGetFilesQuery, useGenerateAvatarMutation } = apiSlice;
