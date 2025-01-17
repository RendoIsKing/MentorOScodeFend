import { Ellipsis, Info } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import Link from "next/link";
import ReportProblemAlert from "../report-problem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function InboxReport() {
  const { isMobile } = useClientHardwareInfo();
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);

  return (
    <div>
      {isMobile ? (
        <div>
          <Link href={"/more-settings"}>
            <Ellipsis strokeWidth={3} className="text-white" />
          </Link>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"link"}
              size={"icon"}
              className="opacity-90 size-8 bg-muted-foreground/40"
            >
              <Ellipsis strokeWidth={3} className="text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-4 border-[#0B0F14] light:bg-secondary dark:bg-[#0B0F14] rounded-xl m-2">
            <DropdownMenuItem>
              <div
                className="flex text-destructive gap-2 cursor-pointer"
                onClick={() => setIsReportUserOpen(true)}
              >
                <Info />
                Report User
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {isReportUserOpen && (
        <ReportProblemAlert
          isOpen={isReportUserOpen}
          onClose={() => setIsReportUserOpen(false)}
        />
      )}
    </div>
  );
}

export default InboxReport;
