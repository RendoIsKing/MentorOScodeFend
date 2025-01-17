import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { ICreateSubscriptionRequest } from "@/contracts/requests/ICreateSubscriptionPlan";

export interface ISubscriptionPlanModal {
  plansData: ICreateSubscriptionRequest[];
  deletePlan: (string) => void;
}

const UserSubscriptionPlanPopup: React.FC<ISubscriptionPlanModal> = ({
  plansData,
  deletePlan,
}) => {
  const subscriptionPlansNew = useMemo(() => {
    return plansData.filter((plan) => plan.planType === "custom");
  }, [plansData]);

  return (
    <div className="flex flex-col gap-0 p-0 justify-center items-center w-full px-0 pb-0 rounded-2xl">
      <Separator className="w-full" />
      {subscriptionPlansNew?.length === 0 ? (
        <h2 className="items-center justify-center flex lg:min-h-[18rem] p-0 w-full m-0">
          No Plans to show
        </h2>
      ) : (
        <Tabs
          defaultValue={subscriptionPlansNew[0]?._id}
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
                    <div className="text-lg">{`($${plan.price}/Monthly)`}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div>
            {subscriptionPlansNew?.map((plan) => (
              <TabsContent key={plan._id} value={plan._id}>
                <div className="px-12 mt-8">
                  <div className="">
                    <div className="flex justify-between">
                      <div className="text-3xl">
                        {plan.title}
                        <div className="text-lg">
                          {`($` + plan.price + `/Monthly)`}
                        </div>
                        <div className="text-sm font-semibold text-muted-foreground mt-2">
                          Recurring payment. Cancel anytime. Creator may update
                          perks
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Button
                          className="w-32"
                          onClick={() => deletePlan(plan._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  {plan.featureIds.map(
                    (feature, index) =>
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
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default UserSubscriptionPlanPopup;
