"use client";
import React, { useState } from "react";
import {
  parsePhoneNumber,
  getCountryCallingCode,
  isValidPhoneNumber,
} from "react-phone-number-input";
import { useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { useCountryCodeContext } from "@/context/countryCodeContext";

const PhoneEmailInput = ({ className, ...props }) => {
  const form = useFormContext();
  const { countryCode } = useCountryCodeContext();
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState<"phone" | "email" | "username">("phone");

  const error = form.formState.errors.loginMethod;

  const determineInputType = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+?\d{1,3}[-\s.]?)?(\d{1,4}[-\s.]?){1,3}\d{1,4}$/;

    if (emailRegex.test(value)) return "email";
    if (phoneRegex.test(value.replace(/\s+/g, ""))) return "phone";
    return "username";
  };

  const handleInputChange = (value: string) => {
    const trimmedValue = value.trim();
    setInputValue(trimmedValue);

    const currentInputType = determineInputType(trimmedValue);
    setInputType(currentInputType);

    if (currentInputType === "email") {
      form.setValue("loginMethod", {
        type: "email",
        email: trimmedValue,
      });
      form.clearErrors("loginMethod");
    } else if (currentInputType === "username") {
      form.setValue("loginMethod", {
        type: "username",
        username: trimmedValue,
      });
      form.clearErrors("loginMethod");
    } else {
      const cleanedValue = trimmedValue.replace(/[^\d+]/g, "");

      if (cleanedValue && isValidPhoneNumber(cleanedValue)) {
        try {
          const phoneNumber = parsePhoneNumber(cleanedValue);

          if (phoneNumber) {
            const dialCode = getCountryCallingCode(phoneNumber.country);

            form.setValue("loginMethod", {
              type: "phone",
              prefix: `+${dialCode}`,
              phoneNumber: phoneNumber.nationalNumber,
            });
          } else {
            form.setValue("loginMethod", {
              type: "phone",
              prefix: "",
              phoneNumber: cleanedValue.replace(/^\+/, ""),
            });
          }

          form.clearErrors("loginMethod");
        } catch {
          form.setError("loginMethod", {
            type: "manual",
            message: "Invalid phone number format",
          });
        }
      } else if (cleanedValue && !cleanedValue.startsWith("+") && /^\d{6,15}$/.test(cleanedValue)) {
        // Allow local/national numbers by inferring country calling code from app context.
        // This prevents sign-in payload from being empty for users typing just "48290380".
        try {
          const cc = (countryCode || "NO") as any;
          const dialCode = getCountryCallingCode(cc);
          const e164 = `+${dialCode}${cleanedValue}`;
          if (isValidPhoneNumber(e164)) {
            form.setValue("loginMethod", {
              type: "phone",
              prefix: `+${dialCode}`,
              phoneNumber: cleanedValue,
            });
            form.clearErrors("loginMethod");
          } else {
            throw new Error("Invalid phone");
          }
        } catch {
          form.setError("loginMethod", {
            type: "manual",
            message: "Invalid phone number",
          });
          form.setValue("loginMethod", { type: "phone", prefix: "", phoneNumber: "" });
        }
      } else {
        form.setError("loginMethod", {
          type: "manual",
          message: "Invalid phone number",
        });

        form.setValue("loginMethod", {
          type: "phone",
          prefix: "",
          phoneNumber: "",
        });
      }
    }

    form.trigger("loginMethod");
  };

  const getErrorMessage = () => {
    if (!error) return null;

    if (typeof error === "object" && "type" in error) {
      const loginError = error as Record<string, any>;

      if (loginError?.prefix?.message) return loginError.prefix.message;
      if (loginError?.phoneNumber?.message)
        return loginError.phoneNumber.message;

      if (loginError?.email?.message) return loginError.email.message;
      if (loginError?.username?.message) return loginError.username.message;
    }

    return error.message?.toString() || "Invalid input";
  };

  const errorMessage = getErrorMessage();

  return (
    <div>
      <div className="relative">
        <Input
          {...props}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter phone number, email or username"
          className="h-12 pl-6 border-muted-foreground/30"
        />
      </div>
      {errorMessage && (
        <div className="flex items-center text-destructive text-sm mt-1">
          <AlertCircle size={16} className="mr-2" />
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default PhoneEmailInput;
