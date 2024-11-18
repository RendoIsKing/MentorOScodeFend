import { adminApi } from "..";

export const adminTransectionApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransections: builder.query({
      query: ({ page, per_page, searchTerm }) => {
        return {
          url: `transactions/all?page=${page}&perPage=${per_page}&search=${searchTerm}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useGetAllTransectionsQuery } = adminTransectionApi;
