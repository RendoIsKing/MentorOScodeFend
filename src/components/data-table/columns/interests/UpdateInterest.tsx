import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useUpdateUserInterestMutation } from "@/redux/admin-services/admin/admin";
import React from "react";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  doc: {
    _id: string;
    isAvailable: boolean;
  };
}

const UpdateInterest: React.FC<Props> = ({ doc }) => {
  const { toast } = useToast();
  const [updateUserInterest] = useUpdateUserInterestMutation();

  const handleToggle = async (id: string, value: boolean) => {
   
    //  const updateToggle = async () => {
    try {
      const response = await updateUserInterest({
        id: id,
        isAvailable: value,
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
      console.log("error while updating interest", e);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "There was a problem with your request",
      });
    }
  };

  return (
    <div>
      <Switch
        id="status"
        checked={doc?.isAvailable === true}
        onCheckedChange={(value) => handleToggle(doc._id, value)}
      />
    </div>
  );
};

export default UpdateInterest;
