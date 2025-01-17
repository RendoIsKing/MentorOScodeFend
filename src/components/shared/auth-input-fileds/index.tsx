import React from "react";
import Link from "next/link";
import PhoneInput from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { ABeeZee } from "next/font/google";
import { FormMessage } from "@/components/ui/form";
import GoogleButton from "../google-button";
import CustomHr from "../custom-hr";
import PasswordInput from "@/components/password-input";
import { useFormContext } from "react-hook-form";
import PhoneEmailInput from "@/components/PhoneEmailInput";

export const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const AuthInputs = ({ type }) => {
  const router = useRouter();
  const pathname = usePathname();
  const form = useFormContext();

  // Helper function to get error message
  const getErrorMessage = (fieldName: string) => {
    const error = form.formState.errors.loginMethod || form.formState.errors;
    return error?.[fieldName]?.message?.toString();
  };

  return (
    <div className="min-w-[320px]">
      {type !== "reset" ? (
        type === "signin" ? (
          <PhoneEmailInput className="mt-4" />
        ) : (
          <PhoneInput className="mt-4" />
        )
      ) : null}
      {getErrorMessage("loginMethod") && (
        <div className="text-destructive text-sm mt-1">
          {getErrorMessage("loginMethod")}
        </div>
      )}

      {type === "signin" && (
        <PasswordInput className="pt-4" {...form.register("password")} />
      )}
      {getErrorMessage("password") && (
        <div className="text-destructive text-sm mt-1">
          {getErrorMessage("password")}
        </div>
      )}

      {type === "reset" && (
        <>
          <PasswordInput
            className="pt-4"
            {...form.register("newPassword")}
            placeholder="New Password"
          />
          {getErrorMessage("newPassword") && (
            <div className="text-destructive text-sm mt-1">
              {getErrorMessage("newPassword")}
            </div>
          )}
          <PasswordInput
            className="pt-4"
            placeholder="Confirm Password"
            {...form.register("confirmPassword")}
          />
          {getErrorMessage("confirmPassword") && (
            <div className="text-destructive text-sm mt-1">
              {getErrorMessage("confirmPassword")}
            </div>
          )}
        </>
      )}

      {(type !== "forgot" || type !== "reset") && (
        <div className={`mt-6 lg:${fontItalic.className} font-light`}>
          <p>By continuing, you agree to our</p>
          <div className="flex">
            <span className="text-primary">Terms of Services</span>
            <span>&nbsp; & &nbsp;</span>
            <span className="text-primary">Privacy Policy</span>.
          </div>
        </div>
      )}
      <Button
        className="block w-full my-4 text-base"
        type="submit"
        // disabled={!form.formState.isValid}
      >
        {type === "reset"
          ? "Reset Password"
          : type !== "forgot"
          ? "Continue"
          : "Forget"}
      </Button>
      {(type !== "forgot" || type !== "reset") && (
        <>
          <GoogleButton />
          <CustomHr />
        </>
      )}
      {type === "signin" && (
        <div className="w-full text-center mt-2">
          <Link
            className="text-primary text-base hover:underline"
            href="/forgotpassword"
          >
            Forgot Password
          </Link>
        </div>
      )}
      <div className="text-base flex justify-center mt-8">
        {pathname !== "/signup" ? (
          <p>{`Don't have an account?`}</p>
        ) : (
          <p>{`Already have an account?`}</p>
        )}
        &nbsp;
        {pathname !== "/signup" ? (
          <Link className="text-primary" href="signup">
            Sign Up
          </Link>
        ) : (
          <Link className="text-primary" href="signin">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default AuthInputs;
