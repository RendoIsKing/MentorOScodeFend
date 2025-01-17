import { havemeApi } from ".";
import { ICreateImpressionRequest } from "@/contracts/requests/ICreateImpressionRequest";
import { INotInterestedRequest } from "@/contracts/requests/INotInterestedRequest";
import { ICreateImpressionResponse } from "@/contracts/responses/ICreateImpressionResponse";

export const interactionsApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    createImpression: builder.mutation<
      ICreateImpressionResponse,
      ICreateImpressionRequest
    >({
      query: (body) => {
        return {
          url: `interaction/impressions`,
          method: "POST",
          body,
        };
      },
    }),
    logView: builder.mutation<any, ICreateImpressionRequest>({
      query: (body) => {
        return {
          url: `interaction/log-view`,
          method: "POST",
          body,
        };
      },
    }),
    notInterested: builder.mutation<any, INotInterestedRequest>({
      query: (body) => {
        return {
          url: `more-actions`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const {
  useCreateImpressionMutation,
  useLogViewMutation,
  useNotInterestedMutation,
} = interactionsApi;
