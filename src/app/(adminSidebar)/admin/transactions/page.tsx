"use client";
import React from "react";
import { useDataTable } from "@/hooks/use-data-table";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableSkeleton } from "@/components/data-table/data-table-skelton";
import { PaymentColumns } from "@/components/data-table/columns/payments/paymentColumns";
import { useGetAllTransectionsQuery } from "@/redux/admin-services/admin/transection";

export interface ISearchQuery {
  page: string;
  per_page?: string;
}

function AdminTransection() {
  const searchParams = useSearchParams();
  const per_page = searchParams.get("per_page") ?? "10";
  const page_number = searchParams.get("page") ?? "1";

  const query: ISearchQuery = {
    page: page_number,
    per_page: per_page,
  };

  // Use the query hook here
  const { data, isLoading } = useGetAllTransectionsQuery(query);
  const tablecolumns = React.useMemo(() => PaymentColumns(), []);

  const tableData = data?.data ?? [];
  const totalCount = data?.meta?.total ?? 0;
  const pageCount = Math.ceil(totalCount / parseInt(per_page));

  const { table } = useDataTable({
    data: tableData,
    columns: tablecolumns,
    defaultPerPage: parseInt(per_page),
    pageCount: pageCount,
  });

  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={5}
        className="p-2"
        searchableColumnCount={1}
        filterableColumnCount={2}
        cellWidths={["14rem", "10rem", "12rem", "20rem", "8rem"]}
        shrinkZero
      />
    );
  }

  return (
    <div className="h-screen px-2 flex flex-col">
      <h1 className="text-3xl font-semibold mt-5 mb-5">
        Manage User Transections
      </h1>
      <DataTable table={table} />
    </div>
  );
}

export default AdminTransection;
