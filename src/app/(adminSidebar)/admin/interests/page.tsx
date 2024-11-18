"use client";
import React from "react";
import {
  useGetUsersInterestsQuery,
} from "@/redux/admin-services/admin/admin";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableSkeleton } from "@/components/data-table/data-table-skelton";
import { useSearchParams, useRouter } from "next/navigation";
import { interestsColumns } from "@/components/data-table/columns/interests/interestColumns";
import InterestDialog from "@/components/interstDialog";

export interface ISearchQuery {
  search?: string;
  page: string;
  per_page?: string;
}

function InterestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const per_page = searchParams.get("per_page") ?? "10";
  const page_number = searchParams.get("page") ?? "1";

  const query: ISearchQuery = {
    search: "",
    page: page_number,
    per_page: per_page,
  };

  // Use the query hook here
  const { data, isLoading, isError } = useGetUsersInterestsQuery(query);
  const tablecolumns = React.useMemo(() => interestsColumns(), []);

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
        className="p-6"
        searchableColumnCount={1}
        filterableColumnCount={2}
        cellWidths={["14rem", "10rem", "12rem", "20rem", "8rem"]}
        shrinkZero
      />
    );
  }

  return (
    <div className="dflex flex-col">
      <div className="flex justify-between p-4">
        <h1 className="text-3xl font-semibold">Manage Interests</h1>
        <InterestDialog/>
      </div>
      <DataTable table={table} />
    </div>
  );
}

export default InterestPage;
