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
import { Button } from "@/components/ui/button";
import { useDeleteUserInterestMutation } from "@/redux/admin-services/admin/admin";
import { useToast } from "@/components/ui/use-toast";

interface DeleteInterestDialogProps {
  userInfo: string;
}

export function DeleteInterestDialog(props: DeleteInterestDialogProps) {
  const { toast } = useToast();
  const [deleteUserInterest] = useDeleteUserInterestMutation();
  const handleDelete = async () => {
    
    try {
      const response = await deleteUserInterest(props.userInfo);
    
      toast({
        variant: "success",
        title: "Interest deleted successfully",
      });
    } catch (error) {
      console.log("error", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "There was a problem with your request"
      });
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the the
            data from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
