"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  parsePhoneNumber,
  getCountryCallingCode,
  isValidPhoneNumber,
} from "react-phone-number-input";
import { useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { useCountryCodeContext } from "@/context/countryCodeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PhoneEmailInput = ({ className, ...props }) => {
  const form = useFormContext();
  const { countryCode } = useCountryCodeContext();
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState<"phone" | "email" | "username">("phone");

  const error = form.formState.errors.loginMethod;

  const placeholder = useMemo(() => {
    if (inputType === "phone") return "Phone number";
    if (inputType === "email") return "Email";
    return "Username";
  }, [inputType]);

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

  const handleInputChange = (value: string) => {
    const trimmedValue = value.trim();
    setInputValue(trimmedValue);

    if (inputType === "email") {
      form.setValue("loginMethod", {
        type: "email",
        email: trimmedValue,
      });
      form.clearErrors("loginMethod");
    } else if (inputType === "username") {
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

  // When toggling login method, keep the input text but re-validate and re-write form.loginMethod
  useEffect(() => {
    // Reset the target shape first to avoid union/schema mismatch
    if (inputType === "email") {
      form.setValue("loginMethod", { type: "email", email: "" });
    } else if (inputType === "username") {
      form.setValue("loginMethod", { type: "username", username: "" });
    } else {
      form.setValue("loginMethod", { type: "phone", prefix: "", phoneNumber: "" });
    }
    form.clearErrors("loginMethod");
    if (inputValue) handleInputChange(inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputType]);

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
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={inputType === "phone" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setInputType("phone")}
        >
          Phone
        </Button>
        <Button
          type="button"
          variant={inputType === "email" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setInputType("email")}
        >
          Email
        </Button>
        <Button
          type="button"
          variant={inputType === "username" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setInputType("username")}
        >
          Username
        </Button>
      </div>
      <div className="relative">
        <Input
          {...props}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
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
