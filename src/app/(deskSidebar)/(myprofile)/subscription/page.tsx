import InnerPageHeader from "@/components/shared/inner-page-header";
import EditSubscription from "@/components/subscriptions";
import React from "react";

const Subscription = () => {
  return (
    <>
      <InnerPageHeader showBackButton={true} title="Edit Subscription" />
      <EditSubscription />
    </>
  );
};

export default Subscription;
