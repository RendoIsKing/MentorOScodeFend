import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  getInitials,
} from "@/lib/utils";
import { ABeeZee } from "next/font/google";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { useLazyGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";
import { useParams } from "next/navigation";
import SubscriptionPlanModalMobile from "@/components/subscription-plan-modal/subscription-plan-mobile";
import SubscriptionPlanModalDesktop from "@/components/subscription-plan-modal/subscription-plan-desktop";
import { useCreateSubscriptionMutation } from "@/redux/services/haveme/subscription";
import { toast } from "@/components/ui/use-toast";
import { useStripe } from "@stripe/react-stripe-js";
import { Loader2, Flame } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { havemeApi } from "@/redux/services/haveme";
import { TAG_GET_USER_DETAILS_BY_USER_NAME } from "@/contracts/haveme/haveMeApiTags";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface SubscribePlanProps {
  type?: "card" | "profile";
  userNameTag?: string;
}

const SubscribePlan: React.FC<SubscribePlanProps> = ({
  type = "",
  userNameTag,
}) => {
  const stripe = useStripe();
  const { isMobile } = useClientHardwareInfo();
  const userName = useParams();
  const [createSubscriptionPlan, { isLoading }] =
    useCreateSubscriptionMutation();
  const appDispatcher = useAppDispatch();

  const [isConfirmPaymentLoading, setIsConfirmPaymentLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog open/close

  const [
    getUserDetailsTrigger,
    { data, isLoading: isUserDetailsLoading, isError, isFetching },
  ] = useLazyGetUserDetailsByUserNameQuery();

  const [userDetailsData, setUserDetailsData] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [hasFixedPlan, setHasFixedPlan] = useState(false);
  const [fixedPlan, setFixedPlan] = useState<any>(null);
  const [isJoinedLocal, setIsJoinedLocal] = useState<boolean>(false);

  const getUserDetailsToSubscribe = () => {
    getUserDetailsTrigger({
      userName: type === "card" ? userNameTag : (userName.uid as string),
    })
      .unwrap()
      .then((data) => {
        setUserDetailsData(data?.data);
        setSubscriptionPlans(data?.data?.subscriptionPlans || []);
        setHasFixedPlan(checkFixedPlanExists(data?.data?.subscriptionPlans));
        const fixed = (data?.data?.subscriptionPlans?.find(
          (plan) => plan.planType === "fixed"
        ) as any);
        setFixedPlan(fixed);
        setIsJoinedLocal(Boolean(fixed?.isJoined));
      })
      .catch((error) => {
        console.error("Failed to fetch user details:", error);
      });
  };

  const handleJoinClick = useCallback(
    (id) => {
      createSubscriptionPlan(id)
        .unwrap()
        .then((res) => {
          confirmPayment(res.clientSecret);
          setIsConfirmPaymentLoading(true);
        })
        .catch((err) => {
          toast({
            variant: "destructive",
            title: err.data.error.message || "Something went wrong.",
          });
        });
    },
    [fixedPlan]
  );

  const confirmPayment = (clientSecret) => {
    stripe
      .confirmCardPayment(clientSecret)
      .then((res) => {
        if (res.paymentIntent.status === "succeeded") {
          toast({
            variant: "success",
            title: "Payment Successful",
          });
          appDispatcher(
            havemeApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME])
          );
          setIsConfirmPaymentLoading(false);
          setIsDialogOpen(false);
          setIsJoinedLocal(true);
        }
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Something went wrong.",
        });
        setIsConfirmPaymentLoading(false);
      });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger onClick={() => getUserDetailsToSubscribe()} asChild>
        <div>
          {isMobile ? (
            <button
              aria-label={isJoinedLocal ? "Subscribed" : "Subscribe"}
              className={`inline-flex items-center justify-center rounded-full p-2 transition-all active:scale-95 ${isJoinedLocal ? "text-primary flame-lit" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Flame size={22} strokeWidth={2} fill={isJoinedLocal ? "currentColor" : "none"} />
            </button>
          ) : (
            <Button
              variant={"secondary"}
              size="sleek"
              className={`ml-4 py-1 px-4 font-medium rounded-3xl transition-colors ${isJoinedLocal ? "text-primary flame-lit" : ""}`}
            >
              <Flame size={18} strokeWidth={2} className="mr-2" fill={isJoinedLocal ? "currentColor" : "none"} />
              <span>{isJoinedLocal ? "Subscribed" : "Subscribe"}</span>
            </Button>
          )}
        </div>
      </DialogTrigger>
      {hasFixedPlan ? (
        <DialogContent className="xs:max-w-[450px] lg:max-w-sm border-0">
          <DialogHeader>
            <div className="flex justify-center ">
              <Avatar className="mb-3 h-[4.5rem] w-[4.5rem]">
                <AvatarImage
                  alt={userDetailsData?.userName}
                  src={`${baseServerUrl}/${userDetailsData?.photo?.path}`}
                />
                <AvatarFallback>
                  {getInitials(userDetailsData?.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex justify-center">
              <DialogTitle
                className={`font-normal text-2xl ${fontItalic.className}`}
              >
                {`Subscribe to ${fixedPlan?.title || "this plan"}`}
              </DialogTitle>
            </div>

            <DialogDescription className="p-3 text-center">
              {fixedPlan?.description ||
                `Full access to this user's content, Direct message with this user. You can cancel your subscription at any time`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center">
            <Button
              className={cn(
                "w-full",
                "bg-gradient-to-r from-[#6aaff0] to-[#7385dd]"
              )}
              onClick={() => handleJoinClick(fixedPlan?._id)}
              disabled={
                isLoading || isConfirmPaymentLoading || fixedPlan?.isJoined
              }
            >
              {isLoading || isConfirmPaymentLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {`${
                fixedPlan?.isJoined
                  ? `You're subscribed.`
                  : `Join for $${formatSubscriptionPrice(fixedPlan?.price)}`
              }`}
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="p-1 rounded-3xl w-11/12">
          <DialogHeader className="w-11/12 pl-2 pt-2 justify-start text-left">
            <DialogTitle className={`text-2xl ${fontItalic.className}`}>
              Subscription Plan
            </DialogTitle>
          </DialogHeader>
          {isMobile ? (
            <SubscriptionPlanModalMobile
              plansData={subscriptionPlans}
              subscribeType={"subscriber"}
              close={() => setIsDialogOpen(false)}
            />
          ) : (
            <SubscriptionPlanModalDesktop
              plansData={subscriptionPlans}
              subscribeType={"subscriber"}
              close={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscribePlan;
