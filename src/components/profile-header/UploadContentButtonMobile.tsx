import React from "react";
import { Button } from "@/components/ui/button";
import { useContentUploadContext } from "@/context/open-content-modal";
import { PlusIcon } from "lucide-react";

function UploadContentButtonMobile() {
  const { toggleContentUploadOpen } = useContentUploadContext();
  return (
    <div className="flex items-center ">
      <Button
        size={"icon"}
        className="bg-primary size-7 p-1s rounded-md"
        onClick={() => toggleContentUploadOpen(true)}
      >
        <PlusIcon className="text-white" />
      </Button>
    </div>
  );
}

export default UploadContentButtonMobile;
