import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { ABeeZee } from "next/font/google";
import GiveTip from "@/assets/images/Home/give-tip.svg";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioButtonGroup } from "@/components/postInteraction";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useGiveTipMutation } from "@/redux/services/haveme/subscription";
import { useStripe } from "@stripe/react-stripe-js";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface ITipDialogProps {
  showText?: boolean;
  creatorId?: string;
  tipOn?: string;
}

const TipDialogComponent: React.FC<ITipDialogProps> = ({
  showText = false,
  creatorId,
  tipOn,
}) => {
  const stripe = useStripe();
  const { isMobile } = useClientHardwareInfo();
  const [giveTip, { isLoading }] = useGiveTipMutation();
  const [open, setOpen] = useState(false);
  const [isConfirmPaymentLoading, setIsConfirmPaymentLoading] = useState(false);
  // * use isConfirmPaymentLoading and isLoading

  const form = useForm<z.infer<typeof tipAmountSchema>>({
    resolver: zodResolver(tipAmountSchema),
    defaultValues: {
      amount: 1,
      message: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof tipAmountSchema>) => {
    let tipData = {
      creatorId,
      tipOn,
      tipAmount: data.amount * 100,
      message: data.message,
    };
    await giveTip(tipData)
      .unwrap()
      .then((res) => {
        const client_secret = res.data.client_secret;
        const payment_method = res.paymentMethod;
        setIsConfirmPaymentLoading(true);
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
            setIsConfirmPaymentLoading(false);
          })
          .catch((err) => {
            toast({
              variant: "destructive",
              title: "Something went wrong.",
            });
            setIsConfirmPaymentLoading(false);
          });
      })
      .catch((err) => {
        console.log("🚀 ~ onSubmit ~ err:", err);
      });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex flex-col items-center gap-2 justify-center">
            <GiveTip className="fill-foreground cursor-pointer" />
            {showText && <p>Tip</p>}
          </div>
        </DialogTrigger>
        <DialogContent className="lg:w-[32rem] rounded-md p-0 border-0">
          <DialogHeader>
            <div className="flex justify-between border-b border-secondary align-middle text-start px-3 py-2">
              <DialogTitle
                className={`w-full text-base pb-2 ${fontItalic.className}`}
              >
                <div className="">{"Tip her"}</div>
              </DialogTitle>
            </div>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TipDialogComponent;
