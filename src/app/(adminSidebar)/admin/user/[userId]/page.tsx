"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import EditForm from "@/components/admin-dashboard/admin-edit-form";
import AdminLoader from "@/components/adminloader";
import { useGetIndividualUserQuery } from "@/redux/admin-services/admin/admin";
import React from "react";

interface Params {
  userId: string;
}
const EditUser: React.FC<{ params: Params }> = ({ params }) => {
  const { data, isLoading } = useGetIndividualUserQuery(params.userId);

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center">
           <AdminLoader/>
      </div>
    );
  else return <EditForm user={data} id={params} />;
};

export default EditUser;
