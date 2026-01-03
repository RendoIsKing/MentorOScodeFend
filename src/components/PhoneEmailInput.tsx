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

  const normalizePhone = (raw: string) => {
    const trimmedValue = raw.trim();
    const cleanedValue = trimmedValue.replace(/[^\d+]/g, "");

    if (cleanedValue && isValidPhoneNumber(cleanedValue)) {
      const phone = parsePhoneNumber(cleanedValue);
      if (phone) {
        const dial = getCountryCallingCode(phone.country);
        return { prefix: `+${dial}`, phoneNumber: phone.nationalNumber };
      }
      // fallback: keep digits as number, no prefix
      return { prefix: "", phoneNumber: cleanedValue.replace(/^\+/, "") };
    }

    // Local/national number (no '+') — infer from selected country (defaults to NO)
    if (cleanedValue && !cleanedValue.startsWith("+") && /^\d{6,15}$/.test(cleanedValue)) {
      const cc = (countryCode || "NO") as any;
      const dial = getCountryCallingCode(cc);
      const e164 = `+${dial}${cleanedValue}`;
      if (isValidPhoneNumber(e164)) {
        return { prefix: `+${dial}`, phoneNumber: cleanedValue };
      }
    }

    return null;
  };

  const determineInputType = (value: string) => {
    const v = value.trim();
    if (!v) return "phone";
    if (v.includes("@")) return "email";
    // If there are letters, it's a username (prevents misclassifying "blooty" as a phone)
    if (/[A-Za-z]/.test(v)) return "username";
    // Otherwise treat as phone (digits, spaces, +, etc.)
    return "phone";
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
      try {
        const normalized = normalizePhone(trimmedValue);
        if (normalized) {
          form.setValue("loginMethod", { type: "phone", ...normalized });
          form.clearErrors("loginMethod");
        } else {
          throw new Error("Invalid phone");
        }
      } catch {
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
    <div className={className}>
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
