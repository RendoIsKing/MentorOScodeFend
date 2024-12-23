"use client";
import React, { useEffect, useState } from "react";
import { cookies } from "next/headers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripeCardNumberElement } from "@stripe/stripe-js";
import { useTheme } from "next-themes";
import { useAddCardFromTokenMutation } from "@/redux/services/haveme/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CountryDropdown from "./dropdown/countries";
import StateDropdown from "./dropdown/states";
import {
  useCreateSubscriptionMutation,
  useGetOnePlanForAllQuery,
} from "@/redux/services/haveme/subscription";

// Validation schema remains the same
const FormSchema = z.object({
  country: z.string({ required_error: "Please select Country." }),
  state: z.string().optional(),
  street: z.string().min(5, "Address should be minimum 4 characters."),
  username: z.string().min(5, "Name should be minimum 5 characters."),
  age: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm that you are at least 18 years old.",
    }),
  }),
});

const BillingDetails = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [addCardFromToken, { isLoading }] = useAddCardFromTokenMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const { data: planData, isFetching: isPlanLoading } =
    useGetOnePlanForAllQuery();
  const [createSubscription, { isLoading: isSubscribing }] =
    useCreateSubscriptionMutation();

  useEffect(() => {
    if (planData?.data?.platformSubscription?.status === "active") {
      setHasSubscription(true);
    }

    const checkModalState = () => {
      const params = new URLSearchParams(window.location.search);
      const showModal =
        params.get("showModal") === "true" ||
        localStorage.getItem("showSubscriptionModal") === "true";

      if (showModal) {
        setIsModalOpen(true);
        // Clear the modal state from storage after showing
        localStorage.removeItem("showSubscriptionModal");
        // Remove the URL parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    };

    checkModalState();
  }, [planData]);

  // Handle modal close attempt
  const handleModalClose = (open: boolean) => {
    if (!hasSubscription) {
      toast({
        variant: "destructive",
        title: "Subscription Required",
        description: "Please select a subscription plan to continue.",
      });
      return;
    }
    setIsModalOpen(open);
    if (!open) {
      localStorage.removeItem("showSubscriptionModal");
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      street: "",
    },
  });

  const baseOptions = {
    style: {
      base: {
        color: resolvedTheme === "dark" ? "#e5e7eb" : "#000",
      },
    },
  };

  const generateStripeToken = async () => {
    if (!stripe || !elements) {
      console.log("stripe elements not found.");
      return;
    }
    const cardNumberElement = elements.getElement(CardNumberElement);

    const { token, error } = await stripe.createToken(
      cardNumberElement as StripeCardNumberElement,
      {
        name: form.getValues("username"),
        address_line1: form.getValues("street"),
        address_country: form.getValues("country"),
        address_state: form.getValues("state"),
      }
    );
    if (!token || error) {
      console.log(error || "token is not set");
      throw error;
    }

    return token;
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const token = await generateStripeToken();

      addCardFromToken(token?.id)
        .unwrap()
        .then((res) => {
          toast({
            variant: "success",
            title: res?.message || "Card added successfully.",
          });
          setIsModalOpen(true);
        })
        .catch((err) => {
          console.log("err:", err);
          toast({
            variant: "destructive",
            description: err?.data?.error || "Something went wrong.",
          });
        });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "An error has occurred.",
        description: err?.message || "Payment failed try after sometime.",
      });
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await createSubscription(planId).unwrap();
      setHasSubscription(true);
      // Store subscription status
      localStorage.setItem("hasSubscription", "true");
      toast({
        variant: "success",
        title: "Subscribed successfully!",
      });
      window.location.reload();
      router.push("/home");
    } catch (err) {
      toast({
        variant: "destructive",
        description: err?.data?.error || "Failed to subscribe.",
      });
    }
  };

  useEffect(() => {
    const showModal =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("showSubscriptionModal="))
        ?.split("=")[1] === "true";

    if (showModal) {
      setIsModalOpen(true);
      localStorage.setItem("showSubscriptionModal", "true");
      document.cookie =
        "showSubscriptionModal=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, []);

  return (
    <div className="p-5">
      <div className="md:flex sm:items-center flex-col">
        <p className="w-full mt-5 md:max-w-md md:w-1/2 text-left lg:text-center font-extralight text-base lg:text-xl">
          We are fully compliant with payment card industry data security
          standards
        </p>
        <p className="w-full md:max-w-md md:w-1/2 text-lg mt-8 text-muted-foreground">
          Billing Details
        </p>
      </div>

      <div className="mt-5 ">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-4">
              <div className="flex justify-between gap-3 md:flex-col md:items-center">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="w-1/2 max-w-md flex flex-col">
                      <FormLabel className="text-base">Country</FormLabel>
                      <CountryDropdown />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="w-1/2 max-w-md flex flex-col">
                      <FormLabel className="text-base">
                        State Province
                      </FormLabel>
                      <StateDropdown />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="md:mt-1">
                        <FormLabel className="ext-base">Street</FormLabel>
                        <FormControl className="rounded-full bg-transparent border-muted-foreground">
                          <Input
                            placeholder="Enter street address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2">
                  <p className="mt-10 text-lg text-muted-foreground">
                    Card Details
                  </p>
                </div>
              </div>
              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Name on Card
                        </FormLabel>
                        <FormControl className="rounded-full bg-transparent border-muted-foreground">
                          <Input placeholder="Enter name on card" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2 mt-1">
                  <div className="">
                    <label htmlFor="card-no">Card Number</label>
                    <div className="rounded-full bg-transparent border-muted-foreground">
                      <CardNumberElement
                        id="card-np"
                        className="h-10 w-full rounded-full border bg-background px-3 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-muted-foreground text-foreground"
                        options={{ ...baseOptions }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 md:justify-center">
                <div className="w-1/2 md:max-w-56 md:w-1/4 mt-1">
                  <label htmlFor="card-exp" className="text-base">
                    Expiration Date
                  </label>
                  <div className="rounded-full bg-transparent border-muted-foreground">
                    <CardExpiryElement
                      id="card-exp"
                      className="h-10 w-full rounded-full border bg-background px-3 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-muted-foreground"
                      options={{ ...baseOptions }}
                    />
                  </div>
                </div>

                <div className="w-1/2 md:max-w-56 md:w-1/4 mt-1">
                  <label htmlFor="card-cvc" className="font-normal text-base">
                    CVC
                  </label>
                  <div className="rounded-full bg-transparent border-muted-foreground">
                    <CardCvcElement
                      id="card-cvc"
                      className="h-10 w-full rounded-full border bg-background px-3 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-muted-foreground"
                      options={{ ...baseOptions }}
                    />
                  </div>
                </div>
              </div>

              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2 mt-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem className="">
                        <div className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              className="mt-1"
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-0 leading-none">
                            <FormLabel className="text-base">
                              Tick here to confirm that you are at least 18
                              years old and the age of majority in your place
                              residence
                            </FormLabel>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className=" md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2 border-s-8 border-primary  px-6 bg-muted-foreground/10 ">
                  <p className="text-muted-foreground text-sm leading-6">
                    HaveMe will make a one-time charge of $0.10 when adding your
                    payment card. The charges on your credit card statement will
                    appear as HaveMe
                  </p>
                </div>
              </div>

              <div className=" md:flex md:justify-center ">
                <Button
                  type="submit"
                  className="w-full mt-4  md:max-w-md md:w-1/2"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Updated Dialog with forced subscription */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent
          className="sm:max-w-[500px]"
          onInteractOutside={(e) => {
            if (!hasSubscription) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (!hasSubscription) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Subscription Required</DialogTitle>
            <DialogDescription>
              Please select a subscription plan to continue using our services.
            </DialogDescription>
          </DialogHeader>

          {isPlanLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : planData && planData.data ? (
            <div className="space-y-4">
              {Array.isArray(planData.data) && planData.data.length > 0 ? (
                planData.data.map((plan) => (
                  <div
                    key={plan._id}
                    className="p-4 border rounded-md flex flex-col items-center shadow-md"
                  >
                    <h3 className="text-xl font-bold">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      Price: ${plan.price}
                    </p>
                    <p className="text-sm font-medium">
                      Duration: {plan.duration} days
                    </p>
                    <Button
                      onClick={() => handleSubscribe(plan._id)}
                      className="mt-4 w-full"
                      disabled={isSubscribing}
                    >
                      {isSubscribing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Subscribe
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-4 border rounded-md shadow-md">
                  <h3 className="text-lg font-bold">{planData.data.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {planData.data.description}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Price: ${planData.data.price}
                  </p>
                  <p className="text-sm font-medium">
                    Duration: {planData.data.duration} days
                  </p>
                  <Button
                    onClick={() => handleSubscribe(planData.data._id)}
                    className="mt-4 w-full"
                    disabled={isSubscribing}
                  >
                    {isSubscribing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Subscribe
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No subscription plans available.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingDetails;
