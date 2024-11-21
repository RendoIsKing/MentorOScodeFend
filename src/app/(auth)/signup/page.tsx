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

const Signup = () => {
  const { countryCode } = useCountryCodeContext();
  const { toast } = useToast();
  const { isMobile } = useClientHardwareInfo();
  const appDispatcher = useAppDispatch();
  const router = useRouter();
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
        console.log(err);
        toast({
          variant: "destructive",
          description: "Something went wrong",
        });
      });
  };

  return (
    <div>
      {isMobile && (
        <PageHeader title="Sign Up" description="Enter Your Phone Number" />
      )}
      {isMobile ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AuthInputs type="signup" />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : (
        <div className="mx-auto my-8">
          <div className="flex justify-center items-center gap-12">
            <div className="flex-1">
              <img src="/assets/images/Signup/phone1.svg" alt="signup" />
            </div>
            <div className="border flex-1 lg:border-muted-foreground/30 lg:rounded-lg p-12 pl-8 lg:w-[41%]">
              <div className="p-0">
                <Logo />
              </div>
              <div className="p-2">
                <PageHeader
                  title="Sign Up"
                  description="Enter Your Phone Number"
                />
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AuthInputs type="signup" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
