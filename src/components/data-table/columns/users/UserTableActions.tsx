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
import { useGrantUserFullPermissionMutation } from "@/redux/admin-services/admin/admin";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionType {
  status: String;
}
interface Props {
  user: {
    _id: string;
    subscriptions?: SubscriptionType[];
  };
}

const UserActionsCell: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const {toast} = useToast();
  const [open, setOpen] = useState(false);
  const [grantUserFullPermission, { isLoading }] =
    useGrantUserFullPermissionMutation();

  const handleCopyUserID = () => {
    navigator.clipboard.writeText(user._id);
  };

  const handleViewUserDetails = () => {
    router.push(`/admin/user/${user._id}`);
  };

  const handleDeleteUser = () => {
    setOpen(true);
  };

  const handleSubscription = async () => {
    // console.log("handle subscription...");
    try {
      const response = await grantUserFullPermission(user?._id);
      console.log("response...", response);
      toast({
        variant: "destructive",
        title: "User's permissions updated successfully",
      });
    } catch (error) {
      console.log("Error....", error);
    }
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
          {user?.subscriptions?.length === 0 && (
            <DropdownMenuItem onClick={handleSubscription}>
              Allow All Priviledges
            </DropdownMenuItem>
          )}
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
