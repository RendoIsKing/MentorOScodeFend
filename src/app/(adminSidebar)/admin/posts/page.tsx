"use client";
import React, { useRef, useState } from "react";
import {
  useGetPostsQuery,
  useGetUsersInterestsQuery,
  useGetUsersQuery,
  useLazyGetUserByNameQuery,
} from "@/redux/admin-services/admin/admin";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableSkeleton } from "@/components/data-table/data-table-skelton";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import InterestDialog from "@/components/interstDialog";
import PostTable from "@/components/data-table/columns/posts/postTable";
import { postsColumns } from "@/components/data-table/columns/posts/postsColumns";
import { Input } from "@/components/ui/input";

export interface ISearchQuery {
  user?: string;
  page: string;
  per_page?: string;
}

function PostsPage() {
  const [searchUser, setSearchUser] = useState("");
  const findUser = useRef(null);
  const router = useRouter();

  const searchParams = useSearchParams();
  const per_page = searchParams.get("per_page") ?? "10";
  const page_number = searchParams.get("page") ?? "1";

  const query: ISearchQuery = {
    user: searchUser,
    page: page_number,
    per_page: per_page,
  };

  
  const { data, isLoading, isError } = useGetPostsQuery(query);
  const tablecolumns = React.useMemo(() => postsColumns(), []);

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
      <h1 className="text-3xl font-semibold mt-8 ms-5">Manage User Posts</h1>
      {/* <form action="">
        <div className="flex gap-2 mt-5 ms-5">
          <Input
            placeholder="Search Posts by User Name"
            ref={findUser}
            className="max-w-md"
          ></Input>
          <Button onClick={handleSubmit} type="submit">
            Search
          </Button>
        </div>
      </form> */}
      {/* <div>
         <In
      </div> */}
      <PostTable table={table} />
    </div>
  );
}

export default PostsPage;
