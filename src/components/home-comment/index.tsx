"use client";
import React, { useState } from "react";
import Comment from "@/components/comments-comp/comment";
import { ScrollArea } from "@/components/ui/scroll-area";
import Message from "@/assets/images/Home/message.svg";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  useCommentPostMutation,
  useGetCommentsByPostIdQuery,
  useUpdatePostCommentMutation,
} from "@/redux/services/haveme/posts";
import { useToast } from "@/components/ui/use-toast"

interface IMyUserDataProps {
  feedData?: {
    _id: string;
    isLiked?: boolean; // Make isLiked property optional
  };
}

const HomeCommentsComp: React.FC<IMyUserDataProps> = ({ feedData }) => {
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [inputValue, setInputValue] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const { comments } = useGetCommentsByPostIdQuery(feedData?._id, {
    skip: !selectedPostId,
    selectFromResult: ({ data, isLoading }) => {
      return {
        comments: data?.data,
      };
    },
  });

  const [updatePostCommentTrigger] = useUpdatePostCommentMutation();



  const submitComment = async () => {
    let commentObj = {
      postId: feedData?._id,
      comment: inputValue,
    };
    await updatePostCommentTrigger(commentObj)
      .unwrap()
      .then((res) => {
        setInputValue("");
         console.log("Response", res);
      })
      .catch((err) => {
         console.log("Error", err);
         toast({
          variant: "destructive",
          title: "Something went wrong"
        })
      });
  };

  const renderComments = () => (
    <ScrollArea className="px-3 py-0">
      {comments?.map((comment, index) => (
        <Comment key={comment._id} comment={comment} />
      ))}
    </ScrollArea>
  );

  return (
    <div onClick={() => handlePostClick(feedData?._id || "")}>
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <div className="flex flex-col items-center gap-2 justify-center">
              <Message className="fill-foreground cursor-pointer" />
              <p className="text-white">330</p>
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-2/3">
            <DrawerHeader>
              <div className="flex">
                <DrawerTitle className="w-11/12 text-center text-muted-foreground mb-2">
                  1302 comments
                </DrawerTitle>
              </div>
            </DrawerHeader>
            <ScrollArea className="px-3 py-0">{renderComments()}</ScrollArea>
            <DrawerFooter>
              <div className="w-full border-t-2 border-muted">
                <div className="flex items-center gap-6">
                  <div className="flex gap-2 w-full p-2 relative mt-2">
                    <Avatar>
                      <AvatarImage
                        alt="Christina Jack"
                        src="/assets/images/Home/small-profile-img.svg"
                      />
                      <AvatarFallback>CJ</AvatarFallback>
                    </Avatar>
                    <Input
                      type="text"
                      placeholder="Write a message..."
                      value={inputValue}
                      className="relative p-4"
                      onChange={(event) => setInputValue(event?.target.value)}
                    />
                    <div className="absolute right-4 bottom-3 bg-primary rounded-full absolute right-1 cursor-pointer">
                      <img
                        src="/assets/images/inbox/send-message.svg"
                        alt="send"
                        onClick={() => submitComment()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex flex-col items-center gap-2 justify-center cursor-pointer">
              <Message className="fill-foreground cursor-pointer" />
              330
            </div>
          </DialogTrigger>

          <DialogContent className="h-2/3 p-2">
            <DialogHeader>
              <DialogTitle className="mt-2 flex justify-center ">
                1302 comments
              </DialogTitle>
            </DialogHeader>
            <Separator />
            <ScrollArea className="px-2 py-0">{renderComments()}</ScrollArea>
            <DialogFooter>
              <div className="w-full border-t-2 border-muted">
                <div className="flex items-center gap-6">
                  <div className="flex gap-2 w-full p-2 relative mt-2">
                    <Avatar>
                      <AvatarImage
                        alt="Christina Jack"
                        src="/assets/images/Home/small-profile-img.svg"
                      />
                      <AvatarFallback>CJ</AvatarFallback>
                    </Avatar>
                    <Input
                      type="text"
                      placeholder="Write a message..."
                      value={inputValue}
                      className="relative p-4"
                      onChange={(event) => setInputValue(event?.target.value)}
                    />
                    <div className="absolute right-4 bottom-3 bg-primary rounded-full absolute right-1 cursor-pointer">
                      <img
                        src="/assets/images/inbox/send-message.svg"
                        alt="send"
                        onClick={() => submitComment()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HomeCommentsComp;
