"use client";
import React from "react";
import TransactionInfo from "./transaction-info";
import InnerPageHeader from "../shared/inner-page-header";
import { Search } from "lucide-react";

const Transactions: React.FC = () => {
  const icon = <Search />;

  return (
    <>
      <InnerPageHeader showBackButton={true} title="Transactions" />
      <TransactionInfo />
    </>
  );
};

export default Transactions;
