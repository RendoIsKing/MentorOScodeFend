"use client";
import * as React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { phoneNumberRefine } from "@/lib/utils";

const PhoneEmailInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const authForm = useFormContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Determine if input looks like an email or phone number
      const isEmail = value.includes("@");

      if (isEmail) {
        // Set login method to email
        authForm.setValue("loginMethod", {
          type: "email",
          email: value,
        });
      } else {
        // Try to parse phone number
        const dialCode = value.match(/^\+?(\d{1,3})/)?.[1] || "";
        const phoneNumber = value
          .replace(/^\+?(\d{1,3})?/, "")
          .replace(/\D/g, "");

        authForm.setValue("loginMethod", {
          type: "phone",
          prefix: dialCode ? `+${dialCode}` : "",
          phoneNumber: phoneNumber,
        });
      }
    };

    return (
      <Input
        ref={ref}
        placeholder="Enter phone number or email"
        className={cn("h-12 border-muted-foreground/30", className)}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PhoneEmailInput.displayName = "PhoneEmailInput";

export default PhoneEmailInput;
