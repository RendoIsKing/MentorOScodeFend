import React, { useEffect, useState } from "react";
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
import { DocumentDialog } from "./DocumentDialog";
import { useLazyDownloadDocumentQuery } from "@/redux/admin-services/admin/admin";

interface Props {
  doc: {
    userId: string;
    documentMediaId?: string;
  };
}

const DocumentActionsCell: React.FC<Props> = ({ doc }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [downloadDocument, { data, isLoading, isError }] =
    useLazyDownloadDocumentQuery();

  const handleDownload = async (docId: string) => {
    const res = await downloadDocument(docId);
    
    if (res) {
      // Handle the data, for example, trigger a download
      const blob = new Blob([res.data], { type: "application/pdf" }); // Adjust MIME type if needed
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "document.png"; // Adjust file name if needed
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    if (isError) {
      console.error("Error downloading document");
      // Handle the error, e.g., show an error message
    }
  }, [isError]);
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
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(doc.userId)}
          >
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem onClick={() => setOpen(true)}>
            Document details
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => handleDownload(doc.documentMediaId)}>
            Download document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DocumentDialog
        entry={doc.userId}
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default DocumentActionsCell;
