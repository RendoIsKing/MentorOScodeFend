"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { DataTableColumnHeader } from "@/components/data-table/columns/DataTableColumnHeader";
import { DeleteInterestDialog } from "./DeleteInterestDialog";
import UpdateInterest from "./UpdateInterest";

interface Interests {
  _id: string;
  title: string;
  slug: string;
  addedBy: string;
  isAvailable: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export function interestsColumns(): ColumnDef<Interests>[] {
  const handleToggle = () => {
    
    // const newStatus = userStatus === 'active' ? 'inactive' : 'active';
    // dispatch(updateUserStatusAsync(row.original.userId, newStatus));
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() 
            // ||
            // (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
    },
    {
      accessorKey: "isAvailable",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">
          {" "}
          <div className="flex items-center space-x-2">
        <UpdateInterest doc={row.original}/>
          </div>
        </div>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <>
            <DeleteInterestDialog userInfo={row.original._id} />
          </>
        );
      },
    },
  ];
}
