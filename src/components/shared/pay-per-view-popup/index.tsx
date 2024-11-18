"use-client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { jsx } from "react/jsx-runtime";

export default function PayPerView() {
  return (
    <Dialog>
      <DialogTrigger asChild>Trigger here</DialogTrigger>
      <DialogContent className="max-w-xs">
        <div className="flex justify-center">
          <img
            src="/assets/images/popup/video-icon-watch.svg"
            alt="vi"
            className=""
          />
        </div>
        <DialogHeader>
          <DialogTitle className="italic font-normal">
            Pay to watch this video
          </DialogTitle>
          <DialogDescription>
            You need to purchase specific videos if you are not a subscriber.
            You can cancel your subscription at any time
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2"></div>
        <DialogFooter className="sm:justify-start">
          <Button type="button" className="italic">
            $5 per video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
