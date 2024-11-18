import { UserBase } from "@/contracts/haveme/UserBase";
import { havemeApi } from ".";
import { TAG_GET_SEARCH_USERS } from "@/contracts/haveme/haveMeApiTags";
// response , request

export interface metaDataObj {
  perPage: number;
  page: string;
  pageCount: number;
  total: number;
}
export interface ISearchUserResponse {
  data?: UserBase[];
  meta: metaDataObj;
}

export interface ISearchUserRequest {
  searchTerm: string | string[];
  page: number;
  perPage: number;
  type?: string;
  filter?: string;
}

export const searchApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ISearchUserResponse, ISearchUserRequest>({
      providesTags: [TAG_GET_SEARCH_USERS],
      query: ({ page, perPage, searchTerm, filter = "all" }) => ({
        url: `user?page=${page}&perPage=${perPage}&search=${searchTerm}&filter=${filter}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUsersQuery } = searchApi;
