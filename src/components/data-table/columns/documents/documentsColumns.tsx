"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DocumentDialog } from "./DocumentDialog";
import { Switch } from "@/components/ui/switch";
import DocumentActionsCell from "./DocumentTableActions";
import DocumentVerify from "./DocumentVerify";

type UserInfo = {
  userName: string;
};
type Document = {
  _id: string;
  title: string;
  description: string;
  type: string;
  docUrl: string;
  userId: string;
  status: string;
  createdAt: string; // Consider using Date type if possible
  updatedAt: string; // Consider using Date type if possible
  userInfo: UserInfo[];
};

export function documentscolumns(): ColumnDef<Document>[] {
  const handleToggle = (id: string, value: boolean) => {
    // console.log(`Document ID: ${id} - Toggled: ${value}`);
    // console.log((prevDocuments: Document[]) =>
    //   prevDocuments.map((doc: Document) =>
    //     doc._id === id ? { ...doc, status: value ? "verified" : "pending" } : doc
    //   )
    // );
    // Implement your logic to update document status or perform any other action
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() 
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
      header: "Title",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("title")}</div>
      ),
    },

    {
      accessorKey: "userId",
      header: "UserName",
      cell: ({ row }) => {
        //console.log("row", row);
        return (
          <div className="capitalize">{row.original?.userInfo[0]?.userName}</div>
        );
      },
    },

    {
      accessorKey: "type",
      header: "type",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("type")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.status}</div>
      ),
    },
    {
      accessorKey: "varify",
      header: "Verify",
      cell: ({ row }) => (
        <>
          <DocumentVerify doc={row.original} />
        </>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <>
            <DocumentActionsCell doc={row.original} />
          </>
        );
      },
    },
  ];
}
