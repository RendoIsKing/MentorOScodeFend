"use client";
import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTable } from "@/hooks/use-data-table";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { useGetUsersDocumentsQuery } from "@/redux/admin-services/admin/admin";
import { documentscolumns } from "@/components/data-table/columns/documents/documentsColumns";
import { DataTableSkeleton } from "@/components/data-table/data-table-skelton";

export interface ISearchQuery {
  search?: string;
  page: string;
  per_page?: string;
}

function DocumentPage() {
  const searchParams = useSearchParams();
  const per_page = searchParams.get("per_page") ?? "10";
  const page_number = searchParams.get("page") ?? "1";

  const query: ISearchQuery = {
    search: "",
    page: page_number,
    per_page: per_page,
  };

  const { data, isLoading, isError } = useGetUsersDocumentsQuery(query);
  const tablecolumns = React.useMemo(() => documentscolumns(), []);

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
        searchableColumnCount={1}
        filterableColumnCount={2}
        cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
        shrinkZero
      />
    );
  }

  return (
    <div className="h-screen px-2 flex flex-col">
      <h1 className="text-3xl font-semibold mt-5 mb-5">
        Manage User Documents
      </h1>
      <DataTable table={table} />
    </div>
  );
}

export default DocumentPage;
