"use client";
import React, { useEffect, useState } from "react";
import { CircleDollarSign } from "lucide-react";
import TransactionFilterSelect from "./transaction-filters";
import { ScrollArea } from "../ui/scroll-area";
import { cn, formatSubscriptionPrice, formatTimestamp } from "@/lib/utils";
import MoneyReceive from "@/assets/images/wallets/money-recive.svg";
import MoneySend from "@/assets/images/wallets/money-send.svg";
import { ABeeZee } from "next/font/google";
import { useGetTransactionsQuery } from "@/redux/services/haveme/transactions";
import { useInView } from "react-intersection-observer";
import { useTypedSelector } from "@/redux/store";
import { selectAllUserTransactions } from "@/redux/slices/adapters";
import { format } from "date-fns";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface TransactionDataObject {
  title: string;
  subTitle: string;
  transactionIcon: string;
  transactionType: string;
  transactionAmount: number;
  transactionDate?: string;
  transactionTime?: string;
  transactionStatus: string;
}
interface ITransactionDataProps {
  // transactions?: TransactionDataObject[];
}

const transactionTypes = [
  { label: "Credit", value: "credit" },
  { label: "Debit", value: "debit" },
  { label: "All Types", value: "all" },
];

const transactionDates = [
  { label: "Feb 2024", value: "feb" },
  { label: "Mar 2024", value: "mar" },
  { label: "Apr 2024", value: "apr" },
];

const TransactionInfo: React.FC<ITransactionDataProps> = () => {
  const { ref, inView } = useInView();

  const [query, setQuery] = useState({
    page: 1,
    perPage: 10,
  });
  const transactionsData = useTypedSelector(selectAllUserTransactions);

  const { metaData } = useGetTransactionsQuery(query, {
    selectFromResult: ({ data, isLoading, isError, isFetching }) => {
      return {
        // transactionsData: data?.data,
        metaData: data?.meta,
      };
    },
  });

  const loadMoreTransactions = () => {
    if (query?.page === metaData?.pages) return;

    setQuery((prevQuery) => ({
      ...prevQuery,
      page: prevQuery.page + 1,
    }));
  };

  useEffect(() => {
    if (inView && query.page <= metaData?.pages) {
      loadMoreTransactions();
    }
  }, [inView]);

  let currentDate: string | null = null;
  const [transactionType, setTransactionType] = useState("all");
  const [transactionDate, setTransactionDate] = useState("feb");

  const handleTransactionType = (newValue: string) => {
    setTransactionType(newValue);
  };
  const handleTransactionDate = (dateValue: string) => {
    setTransactionDate(dateValue);
  };

  return transactionsData?.length === 0 ? (
    <div className="">
      {/* <div
        className={`flex justify-between w-full mx-auto text-base  text-muted-foreground border-t border-b border-secondary my-4 ${fontItalic.className}`}
      >
        <div>
          <TransactionFilterSelect
            options={transactionTypes}
            initialValue={transactionType}
            onChange={handleTransactionType}
          />
        </div>
        <div>
          <TransactionFilterSelect
            options={transactionDates}
            initialValue={transactionDate}
            onChange={handleTransactionDate}
          />
        </div>
      </div> */}
      <div className="flex flex-col text-center justify-center h-screen align-middle w-full">
        <div
          className={` text-2xl ${fontItalic.className}`}
        >{`No transactions yet`}</div>
        <div className="text-muted-foreground font-semibold my-4">
          {`Keep track of your purchases, refunds, `} <br />{" "}
          {`and exchanges here`}
        </div>
      </div>
    </div>
  ) : (
    <ScrollArea className="mt-4 h-screen border-t border-muted-foreground/20 lg:max-h-11/12">
      {transactionsData?.map((transaction, index) => {
        const displayDateLabel =
          currentDate !== format(transaction.createdAt, "MM/dd/yyyy");
        currentDate = format(transaction.createdAt, "MM/dd/yyyy");

        return (
          <div key={index} className="flex flex-col mx-6 lg:mx-8">
            {displayDateLabel && (
              <div
                className={`text-lg  text-muted-foreground mt-4 tracking-wide ${fontItalic.className}`}
              >
                {formatTimestamp(transaction.createdAt)}
              </div>
            )}
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="bg-muted rounded-md p-3">
                  {/* <CircleDollarSign /> */}
                  {transaction.type?.toLowerCase() === "credit" ? (
                    <MoneyReceive className="fill-foreground" />
                  ) : (
                    <MoneySend className="fill-foreground" />
                  )}
                </div>
                <div className="ml-6">
                  <div className="text-xl lg:text:lg italic">
                    {transaction.type?.toLowerCase()}
                  </div>
                  <div className="text-base lg:text-sm italic text-muted-foreground tracking-wide">
                    {transaction.status}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "text-lg italic",
                  transaction.type?.toLowerCase() === "credit"
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {transaction.type?.toLowerCase() === "credit" ? "+ $" : "- $"}
                {formatSubscriptionPrice(transaction.amount)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={ref}></div>
    </ScrollArea>
  );
};

export default TransactionInfo;
