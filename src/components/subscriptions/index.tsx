"use client";
import React, { useCallback, useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import AlertPopup from "@/components/shared/popup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SubscriptionPlanModalMobile from "@/components/subscription-plan-modal/subscription-plan-mobile";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import SubscriptionPlanModalDesktop from "../subscription-plan-modal/subscription-plan-desktop";
import { ABeeZee } from "next/font/google";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { CustomFormSchema, FixedFormSchema } from "@/schemas/subscriptions";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import CustomSubscriptions from "./CustomSubscriptions";
import {
  useCreateProductPlanMutation,
  useDeletePlanMutation,
  useGetAllEntitlementsQuery,
  useGetPlanDetailsQuery,
} from "@/redux/services/haveme/subscription";
import { toast } from "@/components/ui/use-toast";
import PreviewFixedPlan from "../shared/popup/preview-fixed-plan";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const subscriptionTypes = [
  {
    value: "fixed",
    label: "Fixed Subscription",
  },
  {
    value: "custom",
    label: "Custom Subscription Plan",
  },
];

const EditSubscription = () => {
  const [value, setValue] = React.useState("fixed");
  const { isMobile } = useClientHardwareInfo();
  const [createPlan] = useCreateProductPlanMutation();
  const { data: plansData, isLoading, isError } = useGetPlanDetailsQuery();
  const [deletePlan] = useDeletePlanMutation();
  const { permissions } = useGetAllEntitlementsQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError, isFetching }) => {
      return {
        permissions: data?.data,
        isLoading: isLoading,
        isError: isError,
        isFetching: isFetching,
      };
    },
  });

  const fixedSubForm = useForm<z.infer<typeof FixedFormSchema>>({
    resolver: zodResolver(FixedFormSchema),
    defaultValues: {
      type: "fixed",
      permissions: permissions,
      title: "fixed",
    },
  });
  const customSubForm = useForm<z.infer<typeof CustomFormSchema>>({
    resolver: zodResolver(CustomFormSchema),
    defaultValues: {
      type: "custom",
      title: "",
      price: 0,
      permissions: permissions,
    },
  });

  useEffect(() => {
    if (permissions?.length > 0) {
      customSubForm.setValue("permissions", permissions);
      fixedSubForm.setValue("permissions", permissions);
    }
  }, [permissions, customSubForm, fixedSubForm]);

  async function onSubmit(data: z.infer<typeof FixedFormSchema>) {
    let fixedPlanData = {
      title: data.title,
      planType: data.type,
      price: data.price * 100,
      entitlements: data.permissions
        ?.filter((permission) => permission.isAvailable)
        .map((filteredPermission) => ({
          feature: filteredPermission.feature,
          description: filteredPermission.description,
        })),
    };
    await createPlan(fixedPlanData)
      .unwrap()
      .then((res) => {
        toast({
          variant: "success",
          description: "Plan added successfully.",
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: "Something went wrong.",
        });
      });
  }

  async function onCustomSubmit(data: z.infer<typeof CustomFormSchema>) {
    let customPlanData = {
      planType: data.type,
      title: data.title,
      price: data.price * 100,
      entitlements: data.permissions
        .filter((permission) => permission.isAvailable)
        .map((filteredPermission) => ({
          feature: filteredPermission.feature,
          description: filteredPermission.description,
        })),
    };
    await createPlan(customPlanData)
      .unwrap()
      .then((res) => {
        toast({
          variant: "success",
          description: "Plan added successfully.",
        });
        customSubForm.reset();
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: "Something went wrong.",
        });
      });
  }

  const handleSaveClick = useCallback(() => {
    if (value === "fixed") {
      fixedSubForm.handleSubmit(onSubmit)();
    } else {
      customSubForm.handleSubmit(onCustomSubmit)();
    }
  }, [value, fixedSubForm, customSubForm]);

  useEffect(() => {
    if (plansData?.data) {
      const firstFixedPlan = plansData?.data.find(
        (plan) => plan.planType === "fixed"
      );

      fixedSubForm.setValue(
        "price",
        firstFixedPlan?.price && firstFixedPlan?.price / 100
      );
    }
  }, [plansData]);

  return (
    <div className="h-screen flex flex-col justify-between lg:justify-start lg:mt-8">
      <div className="flex flex-col  p-4  items-center">
        <div className="flex justify-center mb-8">
          <img
            src="/assets/images/search/serach-profile-icon.svg"
            alt="search-profile"
            className="h-24"
          />
        </div>
        <div className="flex w-full max-w-md lg:max-w-lg">
          <p
            className={`text-sm mb-2 lg:text-xl lg:${fontItalic.className} lg:italic`}
          >
            Subscription Type
          </p>
        </div>

        <Select onValueChange={(e) => setValue(e)} defaultValue="fixed">
          <SelectTrigger className="rounded-full max-w-md p-3 lg:max-w-lg border-muted-foreground h-14 lg:text-lg">
            <SelectValue placeholder="Choose the options" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-foreground/40 font-normal">
                Choose the options
              </SelectLabel>
              {subscriptionTypes.map((item, index) => {
                return (
                  <SelectItem value={item.value} key={item.value}>
                    {item.label}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

        {value === "custom" && (
          <>
            <div className="w-full max-w-md lg:max-w-lg">
              <p className="text-primary text-sm lg:text-base mt-4 font-thin">
                Custom Subscription Price
              </p>
            </div>

            <div className="p-3 mt-2 rounded-lg bg-secondary/60 w-full max-w-md lg:max-w-lg pt-4 pb-6">
              <Form {...customSubForm}>
                <form onSubmit={customSubForm.handleSubmit(onSubmit)}>
                  <CustomSubscriptions />
                </form>
              </Form>
            </div>
            <div className="flex items-center justify-end w-full max-w-md lg:max-w-lg">
              <p className="text-2xl me-3 text-primary">+</p>
              <p
                className="text-sm text-primary lg:text-lg cursor-pointer"
                onClick={() => customSubForm.reset()}
              >
                Add Another Plan
              </p>
            </div>
          </>
        )}

        {value === "fixed" && (
          <>
            <div className="grid w-full max-w-md lg:max-w-lg items-center gap-1.5 mt-4">
              <Label
                htmlFor="price"
                className={`text-sm lg:text-xl lg:${fontItalic.className} lg:italic`}
              >
                Subscription Price{" "}
                <span className="text-primary">{`(Monthly)`}</span>
              </Label>
              <Form {...fixedSubForm}>
                <form
                  onSubmit={fixedSubForm.handleSubmit(onSubmit)}
                  className=""
                >
                  <FormField
                    control={fixedSubForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="flex gap-4 lg:gap-14 items-baseline">
                        <FormControl className="w-full flex flex-col gap-2">
                          <div>
                            <Input
                              placeholder="$20"
                              className="border-muted-foreground text-xl h-14"
                              {...field}
                            />
                            <FormMessage />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            <div className="p-4 max-w-sm lg:max-w-lg">
              <p className="text-center text-sm lg:text-base lg:text-secondary-muted">
                It will give full access to view your content. You can send
                messages directly. User can cancel your subscription at any time
              </p>
            </div>
          </>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4 lg:flex-row-reverse items-center lg:justify-center mb-10 ">
        <Button className="lg:w-48 w-96" onClick={() => handleSaveClick()}>
          Save
        </Button>

        {value === "fixed" ? (
          // <AlertPopup
          //   headerText="Subscribe to Jaylon Stanton"
          //   bodyText="Full access to this user's content, Direct message with this user. You can cancel your subscription at any time"
          //   footerText={`$${fixedSubForm.getValues("price")} Monthly`}
          //   color={true}
          //   showPreviewPlanButton={true}
          //   showVerifiedIcon={false}
          // />
          <>
            <PreviewFixedPlan />
          </>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className={cn("lg:w-48 w-96", {
                  "border-2 border-primary italic": !isMobile,
                })}
                variant="outline"
              >
                {isMobile ? "Preview the plan" : "Preview"}
              </Button>
            </DialogTrigger>
            <DialogContent className="p-1 rounded-3xl w-11/12">
              <DialogHeader className="w-11/12 pl-2 pt-2 justify-start text-left">
                <DialogTitle className={`text-2xl   ${fontItalic.className}`}>
                  Subscription Plan
                </DialogTitle>
              </DialogHeader>
              {isMobile ? (
                <SubscriptionPlanModalMobile
                  plansData={plansData?.data}
                  deletePlan={deletePlan}
                />
              ) : (
                <SubscriptionPlanModalDesktop
                  plansData={plansData?.data}
                  deletePlan={deletePlan}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default EditSubscription;
