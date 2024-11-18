import { IGetTransactionResponse } from "@/contracts/responses/IGetTransactionResponse";
import { havemeApi } from ".";
import { IGetTransactionRequest } from "@/contracts/requests/IGetTransactionRequest";

export const transactionApi = havemeApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<
      IGetTransactionResponse,
      IGetTransactionRequest
    >({
      query: (body) => {
        let { page = 1, perPage = 10 } = body;
        let url = `/transactions?page=${page}&perPage=${perPage}`;
        return {
          url: url,
          method: "GET",
        };
      },
    }),
  }),
});
export const { useGetTransactionsQuery } = transactionApi;
