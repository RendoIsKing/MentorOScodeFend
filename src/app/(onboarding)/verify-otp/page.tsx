"use client";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/page-header";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import Logo from "@/components/shared/Logo";
import Verification from "@/assets/images/Signup/verification.svg";
import { Manrope } from "next/font/google";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTypedSelector } from "@/redux/store";
import {
  useValidateOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/services/haveme";
import { useRouter } from "next/navigation";

const fontItalic = Manrope({ subsets: ["latin"], weight: ["700"], display: "swap" });

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export default function VerifyOtpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isMobile } = useClientHardwareInfo();
  const userMobileNumber = useTypedSelector(
    (state) => state.userInfo.phoneNumber
  );
  const userId = useTypedSelector((state) => state.userInfo.id);
  const prefix = useTypedSelector((state) => state.userInfo.prefix);
  const [verifyMobileOtp] = useVerifyOtpMutation();
  const [validateOtp] = useValidateOtpMutation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (userId) {
      await verifyMobileOtp({
        id: userId,
        otp: data.pin,
      })
        .unwrap()
        .then((res) => {
          // After OTP, force onboarding start
          if (typeof document !== 'undefined') {
            document.cookie = `onboarding=start; Path=/; Max-Age=600; SameSite=None; Secure`;
          }
          router.replace("/user-info?from=verify");

          toast({
            variant: "success",
            description: "OTP verified successfully.",
          });
        })
        .catch((err) => {
          console.log("err", err);
          toast({
            variant: "destructive",
            description: "Otp is invalid",
          });
        });
    } else {
      await validateOtp({
        dialCode: "92",
        phoneNumber: userMobileNumber,
        otp: data.pin,
      })
        .unwrap()
        .then((res) => {
          // After OTP, force onboarding start
          if (typeof document !== 'undefined') {
            document.cookie = `onboarding=start; Path=/; Max-Age=600; SameSite=None; Secure`;
          }
          router.replace("/user-info?from=verify");

          toast({
            variant: "success",
            description: "OTP verified successfully.",
          });
        })
        .catch((err) => {
          console.log("err", err);
          toast({
            variant: "destructive",
            description: "Otp is invalid",
          });
        });
    }
  }

  return (
    <>
      {isMobile && (
        <PageHeader
          title="Verification Code"
          description="Please enter 6 digit code."
        />
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-8 lg:border-2 lg:border-solid lg:rounded-xl lg:border-muted-foreground/30 lg:text-center lg:gap-4 lg:w-min lg:p-20 lg:my-0 lg:mr-auto lg:ml-auto">
            {!isMobile && (
              <>
                <Logo />
                <Verification className="w-18 my-0 mr-auto ml-auto stroke-foreground" />
                <h1 className={`${fontItalic.className} text-3xl`}>
                  Verification Code
                </h1>
                <p className="text-muted-foreground">
                  Please enter 6 digit code
                </p>
              </>
            )}
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="mt-6 lg:my-0 mr-auto ml-auto">
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        {...field}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <p className="inline">
                {`You will receive your verification code on your given number ${prefix} ${userMobileNumber} If you didn’t get the number then you can change
                or edit the number.`}{" "}
              </p>
              <Button
                type="button"
                onClick={() => router.push("/signup")}
                size={"lg"}
                variant={"link"}
                className="m-0 p-0 h-0"
              >
                Change
              </Button>
            </div>
            <div className="flex justify-center">
              <Button className="w-11/12 lg:my-4" type="submit">
                Continue
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
