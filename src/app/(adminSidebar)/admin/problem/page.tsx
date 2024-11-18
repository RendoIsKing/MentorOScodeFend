"use client";
import React, { useState } from "react";
import {
  useGetReportsQuery,
  useGetUsersQuery,
} from "@/redux/admin-services/admin/admin";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableSkeleton } from "@/components/data-table/data-table-skelton";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { userColumns } from "@/components/data-table/columns/users/userColumns";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { reportColumns } from "@/components/data-table/columns/reports/reportColumns";

export interface ISearchQuery {
  searchTerm?: string;
  page: string;
  per_page?: string;
}

function AdminSupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const per_page = searchParams.get("per_page") ?? "10";
  const page_number = searchParams.get("page") ?? "1";
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const query: ISearchQuery = {
    searchTerm: debouncedSearchTerm,
    page: page_number,
    per_page: per_page,
  };

  const { data, isLoading, isError } = useGetReportsQuery(undefined);
  const tablecolumns = React.useMemo(() => reportColumns(), []);

  const tableData = data?.data ?? [];
  const totalCount = data?.meta?.total ?? 0;
  const pageCount = Math.ceil(totalCount / parseInt(per_page));

  const { table } = useDataTable({
    data: tableData,
    columns: tablecolumns,
    defaultPerPage: parseInt(per_page),
    pageCount: pageCount,
    // defaultSort: "userName.asc",
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
    <div className="flex flex-col">
      <div className="flex justify-between p-4">
        <h1 className="text-3xl font-semibold">Manage User Problems</h1>
      </div>
      <div className="flex items-center px-2">
        <div className="flex justify-between items-center w-[100%] me-2 p-2 mb-2">
          <Input
            placeholder="Search usernames..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      <DataTable table={table} />
    </div>
  );
}

export default AdminSupportPage;
