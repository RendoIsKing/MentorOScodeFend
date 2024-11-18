"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
// import Heart from "@/assets/images/Creator-center/heart.svg";
import { ABeeZee } from "next/font/google";
import { Button } from "../ui/button";
import { CommentPostResponseObject } from "@/contracts/responses/IUpdateCommentPostResponse";
import {
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUpdateReplyCommentMutation,
} from "@/redux/services/haveme/posts";
import { baseServerUrl, formatTimestamp } from "@/lib/utils";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useToast } from "@/components/ui/use-toast"
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  replies: Comment[];
}
interface ICommentProps {
  // comment: CommentPostResponseObject;
  // todo: make proper type safety remove any
  comment: any;
  isNested?: boolean;
  onReply?: (username: any, commentId: any) => void;
}
const Comment: React.FC<ICommentProps> = ({
  comment,
  isNested = false,
  onReply,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [selectHeart, setSelectHeart] = useState(false);
  const [replyText, setReplyText] = useState(
    `@${comment.interactedBy?.userName} `
  );
  const { user } = useUserOnboardingContext();

  const {toast} = useToast();

  const [replyCommentTrigger] = useUpdateReplyCommentMutation();
  const [likeCommentTrigger] = useLikeCommentMutation();
  const [deleteCommentTrigger] = useDeleteCommentMutation();

  const toggleReply = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setShowReply(!showReply);
    // if (!showReply) {
    //   setReplyText(`@${comment.interactedBy?.userName} `); // Prefill with @username
    // }
  };
  const toggleReplyBox = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setShowReplyBox(!showReplyBox);
    if (!showReplyBox) {
      setReplyText(`@${comment.interactedBy?.userName} `); // Prefill with @username
    }
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
  };

  const submitReply = async () => {
    let replyObj = {
      parentCommentId: comment._id,
      reply: replyText,
    };
    await replyCommentTrigger(replyObj)
      .unwrap()
      .then((res) => {
        setShowReply(false);
        setShowReplyBox(false);
        setReplyText("");
        //console.log(res);
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant:'destructive',
           description: "Something went wrong",
         })
      });
  };
  const likeComment = async () => {
    await likeCommentTrigger(comment._id)
      .unwrap()
      .then((res) => {
        //console.log(res);
        setSelectHeart(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const deleteComment = async () => {
    await deleteCommentTrigger(comment._id)
      .unwrap()
      .then((res) => {
        //console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleReplyClick = () => {
    onReply(comment.interactedBy?.userName, comment._id);
  };
  const imageUrl = `${baseServerUrl}/${comment?.interactedBy?.photo?.path}`;


  return (
    <div className="flex flex-col w-full">
      <div
        className={`flex w-11/12 justify-between mx-auto align-middle ${
          isNested ? "pl-8" : ""
        }`}
      >
        <div className="flex gap-2">
          <div className="mt-6">
            <Avatar>
              <AvatarImage
                alt="Christina Jack"
                src={imageUrl}
              />
              <AvatarFallback>CJ</AvatarFallback>
            </Avatar>
          </div>
          <div className="my-2">
            <div className={` text-muted-foreground ${fontItalic.className}`}>
              {comment.interactedBy?.userName}
            </div>
            <div className="text-lg">{comment?.comment}</div>
            <div className="flex flex-col">
              <div
                className={`flex gap-4  text-muted-foreground ${fontItalic.className}`}
              >
                <div>{formatTimestamp(comment?.updatedAt)}</div>
                <div
                  className="cursor-pointer"
                  // onClick={(e) => toggleReplyBox(e)}
                  onClick={handleReplyClick}
                >
                  {"Reply"}
                </div>
                {user?._id === comment?.interactedBy?.id && (
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      return deleteComment();
                    }}
                  >
                    {"Delete"}
                  </div>
                )}
                {comment.replies?.length > 0 && (
                  <div
                    onClick={(e) => toggleReply(e)}
                    className="cursor-pointer"
                  >
                    {showReply
                      ? "___ Hide Replies"
                      : `View ${
                          comment.replies?.length > 1
                            ? comment.replies?.length + " replies"
                            : comment.replies?.length + " reply"
                        } `}
                  </div>
                )}
              </div>
              {showReplyBox && (
                <div className="mt-2 flex flex-col">
                  <input
                    type="text"
                    value={replyText}
                    onChange={handleReplyChange}
                    className="border-none bg-gray-600 rounded-full py-2 px-4"
                  />
                  <Button
                    variant="link"
                    className="text-white p-2 rounded text-primary justify-start"
                    onClick={() => submitReply()}
                  >
                    Reply
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6 items-center">
          <div
            className="cursor-pointer"
            onClick={() => {
              likeComment();
              return setSelectHeart(!selectHeart);
            }}
          >
            {/* <img
              src="/assets/images/Creator-center/heart.svg"
              alt="heart"
              className="mt-1"
            /> */}
            <Heart
              className={
                comment?.likes?.includes(user?._id) || selectHeart
                  ? "mt-1  fill-primary stroke-primary"
                  : "mt-1 "
              }
            />
          </div>
          <div className="text-foreground">{comment?.likes?.length}</div>
        </div>
      </div>
      <div>
        {showReply && (
          <div className="">
            {" "}
            {comment.replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                isNested={true}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;