"use client";
import React, { useEffect, useState } from "react";
import Comment from "@/components/comments-comp/comment";
import { ScrollArea } from "@/components/ui/scroll-area";
import Message from "@/assets/images/Home/message.svg";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { cn } from "@/lib/utils";

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
  useLikePostMutation,
  useUpdatePostCommentMutation,
  useUpdateReplyCommentMutation,
} from "@/redux/services/haveme/posts";
import HomeComment from "../home-comment/homecomment";
import { CircleX } from "lucide-react";
import { baseServerUrl } from "@/lib/utils";
import { PostMediaFileObject } from "@/contracts/responses/IPostContentResponse";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { IPostObjectResponse } from "@/contracts/responses/IPostObjectResponse";
interface IMyUserDataProps {
  feedData?: IPostObjectResponse;
  variant?: "default" | "ui-v2";
}
import { useToast } from "@/components/ui/use-toast";
const CommentsComp: React.FC<IMyUserDataProps> = ({ feedData, variant = "default" }) => {
  const { toast } = useToast();
  const { isMobile } = useClientHardwareInfo();
  const [inputValue, setInputValue] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [parentCommentId, setParentCommentId] = useState(null);

  const { user } = useUserOnboardingContext();

  const imageUrl = `${baseServerUrl}/${user?.photo?.path}`;

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
  const [likePostTrigger] = useLikePostMutation();
  const [replyCommentTrigger] = useUpdateReplyCommentMutation();

  const submitComment = async () => {
    let commentObj = {
      postId: feedData?._id,
      comment: inputValue,
    };
    await updatePostCommentTrigger(commentObj)
      .unwrap()
      .then((res) => {
        setInputValue("");
        //console.log("Response", res);
      })
      .catch((err) => {
        console.log("Error", err);
        toast({
          variant: "destructive",
          title: "Something went wrong",
        });
      });
  };

  const toggleLike = async (postId) => {
    await likePostTrigger(postId)
      .unwrap()
      .then((res) => {
       // console.log("Response", res);
      })
      .catch((err) => {
        console.log("Error", err);
        toast({
          variant: "destructive",
          title: "Something went wrong",
        });
      });
  };

  const handleReply = (username, parentCommentId) => {
    setInputValue(`@${username} `);
    setParentCommentId(parentCommentId);
  };

  const submitReply = async () => {
    let replyObj = {
      parentCommentId: parentCommentId,
      reply: inputValue,
    };
    await replyCommentTrigger(replyObj)
      .unwrap()
      .then((res) => {
        // setShowReply(false);
        // setShowReplyBox(false);
        setInputValue("");
        setParentCommentId(null);
        // console.log(res);
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: "destructive",
          title: "Something went wrong",
        });
      });
  };

  const renderComments = () => (
    <ScrollArea className="px-3 py-0">
      {comments?.map((comment, index) => (
        <HomeComment
          key={comment._id}
          comment={comment}
          onReply={handleReply}
          imageUrl={imageUrl}
        />
      ))}
    </ScrollArea>
  );

  return (
    <div>
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <div
              className={cn(
                "flex flex-col items-center gap-2 justify-center",
                variant === "ui-v2" && "gap-1 drop-shadow-lg text-white"
              )}
              onClick={() => handlePostClick(feedData?._id || "")}
            >
              <Message className={cn("dark:fill-foreground fill-white cursor-pointer", variant === "ui-v2" && "h-7 w-7")} />
              <p className={cn("text-white", variant === "ui-v2" && "text-xs font-semibold")}>{feedData?.commentsCount}</p>
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-[88vh] pb-tabbar">
            <DrawerHeader>
              <div className="flex">
                <DrawerTitle className="w-11/12 text-center text-muted-foreground mb-2">
                  {feedData?.commentsCount} comments
                </DrawerTitle>
              </div>
            </DrawerHeader>
            <ScrollArea className="px-3 py-0">
              {" "}
              {comments?.length > 0 ? (
                renderComments()
              ) : (
                <div className="flex items-center text-xl flex-col">
                  <h1>No Comments Yet</h1>
                  <span className="text-sm text-muted-foreground">
                    Start the conversation.
                  </span>
                </div>
              )}
            </ScrollArea>
            <DrawerFooter className="pb-tabbar">
              <div className="w-full border-t-2 border-muted">
                <div className="flex items-center gap-6">
                  <div className="flex gap-2 w-full p-2 relative mt-2">
                    <Avatar>
                      <AvatarImage alt="Christina Jack" src={imageUrl} />
                      <AvatarFallback>CJ</AvatarFallback>
                    </Avatar>
                    <Input
                      type="text"
                      placeholder="Write a message..."
                      value={inputValue}
                      className="relative p-4"
                      onChange={(event) => setInputValue(event?.target.value)}
                    />

                    {parentCommentId && (
                      <div className="absolute top-4 cursor-pointer right-[53px]">
                        <CircleX
                          onClick={() => {
                            setInputValue("");
                            return setParentCommentId(null);
                          }}
                        />
                      </div>
                    )}

                    <div className="absolute right-4 bottom-4 bg-primary rounded-full absolute right-1 cursor-pointer">
                      <img
                        src="/assets/images/inbox/send-message.svg"
                        alt="send"
                        onClick={() => {
                          if (parentCommentId) {
                            return submitReply();
                          } else {
                            return submitComment();
                          }
                        }}
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
            <div
              className={cn(
                "flex flex-col items-center gap-2 justify-center cursor-pointer",
                variant === "ui-v2" && "gap-1 drop-shadow-lg text-white"
              )}
              onClick={() => handlePostClick(feedData?._id || "")}
            >
              <Message className={cn("fill-foreground cursor-pointer", variant === "ui-v2" && "h-7 w-7")} />
              <span className={cn("", variant === "ui-v2" && "text-xs font-semibold")}>{feedData?.commentsCount}</span>
            </div>
          </DialogTrigger>

          <DialogContent className="h-2/3 p-2">
            <DialogHeader>
              <DialogTitle className="mt-2 flex justify-center ">
                {feedData?.commentsCount} comments
              </DialogTitle>
            </DialogHeader>
            <Separator />
            <ScrollArea className="px-2 py-0 h-96">
              {comments?.length > 0 ? (
                renderComments()
              ) : (
                <div className="flex items-center text-xl flex-col">
                  <h1>No Comments Yet</h1>
                  <span className="text-sm text-muted-foreground">
                    Start the conversation.
                  </span>
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <div className="w-full border-t-2 border-muted">
                <div className="flex items-center gap-6">
                  <div className="flex gap-2 w-full p-2 relative mt-2">
                    <Avatar>
                      <AvatarImage alt="Christina Jack" src={imageUrl} />
                      <AvatarFallback>CJ</AvatarFallback>
                    </Avatar>
                    <Input
                    onKeyDown={ (e) => {
                      if(e.key === 'Enter'){
                        document.getElementById("send-comment-comp").click()
                      }
                    }}
                      type="text"
                      placeholder="Write a message..."
                      value={inputValue}
                      className="relative p-4"
                      onChange={(event) => setInputValue(event?.target.value)}
                     // onKeyDown={(e)=>{console.log(e)}}
                    />

                    {parentCommentId && (
                      <div className="absolute top-4 cursor-pointer right-[53px]">
                        <CircleX
                          onClick={() => {
                            setInputValue("");
                            return setParentCommentId(null);
                          }}
                        />
                      </div>
                    )}

                    <div className="absolute right-4 bottom-3 bg-primary rounded-full cursor-pointer">
                      <img
                        id="send-comment-comp"
                        src="/assets/images/inbox/send-message.svg"
                        alt="send"
                        onClick={() => {
                          if (parentCommentId) {
                            return submitReply();
                          } else {
                            return submitComment();
                          }
                        }}
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

export default CommentsComp;
