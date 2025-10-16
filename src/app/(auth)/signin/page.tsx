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
import { setAuthData } from "@/redux/slices/auth";
import AddToHomescreenPrompt from "@/components/shared/AddToHomescreenPrompt";
import GoogleButton from "@/components/shared/google-button";

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
  const appDispatch = useAppDispatch();

  const onSubmit = async (formData: z.infer<typeof signinFormSchema>) => {
    try {
      const payload: any = {
        password: formData.password,
      };

      if (formData.loginMethod.type === "email") {
        payload.email = formData.loginMethod.email;
      } else if (formData.loginMethod.type === "phone") {
        payload.phoneNumber = `${formData.loginMethod.prefix}--${formData.loginMethod.phoneNumber}`;
      } else if (formData.loginMethod.type === "username") {
        payload.username = formData.loginMethod.username;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_SERVER || "/api/backend";
      const res = await fetch(`${apiBase}/v1/auth/user-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (res.ok && (body.token || body.message === "User login successfully")) {
        const authPayload = body.token
          ? body
          : { token: "session", user: body.user };
        appDispatch(setAuthData(authPayload));
        router.push("/home");
        toast({ variant: "success", title: `Logged in${authPayload.user?.name ? ` as ${authPayload.user.name}` : ""}` });
      } else {
        throw new Error(body?.message || "Invalid login credentials");
      }
    } catch (err) {
      console.log(err);
      toast({ variant: "destructive", description: "Something went wrong" });
    }
  };

  return (
    <div>
      <AddToHomescreenPrompt />
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
            <img
              src="/assets/images/Signup/phone1.svg"
              alt="Phone_Image"
              className="flex-1"
            />
            <div className="border flex-1 lg:border-muted-foreground/30 lg:rounded-lg p-12 pl-8 lg:w-[50%] ">
              <div className="p-0">
                <Logo />
              </div>
              <div className="lg:p-2">
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
                <div className="mt-4">
                  <GoogleButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signin;
