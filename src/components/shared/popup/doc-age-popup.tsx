import React, { useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";
import { useAppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/auth";
import { Input } from "@/components/ui/input";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface SharedPopupsProps {
  openPopup: boolean;
  titleText: string;
  titleDescription?: string;
  btnText: string;
  exitText?: string;
  setOpenPopup: (a1: boolean) => void;
  imageUrl: string;
  handleSubmit?: () => void;
  handleFileChange?: (data: any) => void;
  fileInputRef?: any;
}

const SharedPopupsComponent = ({
  openPopup,
  setOpenPopup,
  titleText,
  titleDescription = "",
  btnText,
  exitText = "",
  imageUrl,
  fileInputRef,
  handleSubmit,
  handleFileChange,
}: SharedPopupsProps) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const appDispatcher = useAppDispatch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setOpenPopup(false);
      }
    };

    if (openPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPopup, setOpenPopup]);

  const logoutUser = () => {
    appDispatcher(logout());
    return router.push("/signup");
  };

  return (
    <AlertDialog open={openPopup}>
      <AlertDialogContent
        ref={dialogRef}
        className="py-10 bg-secondary dark:bg-[#171a1f] w-96"
      >
        <div className="flex flex-col mx-auto">
          <div className="flex justify-center py-5">
            <img src={imageUrl} alt="W" className="w-20 h-20" />
          </div>
          <AlertDialogHeader className="">
            <AlertDialogTitle
              className={`text-2xl  text-center font-normal ${fontItalic.className}`}
            >
              {titleText}
            </AlertDialogTitle>
            {titleDescription && (
              <AlertDialogDescription
                className={`text-center text-md ${fontItalic.className}`}
              >
                {titleDescription}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter
            style={{ display: "flex", flexDirection: "column" }}
            className="mt-3"
          >
            {titleText === "Upload your ID proof" ? (
              <>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                  style={{ display: "none" }}
                />
                <Button className="w-full mb-2" onClick={handleSubmit}>
                  {btnText}
                </Button>
              </>
            ) : (
              <Button className="w-full mb-2" onClick={handleSubmit}>
                {btnText}
              </Button>
            )}
            {exitText && (
              <Button
                variant={"outline"}
                className={`w-full  border-0 text-primary ${fontItalic.className}`}
                style={{ margin: "0px" }}
                onClick={() => logoutUser()}
              >
                {exitText}
              </Button>
            )}
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SharedPopupsComponent;
