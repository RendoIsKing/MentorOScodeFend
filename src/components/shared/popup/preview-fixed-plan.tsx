import React, { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  baseServerUrl,
  checkFixedPlanExists,
  cn,
  formatSubscriptionPrice,
} from "@/lib/utils";
import { ABeeZee } from "next/font/google";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";
import { notFound, useParams } from "next/navigation";
import {
  useDeletePlanMutation,
  useGetPlanDetailsQuery,
} from "@/redux/services/haveme/subscription";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { toast } from "@/components/ui/use-toast";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IPreviewFixedPlanProps {}
const PreviewFixedPlan = ({}: IPreviewFixedPlanProps) => {
  const { isMobile } = useClientHardwareInfo();
  const { user } = useUserOnboardingContext();
  const [openPreview, setOpenPreview] = useState(false);

  const { data: plansData } = useGetPlanDetailsQuery();
  const [deletePlanTrigger] = useDeletePlanMutation();

  const isFixedPlanAvailable = checkFixedPlanExists(plansData?.data);

  const fixedPlanDetails = plansData?.data.find(
    (plan) => plan.planType === "fixed"
  );

  const handleDeletePlan = async (id: string) => {
    await deletePlanTrigger(id)
      .unwrap()
      .then(() => {
        toast({
          title: "Plan deleted",
          description: "Your plan has been deleted",
          variant: "success",
        });
        setOpenPreview(false);
      })
      .catch((err) =>
        toast({
          title: err.message,
          description: "Could not delete your plan",
          variant: "destructive",
        })
      );
  };

  return (
    <Dialog open={openPreview} onOpenChange={setOpenPreview}>
      {isFixedPlanAvailable && (
        <DialogTrigger asChild>
          <div>
            <Button
              variant="outline"
              className={cn("lg:w-48 w-96", {
                "border-2 border-primary": !isMobile,
              })}
            >
              {isMobile ? "Preview the plan" : "Preview"}
            </Button>
          </div>
        </DialogTrigger>
      )}
      <div className="">
        <DialogContent className="xs:max-w-[450px] lg:max-w-sm border-0">
          <DialogHeader>
            <div className="flex justify-center ">
              <Avatar className="mb-3 h-[4.5rem] w-[4.5rem]">
                {
                  <div>
                    <AvatarImage
                      alt={user?.userName}
                      src={`${baseServerUrl}/${user?.photo?.path}`}
                    />
                    <AvatarFallback>{user?.fullName}</AvatarFallback>
                  </div>
                }
              </Avatar>
            </div>
            <div className="flex justify-center">
              <DialogTitle className={` font-normal text-2xl ${fontItalic.className}`}>
                {`Subscribe to ${user?.fullName || user?.userName || "this creator"}`}
              </DialogTitle>
            </div>

            <DialogDescription className="p-3 text-center">
              {`Full access to this user's content, Direct message with this user. You can cancel your subscription at any time`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center">
            <Button
              className={cn(
                "w-full",
                "bg-gradient-to-r from-[#6aaff0] to-[#7385dd]"
              )}
            >
              {`$${formatSubscriptionPrice(fixedPlanDetails?.price)} Monthly`}
            </Button>
          </div>
          <div className="flex flex-col justify-center">
            <Button
              className={cn("w-full", "")}
              variant="destructive"
              onClick={() => handleDeletePlan(fixedPlanDetails?._id)}
            >
              {`Delete Plan`}
            </Button>
            <div className="w-full text-muted-foreground text-base text-center mt-2">
              {"Delete button is visible only to creator"}
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default PreviewFixedPlan;
