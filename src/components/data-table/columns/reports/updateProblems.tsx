import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  useUpdateUserInterestMutation,
  useVerifyStatusMutation,
} from "@/redux/admin-services/admin/admin";
import React from "react";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  problems: {
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
  };
}

const UpdateProblems: React.FC<Props> = ({ problems }) => {
  const { toast } = useToast();
  const [updateUserReportStatus] = useVerifyStatusMutation();

  const handleToggle = async (id: string, value: boolean) => {
    try {
      const response = await updateUserReportStatus({
        id: id,
        reportStatus: value ? "approved" : "cancel",
      })
        .unwrap()
        .then((payload) => {
          toast({
            variant: "success",
            title: payload.message,
          });
          return payload;
        });
    } catch (e) {
      console.log("error while updating status", e);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "There was a problem with your request",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <h1>{problems?.actionToUser?.userName}</h1>

      <Switch
        id="status"
        checked={problems?.reportStatus === "approved"}
        onCheckedChange={(value) => handleToggle(problems?._id, value)}
      />
    </div>
  );
};

export default UpdateProblems;
