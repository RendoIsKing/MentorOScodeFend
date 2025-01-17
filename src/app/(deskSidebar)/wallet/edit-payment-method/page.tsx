import InnerPageHeader from "@/components/shared/inner-page-header";
import VisaCard from "@/components/visa-card";
import React from "react";

const EditPaymentMethod = () => {
  return (
    <div>
      <InnerPageHeader showBackButton={true} title="Edit Visa...5478" />
      <VisaCard />
    </div>
  );
};

export default EditPaymentMethod;
