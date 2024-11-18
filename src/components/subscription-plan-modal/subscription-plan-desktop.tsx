import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { ICreateSubscriptionRequest } from "@/contracts/requests/ICreateSubscriptionPlan";
import { formatSubscriptionPrice } from "@/lib/utils";
import { useCreateSubscriptionMutation } from "@/redux/services/haveme/subscription";
import { useStripe } from "@stripe/react-stripe-js";
import { toast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { havemeApi } from "@/redux/services/haveme";
import { TAG_GET_USER_DETAILS_BY_USER_NAME } from "@/contracts/haveme/haveMeApiTags";
import { useAppDispatch } from "@/redux/store";

export interface ISubscriptionPlanModal {
  plansData: ICreateSubscriptionRequest[];
  deletePlan?: (string) => void;
  subscribeType?: string;
  close?: () => void;
}

const SubscriptionPlanModalDesktop: React.FC<ISubscriptionPlanModal> = ({
  plansData,
  deletePlan,
  subscribeType = "creator",
  close = () => {},
}) => {
  const [isConfirmPaymentLoading, setIsConfirmPaymentLoading] = useState(false);
  const [createSubscriptionPlan, { isLoading }] =
    useCreateSubscriptionMutation();
  const stripe = useStripe();
  const appDispatcher = useAppDispatch();

  const subscriptionPlansNew = useMemo(() => {
    return plansData?.filter((plan) => plan.planType === "custom");
  }, [plansData]);

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
    <div className="flex flex-col gap-0 p-0 justify-center items-center w-full px-0 pb-0 rounded-2xl">
      <Separator className="w-full" />
      {subscriptionPlansNew?.length === 0 ? (
        <h2 className="items-center justify-center flex lg:min-h-[18rem] p-0 w-full m-0">
          No Plans to show
        </h2>
      ) : (
        <Tabs
          defaultValue={
            subscriptionPlansNew?.length > 0 && subscriptionPlansNew[0]?._id
          }
          className="flex p-0 w-full m-0"
        >
          <div className="">
            <TabsList className="text-foreground flex flex-col justify-between w-full h-full border-muted-foreground border-2 border-l-0 border-t-0 border-b-0 rounded-none">
              {subscriptionPlansNew?.map((plan, index) => (
                <TabsTrigger
                  key={plan._id}
                  value={plan._id}
                  className="data-[state=active]:bg-primary  flex-grow w-full py-4 px-8"
                >
                  <div className="text-3xl p-2">
                    {plan.title}
                    <div className="text-lg">{`($${formatSubscriptionPrice(
                      plan.price
                    )}/Monthly)`}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div>
            {subscriptionPlansNew?.map((plan) => {
              return (
                <TabsContent key={plan._id} value={plan._id}>
                  <div className="px-12 mt-8">
                    <div className="">
                      <div className="flex justify-between">
                        <div className="text-3xl">
                          {plan.title}
                          <div className="text-lg">
                            {`($` +
                              formatSubscriptionPrice(plan.price) +
                              `/Monthly)`}
                          </div>
                          <div className="text-sm font-semibold text-muted-foreground mt-2">
                            Recurring payment. Cancel anytime. Creator may
                            update perks
                          </div>
                        </div>
                        <div className="flex items-start">
                          {subscribeType === "creator" ? (
                            <Button
                              className="w-32"
                              onClick={() => deletePlan(plan._id)}
                            >
                              Delete
                            </Button>
                          ) : (
                            <Button
                              className="w-32"
                              onClick={() => joinPlan(plan?._id)}
                              disabled={
                                isLoading ||
                                isConfirmPaymentLoading ||
                                plan?.isJoined
                              }
                            >
                              {isLoading || isConfirmPaymentLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}

                              {plan?.isJoined ? "Joined" : "Join"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    {plan?.featureIds?.map((feature, index) => {
                      return (
                        feature.isAvailable && (
                          <div
                            key={index}
                            className="flex items-center my-2 gap-4"
                          >
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
                      );
                    })}
                  </div>
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default SubscriptionPlanModalDesktop;
