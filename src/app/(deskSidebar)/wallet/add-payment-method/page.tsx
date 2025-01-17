"use client";
import React from "react";
import BillingDetails from "@/components/add-card";
import InnerPageHeader from "@/components/shared/inner-page-header";

const AddCard = () => {
  return (
    <>
      <InnerPageHeader showBackButton={true} title="Add Card" />
      <BillingDetails />
    </>
  );
};

export default AddCard;
