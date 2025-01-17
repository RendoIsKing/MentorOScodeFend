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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { X } from "lucide-react";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

export function PostStoryPopup() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex flex-col justify-center align-middle w-fit p-2">
          <div className="flex justify-center">
            <Avatar className="size-16 border-2 border-primary">
              <AvatarImage src="/assets/images/Home/small-profile-img.svg" />
              <AvatarFallback>CJ</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex justify-center">
            <h2 className="">Luke</h2>
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className=' bg-[url("/assets/images/search/image5.svg")] h-5/6 bg-no-repeat bg-cover'>
        {/* bg-[url("/assets/images/search/image12.svg")] */}
        {/* <img src="/assets/images/search/image12.svg" alt="W" /> */}
        <AlertDialogHeader>
          <div className="flex justify-between ">
            <div className="flex gap-4">
              {/* <Avatar className="size-16 ">
                <AvatarImage
                  className="relative block"
                  src="/assets/images/Home/small-profile-img.svg"
                />
                <AvatarFallback>CJ</AvatarFallback>
              </Avatar> */}
              <div className="flex justify-center align-middle w-fit ">
                <div className="flex justify-center">
                  <Avatar className="size-16 border-2 border-primary">
                    <AvatarImage src="/assets/images/Home/small-profile-img.svg" />
                    <AvatarFallback>CJ</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="mt-1">
                <p className={`text-lg ${fontItalic.className}`}>
                  Christina Stanton
                </p>
                <p className="text-sm ">@christinastanton</p>
              </div>
            </div>

            <div>
              <AlertDialogCancel>
                <X className="mt-1" />
              </AlertDialogCancel>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="flex flex-col justify-end gap-2">
          <div className="flex items-center gap-4 mt-1">
            <div className="relative max-w-96 grow ">
              <Input
                className="px-2"
                type="text"
                placeholder="Write comment..."
              />
              <img
                src="\assets\images\inbox\send-message.svg"
                alt=""
                className="absolute top-1 right-2"
              />
            </div>

            <div>
              <img
                src="\assets\images\Creator-center\heart.svg"
                alt=""
                className="h-8 w-8"
              />
            </div>

            <div>
              <img src="\assets\images\Home\give-tip.svg" alt="" />
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
