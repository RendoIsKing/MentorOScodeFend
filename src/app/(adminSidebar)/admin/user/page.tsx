"use client";
import React, { useState } from "react";
import {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} from "@/redux/admin-services/admin/admin";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableSkeleton } from "@/components/data-table/data-table-skelton";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { userColumns } from "@/components/data-table/columns/users/userColumns";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/DataTableViewOptions";
import { useDebounce } from "@/hooks/use-debounce";

export interface ISearchQuery {
  searchTerm?: string;
  page: string;
  per_page?: string;
}

function AdminUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const per_page = searchParams.get("per_page") ?? "10";
  const page_number = searchParams.get("page") ?? "1";
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [updateUserStatus, { isLoading: isLoadingStatus }] =
    useUpdateUserStatusMutation();
  const query: ISearchQuery = {
    searchTerm: debouncedSearchTerm,
    page: page_number,
    per_page: per_page,
  };

  // Define a handler function that uses the API hook
  const handleToggleUserStatus = async (isActive: Boolean, userId: String) => {
    const newStatus = isActive ? "active" : "inactive";
    try {
      await updateUserStatus({ newStatus, id: userId });
    } catch (error) {
      console.error("Error updating user status", error);
    }
  };

  const { data, isLoading, isError } = useGetUsersQuery(query);
  const tablecolumns = React.useMemo(
    () => userColumns(handleToggleUserStatus),
    []
  );

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
        <h1 className="text-3xl font-semibold">Manage Users</h1>
        <Button
          className="h-8"
          onClick={() => router.push("/admin/user/create")}
        >
          Create User
        </Button>
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
        <DataTableViewOptions table={table} />
      </div>
      <DataTable table={table} />
    </div>
  );
}

export default AdminUserPage;
