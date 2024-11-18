import { adminApi } from "..";

export const adminEntitlementsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllEntitlementFeatures: builder.query({
      query: ({ page, per_page }) => {
        return {
          url: `feature?page=${page}&perPage=${per_page}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useGetAllEntitlementFeaturesQuery } = adminEntitlementsApi;
