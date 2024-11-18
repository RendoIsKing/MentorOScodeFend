"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { DataTableColumnHeader } from "@/components/data-table/columns/DataTableColumnHeader";
import { DeleteAlertDialog } from "@/components/data-table/columns/users/DeleteAlertDialog";
import UserActionsCell from "./UserTableActions";

type Location = {
  lat: number;
  long: number;
  _id: string;
};

type User = {
  _id: string;
  fullName: string;
  userName: string;
  dob: string;
  bio: string;
  gender: "male" | "female" | "other";
  email: string;
  location: Location[];
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  completePhoneNumber: string;
  __v: number;
};

export function userColumns(): ColumnDef<User>[] {
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
      accessorKey: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User Name" />
      ),
    },
    {
      accessorKey: "Role",
      header: "Role",
      cell: ({ row }) => <div className="capitalize">{row.original.role}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">
          {" "}
          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={row.original.isActive === true}
              onChange={handleToggle}
            />
          </div>
        </div>
      ),
    },

    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },

    {
      accessorKey: "phoneNo",
      header: () => <div className="text-right">Phone Number</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {row.original.completePhoneNumber}
          </div>
        );
      },
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <>
            <UserActionsCell user={row.original} />
          </>
        );
      },
    },
  ];
}
