"use client";
import React, { useEffect, useRef, useState } from "react";
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
import CustomHr from "@/components/shared/custom-hr";
import DesignAuthShell from "@/components/design/auth/DesignAuthShell";

const Signin = () => {
  const { isMobile } = useClientHardwareInfo();
  const pathname = usePathname();
  const appDispatcher = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const designEnabled = String(process.env.NEXT_PUBLIC_DESIGN || "") === "1";

  // Anti-rate-limit guards (persist across tabs)
  const inFlightRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const backoffRef = useRef<number>(0);
  useEffect(() => {
    try {
      const rawTs = typeof window !== "undefined" ? window.localStorage.getItem("auth_login_cooldown_until") : null;
      const rawBackoff = typeof window !== "undefined" ? window.localStorage.getItem("auth_login_backoff_ms") : null;
      const ts = rawTs ? parseInt(rawTs, 10) : 0;
      const backoffMs = rawBackoff ? parseInt(rawBackoff, 10) : 0;
      if (ts && ts > Date.now()) setCooldownUntil(ts);
      if (backoffMs && backoffMs > 0) backoffRef.current = backoffMs;
    } catch {}
  }, []);
  const startCooldown = (ms: number) => {
    const safety = 2000;
    const until = Date.now() + Math.max(0, ms) + safety;
    setCooldownUntil(until);
    try { if (typeof window !== "undefined") localStorage.setItem("auth_login_cooldown_until", String(until)); } catch {}
  };
  const updateBackoff = (serverMs?: number) => {
    const MIN_MS = 60000; const MAX_MS = 300000;
    const base = Math.max(serverMs || 0, MIN_MS);
    const prev = backoffRef.current || 0;
    const next = Math.min(prev ? Math.min(prev * 2, MAX_MS) : base, MAX_MS);
    backoffRef.current = next;
    try { if (typeof window !== "undefined") localStorage.setItem("auth_login_backoff_ms", String(next)); } catch {}
    return next;
  };
  const computeServerWindowMs = (res: Response) => {
    const reset = res.headers.get("x-ratelimit-reset");
    const ra = res.headers.get("retry-after");
    let msFromReset = 0;
    if (reset) {
      const resetSec = parseFloat(reset);
      if (isFinite(resetSec)) {
        const nowSec = Date.now() / 1000;
        const deltaSec = Math.max(0, resetSec - nowSec);
        msFromReset = Math.round(deltaSec * 1000);
      }
    }
    const msFromRetry = ra ? (parseFloat(ra) * 1000) : 0;
    return Math.max(msFromReset, msFromRetry);
  };

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
      if (inFlightRef.current) return;
      if (cooldownUntil && Date.now() < cooldownUntil) {
        const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
        toast({ variant: "destructive", description: `Please wait ${left}s before trying again.` });
        return;
      }
      inFlightRef.current = true;
      setBusy(true);

      // Use the existing RTK Query mutation so we match the backend's expected payload
      const req: any = { password: formData.password };
      if (formData.loginMethod.type === "email") {
        req.email = formData.loginMethod.email;
      } else if (formData.loginMethod.type === "phone") {
        // Backend password-login matches phone only when phoneNumber contains "--" (e.g. "+47--48290380").
        // (OTP-init uses separate dialCode/phoneNumber, but password-login path parses the "--" format.)
        req.phoneNumber = `${formData.loginMethod.prefix}--${formData.loginMethod.phoneNumber}`;
      } else if (formData.loginMethod.type === "username") {
        req.username = formData.loginMethod.username;
      }

      const body: any = await loginUser(req).unwrap();

      const token = body?.token || body?.data?.token || "session";
      const user = body?.user || body?.data || undefined;
      if (token) {
        appDispatch(setAuthData({ token, user } as any));
        try {
          localStorage.removeItem("auth_login_backoff_ms");
          localStorage.removeItem("auth_login_cooldown_until");
        } catch {}
        router.push("/home");
        toast({ variant: "success", title: `Logged in${user?.name ? ` as ${user.name}` : ""}` });
      } else {
        throw new Error(body?.message || "Invalid login credentials");
      }
    } catch (err) {
      console.log(err);
      toast({ variant: "destructive", description: "Something went wrong" });
    } finally {
      setBusy(false);
      inFlightRef.current = false;
    }
  };

  return (
    <div>
      <AddToHomescreenPrompt />

      {designEnabled ? (
        <DesignAuthShell title="Welcome Back" subtitle="Sign in to your mentorio account">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="loginMethod"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <AuthInputs
                        type="signin"
                        afterBelow={
                          <div className="mt-4">
                            <GoogleButton mode="signin" />
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
          {isMobile && <PageHeader title="Sign In" description="Enter Your Phone Number or Email" showBackButton backHref="/signup" />}
          {isMobile ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="">
                <FormField
                  control={form.control}
                  name="loginMethod"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <AuthInputs
                          type="signin"
                          afterBelow={
                            <div className="mt-4">
                              <GoogleButton mode="signin" />
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
              <div className="w-full max-w-[520px] border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--card))] p-8">
                <div className="p-0 mb-2 flex justify-center">
                  <Logo />
                </div>
                <div className="lg:p-2">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="">
                      <FormField
                        control={form.control}
                        name="loginMethod"
                        render={() => (
                          <FormItem>
                            <FormControl>
                              <AuthInputs
                                type="signin"
                                afterBelow={
                                  <div className="mt-4">
                                    <GoogleButton mode="signin" />
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

export default Signin;
