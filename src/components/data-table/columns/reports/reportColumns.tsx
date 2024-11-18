"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState } from "react";
import { DataTableColumnHeader } from "@/components/data-table/columns/DataTableColumnHeader";
import UpdateProblems from "./updateProblems";
import { Textarea } from "@/components/ui/textarea";

interface Problems {
  _id: string;
  title: string;
  actionByUser: {
    _id: string;
    userName: string;
    id: string;
  };
  actionType: boolean;
  actionToUser: {
    _id: string;
    userName: string;
    id: string;
  };
  reportStatus: string | undefined;
  query: string;
  __v: number;
}

export function reportColumns(): ColumnDef<Problems>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "userName",
      header: "Reported By",
      cell: ({ row }) => {
        return (
          <div className="capitalize">{row.original.actionByUser.userName}</div>
        );
      },
    },
    {
      accessorKey: "reportedfor",
      header: "Reported For",
      cell: ({ row }) => {
        return (
          <div className="capitalize">
            {row.original.actionToUser.userName || "Application"}{" "}
          </div>
        );
      },
    },
    {
      accessorKey: "actionType",
      header: "Type",
      cell: ({ row }) => {
        return <div className="capitalize">{row.original.actionType}</div>;
      },
    },
    {
      accessorKey: "problemStatus",
      header: "Status",
      cell: ({ row }) => {
        return (
          <div className="capitalize">
            {" "}
            {row.original.reportStatus ? (
              <div className="flex items-center space-x-2">
                <UpdateProblems problems={row.original} />
              </div>
            ) : (
              "Not Available"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "query",
      header: "Detail",
      cell: ({ row }) => {
        return (
          <Textarea
            placeholder="No description for this problem."
            value={row.original.query}
            readOnly
            className="resize-none"
          />
        );
      },
    },
  ];
}
