import { havemeApi } from ".";

export const reportApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    sendUserReport: builder.mutation({
      query: (body) => {
        return {
          url: `/more-actions`,
          method: "POST",
          body,
        };
      },
    }),
    sendUserQuery: builder.mutation({
      query: (body) => {
        return {
          url: `/more-actions/query`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const { useSendUserReportMutation, useSendUserQueryMutation } =
  reportApi;
