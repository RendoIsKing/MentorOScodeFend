"use client";
import React, { useCallback, useMemo, useState } from "react";
import { baseServerUrl, formatSubscriptionPrice, cn } from "@/lib/utils";
import Link from "next/link";
import { IPostObjectResponse } from "@/contracts/responses/IPostObjectResponse";
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
import { useParams } from "next/navigation";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { usePayForPostMutation } from "@/redux/services/haveme/posts";
import { useStripe } from "@stripe/react-stripe-js";
import { toast } from "../ui/use-toast";
import { usePostModalContext } from "@/context/PostModal";
import { useAppDispatch } from "@/redux/store";
import { Loader2, Pin, PinOff } from "lucide-react";
import { updatePost } from "@/redux/slices/adapters";
import { useCreateImpressionMutation } from "@/redux/services/haveme/interactions";

interface IUserPostDataProps {
  post: IPostObjectResponse;
  style?: any;
}

const UserPosts: React.FC<IUserPostDataProps> = ({ post, style }) => {
  const stripe = useStripe();
  const [payForPostTrigger, { isLoading }] = usePayForPostMutation();
  const mediaFile = post?.mediaFiles[0];
  const safeBase = (baseServerUrl as any) || (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_API_SERVER) || '/api/backend';
  // Prefer id-based file endpoint so it works with S3/signing and local storage
  const fileId = (mediaFile as any)?._id || (mediaFile as any)?.id || post?.media?.[0]?.mediaId;
  const postUrl = fileId
    ? `${safeBase}/v1/user/files/${String(fileId)}`
    : (mediaFile?.path
        ? (mediaFile.path.startsWith('http')
            ? mediaFile.path
            : `${safeBase}/${mediaFile.path}`)
        : '');
  const isVideo =
    post?.media?.[0]?.mediaType === "video" ||
    /\.(mp4|webm|mov|avi|mkv)$/i.test(String(mediaFile?.path || ""));
  const isPayPerView = post?.privacy === "pay-per-view";
  const { user } = useUserOnboardingContext();
  const [isPayPerViewOpen, setIsPayPerViewOpen] = useState(false);
  const { isPostModalOpen, togglePostModalOpen } = usePostModalContext();
  const appDispatcher = useAppDispatch();
  const [isConfirmPaymentLoading, setIsConfirmPaymentLoading] = useState(false);
  const [createImpressionTrigger] = useCreateImpressionMutation();

  const userName = useParams();

  const isOwnProfile = useMemo(() => {
    return user?.userName === userName.uid;
  }, [userName.uid]);

  const handlePayPerViewClick = async (postId) => {
    try {
      const response = await payForPostTrigger({ postId }).unwrap();
      const clientSecret = response.data.client_secret;
      const paymentMethod = response.paymentMethod;
      setIsConfirmPaymentLoading(true);

      stripe
        .confirmCardPayment(clientSecret, {
          payment_method: paymentMethod,
        })
        .then((res) => {
          if (res.paymentIntent.status === "succeeded") {
            toast({
              variant: "success",
              title: "Payment Successful",
            });
            setIsConfirmPaymentLoading(false);
            setIsPayPerViewOpen(false);
            appDispatcher(updatePost({ _id: postId, isPaid: true }));
          }
        })
        .catch((err) => {
          toast({
            variant: "destructive",
            title: "Something went wrong.",
          });
          setIsConfirmPaymentLoading(false);
        });
    } catch (err) {
      console.error("Error handling payment:", err);
    }
  };

  const createImpression = useCallback(() => {
    createImpressionTrigger({ postId: post?._id });
  }, []);

  const renderMedia = () => {
    if (!postUrl) {
      return (
        <div className="cursor-pointer object-cover h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">Media missing</div>
      );
    }
    if (isVideo) {
      return (
        <video
          className="cursor-pointer object-cover h-full w-full"
          src={postUrl}
          onPlay={() => createImpression()}
        />
      );
    }
    return (
      <img
        className="cursor-pointer object-cover h-full w-full blur-sm transition-all duration-300"
        src={postUrl}
        alt="user-post"
        loading="lazy"
        decoding="async"
        onLoad={(e)=>{ try{ (e.target as HTMLImageElement).classList.remove('blur-sm'); }catch{} }}
        onClick={() => createImpression()}
      />
    );
  };

  return (
    <div>
      <div className="grid grid-cols-3 lg:grid-cols-4">
        <div style={style} className="p-1 h-72 relative" key={post?._id}>
          {isOwnProfile ? (
            <Link
              href={{ pathname: `/post/${post?._id}`, query: { fromProfile: '1' } }}
              passHref
              onClick={() => togglePostModalOpen(true)}
            >
              <div className="absolute right-2 top-2">
                {post?.isPinned && <Pin className="rotate-45" />}
              </div>
              {renderMedia()}
            </Link>
          ) : (
            <>
              {isPayPerView && !post?.isPaid ? (
                <Dialog
                  open={isPayPerViewOpen}
                  onOpenChange={setIsPayPerViewOpen}
                >
                  <div className="absolute right-2 top-2 z-10">
                    {post?.isPinned && <Pin className="rotate-45" />}
                  </div>
                  <DialogTrigger asChild>
                    {renderMedia()}
                  </DialogTrigger>
                  <DialogContent className="max-w-xs sm:max-w-md">
                    <div className="flex justify-center">
                      <img
                        src="/assets/images/popup/video-icon-watch.svg"
                        alt="vi"
                        className=""
                      />
                    </div>
                    <DialogHeader className="flex flex-col items-center">
                      <DialogTitle className="italic font-normal">
                        Pay to watch this video
                      </DialogTitle>
                      <DialogDescription className="text-center">
                        You need to purchase specific videos if you are not a
                        subscriber. You can cancel your subscription at any time
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                      <Button
                        type="button"
                        className="italic w-full"
                        onClick={() => handlePayPerViewClick(post?._id)}
                        disabled={isLoading || isConfirmPaymentLoading}
                      >
                        {isLoading || isConfirmPaymentLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {`$${formatSubscriptionPrice(post?.price)} per video`}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Link
                  href={{ pathname: `/post/${post?._id}`, query: { fromProfile: '1' } }}
                  passHref
                  onClick={() => togglePostModalOpen(true)}
                >
                  <div className="absolute right-2 top-2">
                    {post?.isPinned && <Pin className="rotate-45" />}
                  </div>
                  {renderMedia()}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPosts;
