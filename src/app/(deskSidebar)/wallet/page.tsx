import Wallet from "@/components/wallet";
import React from "react";
import InnerPageHeader from "@/components/shared/inner-page-header";

const WalletPage = () => {
  return (
    <>
      <InnerPageHeader title="Wallet" showBackButton={true} />
      <Wallet />
    </>
  );
};

export default WalletPage;
