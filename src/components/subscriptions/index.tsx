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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  useUpdatePlanMutation,
} from "@/redux/services/haveme/subscription";
import { toast } from "@/components/ui/use-toast";
import PreviewFixedPlan from "../shared/popup/preview-fixed-plan";
import { Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { baseServerUrl, getInitials } from "@/lib/utils";
import { useUserOnboardingContext } from "@/context/UserOnboarding";

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
  const [drafts, setDrafts] = useState<Record<string, { title?: string; price?: number; description?: string }>>({});
  const { user } = useUserOnboardingContext();
  const [createPlan] = useCreateProductPlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const { data: plansData, isLoading, isError, refetch } = useGetPlanDetailsQuery();
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
    // If a fixed plan already exists, update it; otherwise create one
    const existingFixed = plansData?.data?.find((p) => p.planType === "fixed");
    if (existingFixed?._id) {
      await updatePlan({ id: existingFixed._id, price: fixedPlanData.price, title: existingFixed.title })
        .unwrap()
        .then(() => {
          toast({ variant: "success", description: "Plan updated successfully." });
        })
        .catch((err) => {
          console.log(err);
          toast({ variant: "destructive", description: "Something went wrong." });
        });
      return;
    }
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
    const showErrors = (errs: any) => {
      try {
        const first = errs && Object.values(errs)[0] as any;
        const msg =
          first?.message ||
          first?.root?.message ||
          first?.type ||
          "Please fix the highlighted fields.";
        toast({ variant: "destructive", description: String(msg) });
      } catch {
        toast({ variant: "destructive", description: "Please check the form fields." });
      }
    };
    if (value === "fixed") {
      fixedSubForm.handleSubmit(onSubmit, showErrors)();
    } else {
      customSubForm.handleSubmit(onCustomSubmit, showErrors)();
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
          <Flame className="h-24 w-24 text-primary flame-lit" fill="currentColor" aria-label="Subscription icon" />
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
                              inputMode="decimal"
                              step="0.01"
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

      {/* Temporary plan manager (visible while Creator Center is gated) */}
      <div className="px-4 mt-8">
        <h3 className="text-lg font-semibold mb-3">Your Plans</h3>
        {plansData?.data?.length ? (
          <div className="space-y-4">
            {plansData.data.map((plan: any) => (
              <div key={plan._id} className="rounded-xl border border-border p-4 bg-card/40">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs tracking-wide px-2 py-1 rounded-full bg-secondary/30">{String(plan.planType).toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground">ID: {plan._id.slice(-6)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm text-muted-foreground w-24">Title</label>
                    <input
                      value={drafts[plan._id]?.title ?? plan.title ?? ""}
                      placeholder="Untitled plan"
                      className="bg-background border rounded px-3 py-2 w-64"
                      onChange={(e) => {
                        const val = e.target.value;
                        setDrafts((prev) => ({
                          ...prev,
                          [plan._id]: { ...prev[plan._id], title: val },
                        }));
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm text-muted-foreground w-24">Price</label>
                    <div className="flex items-center">
                      <span className="px-2 text-muted-foreground">$</span>
                      <input
                        value={(() => {
                          const p = drafts[plan._id]?.price;
                          const base = (plan.price ?? 0) / 100;
                          const shown = typeof p === "number" && !Number.isNaN(p) ? p : base;
                          return String(shown);
                        })()}
                        className="bg-background border rounded px-3 py-2 w-28 text-right"
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) => {
                          const raw = e.target.value;
                          const normalized = raw.replace(/\s/g, "").replace(",", ".");
                          const parsed = parseFloat(normalized);
                          const val = Number.isFinite(parsed) ? parsed : NaN;
                          setDrafts((prev) => ({
                            ...prev,
                            [plan._id]: { ...prev[plan._id], price: val },
                          }));
                        }}
                      />
                      <span className="ml-2 text-sm text-muted-foreground">/mo</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-3">
                    <label className="text-sm text-muted-foreground w-24 mt-2">Description</label>
                    <textarea
                      value={drafts[plan._id]?.description ?? plan.description ?? ""}
                      placeholder="Describe what the plan includes…"
                      className="bg-background border rounded px-3 py-2 w-full max-w-xl min-h-[72px]"
                      onChange={(e) => {
                        const val = e.target.value;
                        setDrafts((prev) => ({
                          ...prev,
                          [plan._id]: { ...prev[plan._id], description: val },
                        }));
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    {/* Preview with live values */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Preview</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <div className="flex justify-center ">
                            <Avatar className="mb-3 h-[4.5rem] w-[4.5rem]">
                              <AvatarImage
                                alt={user?.userName}
                                src={user?.photo?.path ? `${baseServerUrl}/${user?.photo?.path}` : undefined}
                              />
                              <AvatarFallback>{getInitials(user?.fullName || user?.userName)}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex justify-center">
                            <DialogTitle className={`font-normal text-2xl ${fontItalic.className}`}>
                              {`Subscribe to ${drafts[plan._id]?.title ?? plan.title ?? "this plan"}`}
                            </DialogTitle>
                          </div>
                          <DialogDescription>
                            {(drafts[plan._id]?.description ?? plan.description) ||
                              `Full access to this user's content, Direct message with this user. You can cancel your subscription at any time`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <Button className="w-full bg-gradient-to-r from-[#6aaff0] to-[#7385dd]">
                            {`${(() => {
                              const p = drafts[plan._id]?.price;
                              const base = (plan.price ?? 0) / 100;
                              const val = typeof p === "number" && !Number.isNaN(p) ? p : base;
                              return `Join for $${(Math.max(val, 0)).toFixed(2)}`;
                            })()}`}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {/* Save only when dirty & valid */}
                    <Button
                      size="sm"
                      disabled={(() => {
                        const draft = drafts[plan._id] || {};
                        const newTitle = draft.title;
                        const priceInput = draft.price;
                        const newDesc = draft.description;
                        const hasParsedPrice = typeof priceInput === "number" && !Number.isNaN(priceInput);
                        const changedTitle = newTitle !== undefined && newTitle !== plan.title;
                        const changedPrice = priceInput !== undefined && (hasParsedPrice ? Math.round(priceInput * 100) !== (plan.price ?? 0) : false);
                        const changedDesc = newDesc !== undefined && newDesc !== (plan.description ?? "");
                        const validPrice = priceInput === undefined || (hasParsedPrice && priceInput >= 0.01);
                        return !(changedTitle || changedPrice || changedDesc) || !validPrice;
                      })()}
                      onClick={async () => {
                        const draft = drafts[plan._id] || {};
                        const newTitle = draft.title;
                        const priceInput = draft.price;
                        const newDesc = draft.description;
                        const hasParsedPrice = typeof priceInput === "number" && !Number.isNaN(priceInput);
                        const changedTitle = newTitle !== undefined && newTitle !== plan.title;
                        const changedPrice = priceInput !== undefined && (hasParsedPrice ? Math.round(priceInput * 100) !== (plan.price ?? 0) : false);
                        const body: any = {};
                        if (changedTitle) body.title = newTitle;
                        if (changedPrice && hasParsedPrice) body.price = Math.round(priceInput * 100);
                        if (newDesc !== undefined && newDesc !== (plan.description ?? "")) body.description = newDesc;
                        if (!body.title && !body.price && !body.description) return;
                        try {
                          await updatePlan({ id: plan._id, ...body }).unwrap();
                          toast({ variant: "success", description: "Plan updated." });
                          setDrafts((prev) => {
                            const next = { ...prev };
                            delete next[plan._id];
                            return next;
                          });
                          try { await refetch(); } catch {}
                        } catch (e) {
                          toast({ variant: "destructive", description: "Could not update plan." });
                        }
                      }}
                    >
                      Save
                    </Button>
                    {/* Confirm delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                await deletePlan(plan._id).unwrap();
                                toast({ variant: "success", description: "Plan deleted." });
                                try { await refetch(); } catch {}
                              } catch (e) {
                                toast({ variant: "destructive", description: "Could not delete plan." });
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No plans yet.</p>
        )}
      </div>

      {/* Bottom actions: show custom-plan preview/creation; fixed-plan edit happens inline above */}
      <div className="p-4 flex flex-col gap-4 lg:flex-row-reverse items-center lg:justify-center mb-10 ">
        {value === "custom" ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className={cn("lg:w-48 w-96")}>Preview</Button>
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
        ) : null}
      </div>
    </div>
  );
};

export default EditSubscription;
