import {
  TAG_GET_INTERESTS,
  TAG_GET_REPORTS,
  TAG_GET_USERS,
  TAG_GET_VERIFYDOCUMENT,
} from "@/contracts/haveMeAPITags";
import { HAVE_ME_ADMIN_API_REDUCER_KEY } from "@/contracts/reduxResourceTags";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/redux/store";

// Define separate reducer paths for admin and user APIs
export const adminApi = createApi({
  reducerPath: HAVE_ME_ADMIN_API_REDUCER_KEY,
  tagTypes: [
    TAG_GET_INTERESTS,
    TAG_GET_VERIFYDOCUMENT,
    TAG_GET_USERS,
    TAG_GET_REPORTS,
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_SERVER}/v1`,
    prepareHeaders: (headers, { getState }) => {
      // console.log("getSate", getState());
      const token = (getState() as RootState).adminAuth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("ngrok-skip-browser-warning", "123");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    registerAdmin: builder.mutation({
      query: (body) => {
        return {
          url: "/auth/login",
          method: "post",
          body,
        };
      },
    }),
  }),
});

export const { useRegisterAdminMutation } = adminApi;
