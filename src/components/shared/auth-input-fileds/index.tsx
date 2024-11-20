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

// TODO: Make this font definition dynamic
export const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const AuthInputs = ({ type }) => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div>
      <PhoneInput className="mt-4" />
      <FormMessage />
      {type === "signin" && <PasswordInput className="pt-4" />}
      <div className={`mt-6 lg:${fontItalic.className} font-light`}>
        <p>
          We will send a text with a verification code. Message and date rates
          may apply, By continuing, you agree to our
        </p>
        <div className="flex">
          <span className="text-primary">Terms of Services</span>
          <span>&nbsp; & &nbsp;</span>
          <span className="text-primary">Privacy Policy</span>.
        </div>
      </div>
      <Button className="block w-full my-4 text-base" type="submit">
        Continue
      </Button>
      <CustomHr />
      <GoogleButton />
      <div className="text-base flex justify-center mt-8">
        {pathname !== "/signup" ? (
          <p>{`Don’t have an account?`}</p>
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
