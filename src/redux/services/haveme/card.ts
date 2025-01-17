import { ICardDetailsResponse } from "@/contracts/responses/ICardDetailsResponse";
import { havemeApi } from ".";
import { TAG_GET_USER_CARDS_LIST } from "@/contracts/haveme/haveMeApiTags";

export interface IUserCardsResponse {
  data: CardDetailsObj[];
}

export interface CardDetailsObj {
  brand: string;
  exp_month: number;
  exp_year: number;
  last4: string;
  isDefault: boolean;
  _id: string;
}

export const cardApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    addCardFromToken: builder.mutation<ICardDetailsResponse, string>({
      invalidatesTags: [TAG_GET_USER_CARDS_LIST],
      query: (tokenId) => ({
        url: `card-details`,
        method: "post",
        body: {
          tokenId,
        },
      }),
    }),
    getUserCards: builder.query<IUserCardsResponse, void>({
      providesTags: [TAG_GET_USER_CARDS_LIST],
      query: () => {
        return {
          url: `/card-details`,
          method: "get",
        };
      },
    }),
    setDefaultCard: builder.mutation<any, string>({
      invalidatesTags: [TAG_GET_USER_CARDS_LIST],
      query: (cardId) => ({
        url: `card-details/${cardId}`,
        method: "post",
      }),
    }),
    deleteCard: builder.mutation<any, string>({
      invalidatesTags: [TAG_GET_USER_CARDS_LIST],
      query: (cardId) => ({
        url: `card-details/${cardId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useAddCardFromTokenMutation,
  useGetUserCardsQuery,
  useSetDefaultCardMutation,
  useDeleteCardMutation,
} = cardApi;
