import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioButtonGroup } from "@/components/postInteraction";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import GiveTip from "@/assets/images/Home/give-tip.svg";
import { ABeeZee } from "next/font/google";
import { tipAmountSchema } from "@/schemas/tipAmount";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGiveTipMutation } from "@/redux/services/haveme/subscription";
import { useStripe } from "@stripe/react-stripe-js";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface ITipDrawerProps {
  showText?: boolean;
  creatorId?: string;
  tipOn?: string;
}

const TipDrawerComponent: React.FC<ITipDrawerProps> = ({
  showText = false,
  creatorId,
  tipOn,
}) => {
  const stripe = useStripe();
  const [giveTip, { isLoading }] = useGiveTipMutation();
  const [open, setOpen] = useState(false);
  const [isConfirmPaymentLoading, serIsConfirmPaymentLoading] = useState(false);

  const form = useForm<z.infer<typeof tipAmountSchema>>({
    resolver: zodResolver(tipAmountSchema),
    defaultValues: {
      amount: 1,
      message: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof tipAmountSchema>) => {
    let tipData = {
      tipOn,
      creatorId,
      tipAmount: data.amount * 100,
      message: data.message,
    };
    await giveTip(tipData)
      .unwrap()
      .then((res) => {
        const client_secret = res.data.client_secret;
        const payment_method = res.paymentMethod;
        serIsConfirmPaymentLoading(true);

        stripe
          .confirmCardPayment(client_secret, { payment_method })
          .then((res) => {
            if (res.paymentIntent.status === "succeeded") {
              toast({
                variant: "success",
                title: "Payment Successful",
              });
            }
            setOpen(false);
            serIsConfirmPaymentLoading(false);
          })
          .catch((err) => {
            toast({
              variant: "destructive",
              title: "Something went wrong.",
            });
            serIsConfirmPaymentLoading(false);
          });
      })
      .catch((err) => {
        console.log("err:", err);
      });
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="flex flex-col items-center gap-2 justify-center">
            <GiveTip className="dark:fill-foreground fill-white cursor-pointer" />
            {showText && <p className="text-white">Tip</p>}
          </div>
        </DrawerTrigger>
        <DrawerContent className="lg:w-1/4 lg:mx-auto rounded-md p-0 border-0">
          <DrawerHeader>
            <div className="flex justify-between border-b border-secondary align-middle text-start px-3 py-2">
              <DrawerTitle
                className={`w-full text-base pb-2 ${fontItalic.className}`}
              >
                <div className="">{"Tip her"}</div>
              </DrawerTitle>
            </div>
          </DrawerHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col px-4 gap-4"
            >
              <RadioButtonGroup />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Input
                        className="text-left mt-2"
                        placeholder="Write comment..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="mb-8"
                type="submit"
                disabled={isLoading || isConfirmPaymentLoading}
              >
                {isLoading || isConfirmPaymentLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Tip
              </Button>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default TipDrawerComponent;
