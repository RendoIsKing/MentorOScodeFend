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
import { DataTableColumnHeader } from "@/components/data-table/columns/DataTableColumnHeader";

const NGROK_URL = "https://38da-115-245-201-22.ngrok-free.app";
type Media = {
  mediaId: string;
  mediaType: string;
  _id: string;
};

type User = {
  _id: string;
  email: string;
  userName: string;
};

type MediaFileInterface = {
  path: string;
};

type Post = {
  _id: string;
  media: Media;
  content: string;
  tags: string[];
  privacy: string;
  status: string;
  user: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userInfo: User[];
  mediaFiles: MediaFileInterface[];
};

export function postsColumns(): ColumnDef<Post>[] {
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
            //  ||
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
      accessorKey: "user",
      // header: ({ column }) => {
      //   //console.log("columns", column);
      //   return <DataTableColumnHeader column={column} title="UserName" />;
      // },
      header: "UserName",
      cell: ({ row }) => {
        return (
          <div className="capitalize">{row.original.userInfo[0].userName}</div>
        );
      },
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.content}</div>
      ),
    },

    {
      accessorKey: "privacy",
      header: "Privacy",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.privacy}</div>
      ),
    },

    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.tags[0]}</div>
      ),
    },

    {
      accessorKey: "media",
      header: "Media",

      cell: ({ row }) => {
        return (
          <a
            href={`${process.env.NEXT_PUBLIC_API_SERVER}/${row.original.mediaFiles[0].path}`}
            className="capitalize text-blue-600"
            target="_blank"
          >
            {"MediaUrl"}
          </a>
        );
      },
    },
  ];
}
