import React, { useState } from "react";
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
import { useRouter } from "next/navigation";
import { DeleteAlertDialog } from "@/components/data-table/columns/users/DeleteAlertDialog";

interface Props {
  user: {
    _id: string;
  };
}

const UserActionsCell: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleCopyUserID = () => {
    navigator.clipboard.writeText(user._id);
  };

  const handleViewUserDetails = () => {
    router.push(`/admin/user/${user._id}`);
  };

  const handleDeleteUser = () => {
    setOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyUserID}>
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewUserDetails}>
            View user details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteUser}>
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteAlertDialog
        entry={user._id}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default UserActionsCell;
