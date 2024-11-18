"use client";
import React from "react";
import PageHeader from "@/components/shared/page-header";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import Logo from "@/components/shared/Logo";
import AuthInputs from "@/components/shared/auth-input-fileds";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { usePathname, useRouter } from "next/navigation";
import { useLoginUserMutation } from "@/redux/services/haveme";
import { setUserPhoneNumber } from "@/redux/slices/user-info";
import { useAppDispatch } from "@/redux/store";
import { phoneNumberRefine } from "@/lib/utils";
import { authFormSchema } from "@/schemas/auth";
import { useCountryCodeContext } from "@/context/countryCodeContext";

const Signin = () => {
  const {countryCode} = useCountryCodeContext();
  const { isMobile } = useClientHardwareInfo();
  const pathname = usePathname();
  const appDispatcher = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof authFormSchema>>({
     resolver: zodResolver(authFormSchema),
    defaultValues: {
      phoneNumber: "",
      prefix: "",
    },
  });

  const [loginUser, { isLoading, error, isError }] = useLoginUserMutation();

  const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
   
    if(!countryCode)
    {
      form.setError("phoneNumber", {
        type: "manual",
        message: "Please select a country."
      });
      return ;
    }
    if (!phoneNumberRefine(data.phoneNumber, data.prefix, countryCode)) {
      form.setError("phoneNumber", {
        type: "manual",
        message: "Please enter a valid phone number based on the selected country."
      });
      return ;
    } 
    await loginUser(data)
      .unwrap()
      .then((res) => {
        //console.log(res);
        appDispatcher(
          setUserPhoneNumber({
            phoneNumber: data.phoneNumber,
            prefix: data.prefix,
            id: res?.data?._id,
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
        <PageHeader title="Sign In" description="Enter Your Phone Number" />
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
                    <AuthInputs />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : (
        <div className="mr-auto my-8">
          <div className="flex justify-center">
            <img src="/assets/images/Signup/phone1.svg" alt="Phone_Image" />
            <div className="border lg:border-muted-foreground/30 lg:rounded-lg p-12 pl-8 ml-20 lg:w-[41%] ">
              <div className="p-4">
                <Logo />
              </div>
              <div className="lg:p-6">
                <PageHeader
                  title="Sign In"
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
                            <AuthInputs />
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

export default Signin;
