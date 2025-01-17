import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useVerifyDocumentMutation } from "@/redux/admin-services/admin/admin";
import React from "react";


interface Props {
    doc: {
      _id: string;
      status: string
    };
  }


const DocumentVerify: React.FC<Props> = ({ doc }) => {
    const [verifyDocument, {isLoading}] = useVerifyDocumentMutation();
    const handleToggle = (id: string) => {
        
      verifyDocument(id)

    };
  return (
    <div>
      <Checkbox
        id={doc?._id}
        checked={doc?.status === "approved"}
        onCheckedChange={(value) => handleToggle(doc._id)}
      />
    </div>
  );
};

export default DocumentVerify;
