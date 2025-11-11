import { ICreateSubscriptionRequest } from "@/contracts/requests/ICreateSubscriptionPlan";
import { havemeApi } from ".";
import {
  TAG_GET_USER_DETAILS_BY_USER_NAME,
  TAG_GET_USER_ENTITLEMENTS,
  TAG_GET_USER_PLANS,
} from "@/contracts/haveme/haveMeApiTags";
import {
  IGetAllEntitlementsResponse,
  IGetOnePlanForAllResponse,
} from "@/contracts/responses/IGetAllEntitlementsResponse";

export const subscriptionApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    updatePlan: builder.mutation<any, { id: string; title?: string; price?: number; entitlements?: any[]; description?: string }>({
      invalidatesTags: [TAG_GET_USER_PLANS],
      query: ({ id, ...body }) => ({
        url: `/plans/${id}`,
        method: "POST",
        body,
      }),
    }),
    createProductPlan: builder.mutation<any, ICreateSubscriptionRequest>({
      invalidatesTags: [TAG_GET_USER_PLANS],
      query: (body) => ({
        url: `/plans/product`,
        method: "POST",
        body,
      }),
    }),
    getPlanDetails: builder.query<any, void>({
      providesTags: [TAG_GET_USER_PLANS],
      query: () => ({
        url: `/plans`,
        method: "GET",
      }),
    }),
    getOnePlanForAll: builder.query<IGetOnePlanForAllResponse, void>({
      providesTags: [TAG_GET_USER_ENTITLEMENTS],
      query: () => {
        console.log("Fetching subscription plans");
        return {
          url: `/plans/subscription`,
          method: "GET",
        };
      },
    }),

    getAllEntitlements: builder.query<IGetAllEntitlementsResponse, void>({
      providesTags: [TAG_GET_USER_ENTITLEMENTS],
      query: () => ({
        url: `/feature?page=1&perPage=100`,
        method: "GET",
      }),
    }),
    deletePlan: builder.mutation<any, string>({
      invalidatesTags: [TAG_GET_USER_PLANS],
      query: (id) => ({
        url: `/plans/${id}`,
        method: "DELETE",
      }),
    }),

    createSubscription: builder.mutation<any, string>({
      invalidatesTags: [],
      query: (planId) => ({
        url: `/subscriptions`,
        method: "POST",
        body: {
          planId,
        },
      }),
    }),

    giveTip: builder.mutation<any, any>({
      // invalidatesTags: [TAG_GET_USER_PLANS, TAG_GET_USER_DETAILS_BY_USER_NAME],
      query: (body) => ({
        url: `/subscriptions/tip`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreateProductPlanMutation,
  useGetPlanDetailsQuery,
  useDeletePlanMutation,
  useGetOnePlanForAllQuery,
  useGetAllEntitlementsQuery,
  useCreateSubscriptionMutation,
  useGiveTipMutation,
  useUpdatePlanMutation,
} = subscriptionApi;
