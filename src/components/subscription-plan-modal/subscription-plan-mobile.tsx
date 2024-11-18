import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import { ISubscriptionPlanModal } from "./subscription-plan-desktop";
import { formatSubscriptionPrice } from "@/lib/utils";
import { useCreateSubscriptionMutation } from "@/redux/services/haveme/subscription";
import { useStripe } from "@stripe/react-stripe-js";
import { toast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { TAG_GET_USER_DETAILS_BY_USER_NAME } from "@/contracts/haveme/haveMeApiTags";
import { havemeApi } from "@/redux/services/haveme";

const SubscriptionPlanModalMobile: React.FC<ISubscriptionPlanModal> = ({
  plansData,
  deletePlan,
  subscribeType = "creator",
  close = () => {},
}) => {
  const subscriptionPlansNew = useMemo(() => {
    return plansData.filter((plan) => plan.planType === "custom");
  }, [plansData]);
  const [isConfirmPaymentLoading, setIsConfirmPaymentLoading] = useState(false);
  const [createSubscriptionPlan, { isLoading }] =
    useCreateSubscriptionMutation();
  const stripe = useStripe();
  const appDispatcher = useAppDispatch();

  const joinPlan = (id) => {
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
  };

  const confirmPayment = (clientSecret) => {
    stripe
      .confirmCardPayment(clientSecret)
      .then((res) => {
        if (res.paymentIntent.status === "succeeded") {
          toast({
            variant: "success",
            title: "Payment Successful",
          });
          setIsConfirmPaymentLoading(false);
          close && close();

          appDispatcher(
            havemeApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME])
          );
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
    <div className="max-h-[65vh] overflow-y-auto">
      {subscriptionPlansNew?.length === 0 ? (
        <h2 className="items-center justify-center flex lg:min-h-[18rem] p-0 w-full m-0">
          No Plans to show
        </h2>
      ) : (
        subscriptionPlansNew.map((plan) => (
          <div key={plan._id}>
            <div className="px-4">
              <div className="">
                <div className="flex">
                  <div className="text-3xl flex w-full justify-between items-center">
                    {plan.title}
                    <div className="text-lg">{`($${formatSubscriptionPrice(
                      plan.price
                    )}/Monthly)`}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-muted-foreground mt-2">
                  Recurring payment. Cancel anytime. Creator may update perks
                </div>
                <div>
                  {plan.featureIds.map(
                    (feature, index) =>
                      feature.isAvailable && (
                        <div
                          key={index}
                          className="flex items-center my-2 gap-2"
                        >
                          {/* <CircleCheck fill="red" className=" border-none min-w-6" /> */}
                          <div className="bg-foreground rounded-full p-1">
                            <Check className="text-background" />
                          </div>
                          <div className="flex flex-col">
                            <Label className="mt-0 text-lg">
                              {feature.feature}
                            </Label>
                            <div className="text-base text-muted-foreground">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                      )
                  )}
                </div>
                <div className="flex justify-center">
                  {subscribeType === "creator" ? (
                    <Button
                      className="w-11/12"
                      onClick={() => deletePlan(plan._id)}
                    >
                      Delete
                    </Button>
                  ) : (
                    <Button
                      className="w-32"
                      onClick={() => joinPlan(plan?._id)}
                      disabled={isLoading || isConfirmPaymentLoading}
                    >
                      {isLoading || isConfirmPaymentLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Join
                    </Button>
                  )}
                </div>
              </div>
              <Separator className="my-6" />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SubscriptionPlanModalMobile;
