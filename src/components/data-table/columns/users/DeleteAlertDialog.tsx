import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteUserMutation } from "@/redux/admin-services/admin/admin";
import { useToast } from "@/components/ui/use-toast";

export function DeleteAlertDialog({
  entry,
  open,
  onClose,
}: {
  entry: string;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [deleteUser, { isLoading }] = useDeleteUserMutation();

  const handleDelete = () => {
    deleteUser(entry)
      .unwrap()
      .then((res) => {
        // console.log("uuuuu", res);
        toast({
          variant: "success",
          title: "User Deleted Successfully",
        });
      });
  };
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the the
            data from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              onClose();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              handleDelete();
              onClose();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
