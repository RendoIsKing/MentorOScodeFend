"use client";
import React from "react";
import PageHeader from "@/components/shared/page-header";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { useToast } from "@/components/ui/use-toast";
import Logo from "@/components/shared/Logo";
import AuthInputs from "@/components/shared/auth-input-fileds";
import { ABeeZee } from "next/font/google";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/redux/services/haveme";
import { useAppDispatch, useTypedSelector } from "@/redux/store";
import { setUserPhoneNumber } from "@/redux/slices/user-info";
import { useRouter } from "next/navigation";
import { resetPasswordFormSchema, signupFormSchema } from "@/schemas/auth";
import { useCountryCodeContext } from "@/context/countryCodeContext";
import { phoneNumberRefine } from "@/lib/utils";

const Signup = () => {
  const { countryCode } = useCountryCodeContext();
  const userMobile = useTypedSelector((state) => state.userInfo);
  const { toast } = useToast();
  const { isMobile } = useClientHardwareInfo();
  const appDispatcher = useAppDispatch();
  const router = useRouter();
  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const [resetPassword] = useResetPasswordMutation();
  const onSubmit = async (data: z.infer<typeof resetPasswordFormSchema>) => {
    const newData = {
      countryCode: userMobile.prefix,
      mobileNumber: userMobile.phoneNumber,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };
    await resetPassword(newData)
      .unwrap()
      .then((res) => {
        console.log("data...", res);
        toast({
          variant: "success",
          title: "Password updated successfully",
          // FIX ME: REMOVE THIS LINE BEFORE DEPLOY
        });
        router.push("/signin");
      })
      .catch((err) => {
        console.log("Error...", err);
        toast({
          variant: "destructive",
          description: err?.message || "Something went wrong",
        });
      });
  };

  return (
    <div>
      {isMobile && (
        <PageHeader
          title="Forgot Password"
          description="Enter Your Phone Number"
        />
      )}
      {isMobile ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AuthInputs type="reset" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AuthInputs type="reset" />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : (
        <div className="mx-auto my-8">
          <div className="flex w-full justify-center items-center gap-12">
            <div className="border flex-1 lg:border-muted-foreground/30 lg:rounded-lg p-12 pl-8">
              <div className="p-0">
                <Logo />
              </div>
              <div className="p-2">
                {/* <PageHeader
                  title="Forgot Password"
                  description="Enter Your Phone Number"
                /> */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AuthInputs type="reset" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {/* <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AuthInputs type="reset" />
                          </FormControl>
                        </FormItem>
                      )}
                    /> */}
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
