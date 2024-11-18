import { havemeApi } from ".";

interface IGetCreatorCenterStatsRequest {
  startDate: string;
  endDate: string;
}
export interface PostAnalytics {
  liked: number;
  title: string;
  tipped: number;
}

export interface Statistics {
  percentageChange: number;
  title: string;
  value: string;
}

interface IGetCreatorCenterResponse {
  postAnalytics: PostAnalytics[];
  statistics: Statistics[];
}

export const creatorCenterApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    getCreatorCenterStats: builder.mutation<
      IGetCreatorCenterResponse,
      IGetCreatorCenterStatsRequest
    >({
      query: (body) => ({
        url: `stats/creator`,
        method: "POST",
        body,
      }),
    }),

    getUserChartsData: builder.mutation<any, any>({
      query: (body) => {
        return {
          url: `/stats/user-chart`,
          method: "POST",
          body,
        };
      },
    }),

    getUserEarningData: builder.mutation<any, any>({
      query: (body) => {
        return {
          url: `/stats/user-earning`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const {
  useGetCreatorCenterStatsMutation,
  useGetUserChartsDataMutation,
  useGetUserEarningDataMutation,
} = creatorCenterApi;
