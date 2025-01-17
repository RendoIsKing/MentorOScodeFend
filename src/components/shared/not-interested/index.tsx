import React from "react";
import { ThumbsDown } from "lucide-react";
import { useNotInterestedMutation } from "@/redux/services/haveme/interactions";
import { toast } from "@/components/ui/use-toast";

interface INotInterestedProps {
  postId: string;
}

const NotInterestedComp: React.FC<INotInterestedProps> = ({ postId }) => {
  const [notInterestedTrigger] = useNotInterestedMutation();
  const notInterested = () => {
    notInterestedTrigger({
      actionOnPost: postId,
      actionType: "not_interested",
    })
      .then((res) => {
        toast({
          description: "Action added successfully.",
          variant: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: "Something went wrong.",
          variant: "destructive",
        });
      });
  };
  return (
    <div className="flex gap-2" onClick={() => notInterested()}>
      <ThumbsDown />
      Not Interested
    </div>
  );
};

export default NotInterestedComp;
