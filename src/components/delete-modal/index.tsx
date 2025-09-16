"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import EditPostModal from "../edit-post-modal";
import { Ellipsis } from "lucide-react";
import { IPostContentObject } from "@/contracts/responses/IPostContentResponse";
import { postsApi, useDeletePostMutation, useUpdatePostMutation } from "@/redux/services/haveme/posts";
import { toast } from "../ui/use-toast";
import { usePostModalContext } from "@/context/PostModal";
import { resetUserPosts, updatePost } from "@/redux/slices/adapters";
import { useAppDispatch } from "@/redux/store";
import { TAG_GET_FILE_INFO_BY_ID, TAG_GET_USER_POSTS_BY_USERNAME } from "@/contracts/haveme/haveMeApiTags";
import { cn } from "@/lib/utils";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

interface IPostModalProps {
  openPopup: boolean;
  setOpenPopup: (a1: boolean) => void;
  postDetails?: IPostContentObject;
}

const DeleteModal: React.FC<IPostModalProps> = ({
  setOpenPopup,
  openPopup,
  postDetails,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [deletePostTrigger] = useDeletePostMutation();
  const [updatePostTrigger] = useUpdatePostMutation();
  const { togglePostModalOpen } = usePostModalContext();
  const appDispatcher = useAppDispatch();
  const { isMobile } = useClientHardwareInfo();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPinnedNow, setIsPinnedNow] = useState<boolean>(Boolean(postDetails?.isPinned));

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    deletePost();
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

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

  const deletePost = async () => {
    await deletePostTrigger(postDetails?._id)
      .unwrap()
      .then((res) => {
        setOpenPopup(false);
        togglePostModalOpen(false);
        appDispatcher(resetUserPosts());

        toast({
          description: "Post deleted successfully",
          variant: "success",
        });
      })
      .catch((err) => {
        console.log("ERROR", err);
        toast({
          description: "Something went wrong",
          variant: "destructive",
        });
      });
  };

  const togglePinStatus = async () => {
    try {
      const nextPinned = !isPinnedNow;
      await updatePostTrigger({ id: postDetails?._id, isPinned: nextPinned })
        .unwrap()
        .then(() => {
          setIsPinnedNow(nextPinned);
          appDispatcher(updatePost({ _id: postDetails?._id, isPinned: nextPinned }));
          try {
            appDispatcher(postsApi.util.invalidateTags([
              { type: TAG_GET_FILE_INFO_BY_ID, id: postDetails?._id } as any,
              TAG_GET_USER_POSTS_BY_USERNAME,
            ] as any));
          } catch {}
          toast({ variant: "success", description: "Pinned status changed." });
          setOpenPopup(false);
          togglePostModalOpen(false);
        });
    } catch (err) {
      console.log(err);
      toast({ variant: "destructive", description: "Something went wrong." });
    }
  };

  return (
    <div>
      <AlertDialog open={openPopup}>
        <Ellipsis
          className="dark:fill-foreground dark:text-white text-muted-foreground w-10 self-start cursor-pointer"
          onClick={() => setOpenPopup(true)}
        />
        <AlertDialogContent
          className={
            "py-10 p-0 bg-[#171a1f] w-full max-w-[12rem] border-none gap-0 bg-background"
          }
          // ref={dialogRef}
        >
          <AlertDialogHeader className="">
            <div
              className="flex flex-col  border-b border-secondary align-middle text-start px-3 py-2 cursor-pointer"
              onClick={() => handleDeleteClick()}
            >
              <p
                className={cn("text-destructive self-center", {
                  "text-xl": isMobile,
                })}
              >
                Delete the post
              </p>
            </div>
            <div
              className="flex flex-col border-b border-secondary align-middle text-start px-3 py-2 cursor-pointer"
              onClick={() => togglePinStatus()}
            >
              <p className={cn("self-center", { "text-xl": isMobile })}>
                {isPinnedNow ? "Unpin post" : "Pin post"}
              </p>
            </div>
          </AlertDialogHeader>
          <div className="flex justify-center w-full ">
            <div className="flex gap-2">
              <EditPostModal
                postDetails={postDetails}
                close={() => setOpenPopup(false)}
              />
            </div>
          </div>
          <Separator />
          <div className="flex justify-center w-full">
            <div className="flex gap-2">
              <Button
                variant={"link"}
                className="text-foreground self-centers"
                onClick={() => setOpenPopup(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmDelete}>
        <AlertDialogContent className="py-4 bg-[#171a1f] w-full max-w-[20rem] border-none gap-0 bg-background">
          <AlertDialogHeader className="text-start px-3 py-2">
            <p className="text-xl text-destructive">
              Are you sure you want to delete this post?
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end px-3 py-2 gap-2">
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
            <Button variant="link" onClick={handleCancelDelete}>
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteModal;
