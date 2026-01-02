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
import { useRegisterUserMutation } from "@/redux/services/haveme";
import { useAppDispatch } from "@/redux/store";
import { setUserPhoneNumber } from "@/redux/slices/user-info";
import { useRouter } from "next/navigation";
import { signupFormSchema } from "@/schemas/auth";
import { useCountryCodeContext } from "@/context/countryCodeContext";
import { phoneNumberRefine } from "@/lib/utils";
import AddToHomescreenPrompt from "@/components/shared/AddToHomescreenPrompt";
import GoogleButton from "@/components/shared/google-button";
import CustomHr from "@/components/shared/custom-hr";
import DesignAuthShell from "@/components/design/auth/DesignAuthShell";

const Signup = () => {
  const { countryCode } = useCountryCodeContext();
  const { toast } = useToast();
  const { isMobile } = useClientHardwareInfo();
  const appDispatcher = useAppDispatch();
  const router = useRouter();

  const designEnabled = String(process.env.NEXT_PUBLIC_DESIGN || "") === "1";
  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      phoneNumber: "",
      prefix: "",
    },
  });

  const [registerUser, { isLoading, error, isError }] =
    useRegisterUserMutation();

  const onSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    if (!countryCode) {
      form.setError("phoneNumber", {
        type: "manual",
        message: "Please select a country.",
      });
      return;
    }
    if (!phoneNumberRefine(data.phoneNumber, data.prefix, countryCode)) {
      form.setError("phoneNumber", {
        type: "manual",
        message:
          "Please enter a valid phone number based on the selected country.",
      });
      return;
    }

    await registerUser(data)
      .unwrap()
      .then((res) => {
        appDispatcher(
          setUserPhoneNumber({
            phoneNumber: data.phoneNumber,
            prefix: data.prefix,
            id: res.data._id,
          })
        );
        toast({
          variant: "success",
          title: `Please verify using it with in 10 minutes ${res?.data?.otp}`,
          // FIX ME: REMOVE THIS LINE BEFORE DEPLOY
        });
        router.push("/verify-otp");
      })
      .catch((err) => {
        if (err?.status === 400 && err?.data?.data?._id) {
          const { data } = err.data;
          appDispatcher(
            setUserPhoneNumber({
              phoneNumber: data.phoneNumber,
              prefix: data.dialCode,
              id: data._id,
            })
          );
          toast({
            variant: "success",
            title: `Please verify using it with in 10 minutes ${data?.otp}`,
            // FIX ME: REMOVE THIS LINE BEFORE DEPLOY
          });
          router.push("/verify-otp");
        } else if (
          (err?.status === 400 || err?.status === 403) &&
          err?.data?.message
        ) {
          toast({
            variant: "destructive",
            title: err?.data?.message,
            // FIX ME: REMOVE THIS LINE BEFORE DEPLOY
          });
        } else {
          console.log(err);
          toast({
            variant: "destructive",
            description: "Something went wrong",
          });
        }
      });
  };

  return (
    <div>
      <AddToHomescreenPrompt />

      {designEnabled ? (
        <DesignAuthShell title="Create Account" subtitle="Join mentorio and start your journey">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="phoneNumber"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <AuthInputs
                        type="signup"
                        afterBelow={
                          <div className="mt-4">
                            <GoogleButton mode="signup" />
                            <CustomHr />
                          </div>
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DesignAuthShell>
      ) : (
        <>
          {isMobile && <PageHeader title="Sign Up" description="Enter Your Phone Number" showBackButton backHref="/signin" />}
          {isMobile ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <AuthInputs
                          type="signup"
                          afterBelow={
                            <div className="mt-4">
                              <GoogleButton mode="signup" />
                              <CustomHr />
                            </div>
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
              <div className="w-full max-w-[520px] border lg:border-muted-foreground/30 lg:rounded-lg p-8">
                <div className="p-0 mb-2 flex justify-center">
                  <Logo />
                </div>
                <div className="p-2">
                  <PageHeader title="Sign Up" description="Enter Your Phone Number" showBackButton backHref="/signin" />
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={() => (
                          <FormItem>
                            <FormControl>
                              <AuthInputs
                                type="signup"
                                afterBelow={
                                  <div className="mt-4">
                                    <GoogleButton mode="signup" />
                                    <CustomHr />
                                  </div>
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Signup;
