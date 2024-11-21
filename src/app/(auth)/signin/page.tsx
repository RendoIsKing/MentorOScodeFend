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
import { signinFormSchema } from "@/schemas/auth";

const Signin = () => {
  const { isMobile } = useClientHardwareInfo();
  const pathname = usePathname();
  const appDispatcher = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signinFormSchema>>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: {
      loginMethod: { type: "phone", prefix: "", phoneNumber: "" },
      password: "",
    },
  });

  const [loginUser, { isLoading, error, isError }] = useLoginUserMutation();

  const onSubmit = async (data: z.infer<typeof signinFormSchema>) => {
    try {
      const payload =
        data.loginMethod.type === "phone"
          ? {
              dialCode: data.loginMethod.prefix.replace("+", ""),
              phoneNumber: data.loginMethod.phoneNumber,
              password: data.password,
            }
          : {
              email: data.loginMethod.email,
              password: data.password,
            };

      const res = await loginUser(payload).unwrap();

      // Handle successful login
      appDispatcher(
        setUserPhoneNumber({
          phoneNumber:
            data.loginMethod.type === "phone"
              ? data.loginMethod.phoneNumber
              : "",
          prefix:
            data.loginMethod.type === "phone" ? data.loginMethod.prefix : "",
          id: res?.data?._id,
        })
      );

      toast({
        variant: "success",
        title: `Please verify using it within 10 minutes ${res?.data?.otp}`,
      });

      router.push("/verify-otp");
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        description: "Something went wrong",
      });
    }
  };

  return (
    <div>
      {isMobile && (
        <PageHeader
          title="Sign In"
          description="Enter Your Phone Number or Email"
        />
      )}
      {isMobile ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <FormField
              control={form.control}
              name="loginMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AuthInputs type="signin" />
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
              <img src="/assets/images/Signup/phone1.svg" alt="Phone_Image" />
            </div>
            <div className="border flex-1 lg:border-muted-foreground/30 lg:rounded-lg p-12 pl-8 lg:w-[50%] ">
              <div className="p-0">
                <Logo />
              </div>
              <div className="lg:p-2">
                <PageHeader
                  title="Sign In"
                  description="Enter Your Phone Number or Email"
                />
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <FormField
                      control={form.control}
                      name="loginMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AuthInputs type="signin" />
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
