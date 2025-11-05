"use client";
import PostModal from "@/components/post-modal";
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import PostModalMobile from "@/components/post-modal/PostModalMobile";
import { usePostModalContext } from "@/context/PostModal";

export default function PhotoModal({
  params: { id: postId },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const params = useParams();
  const { pid } = params;
  const { isMobile } = useClientHardwareInfo();
  const { isPostModalOpen, togglePostModalOpen } = usePostModalContext();

  // Close the Radix Dialog when inner content signals a close
  useEffect(() => {
    const onClose = () => togglePostModalOpen(false);
    if (typeof window !== "undefined") {
      window.addEventListener("post-modal-close", onClose);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("post-modal-close", onClose);
      }
    };
  }, [togglePostModalOpen]);

  return (
    <>
      {isMobile ? (
        <Dialog open={isPostModalOpen} onOpenChange={togglePostModalOpen}>
          <DialogContent
            onCloseAutoFocus={() => {
              router.back();
            }}
            className={
              "py-10 p-0 bg-[#171a1f] w-full max-w-[68rem] border-none gap-0 bg-background"
            }
          >
            <Carousel>
              <div>
                <PostModalMobile postId={pid} />
              </div>
              {/* <CarouselPrevious />
              <CarouselNext /> */}
            </Carousel>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={isPostModalOpen} onOpenChange={togglePostModalOpen}>
          <DialogContent
            onCloseAutoFocus={() => {
              router.back();
            }}
            className={
              "py-10 p-0 bg-[#171a1f] w-full max-w-[68rem] border-none gap-0 bg-background"
            }
          >
            <Carousel>
              <div>
                <PostModal postId={pid} />
              </div>
              {/* <CarouselPrevious />
              <CarouselNext /> */}
            </Carousel>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
