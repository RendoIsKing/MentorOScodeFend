"use client";
import React, { useState, useEffect } from "react";
import {
  parsePhoneNumber,
  getCountryCallingCode,
} from "react-phone-number-input";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Phone, Mail, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";

const PhoneEmailInput = ({ className, ...props }) => {
  const form = useFormContext();
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState<"phone" | "email">("phone");

  const error = form.formState.errors.loginMethod;

  const determineInputType = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex = /^(\+?\d{1,3}[-\s.]?)?(\d{1,4}[-\s.]?){1,3}\d{1,4}$/;

    if (emailRegex.test(value)) {
      return "email";
    }

    if (phoneRegex.test(value.replace(/\s+/g, ""))) {
      return "phone";
    }

    return "phone";
  };

  const handleInputChange = (value: string) => {
    const trimmedValue = value.trim();
    setInputValue(trimmedValue);

    try {
      const currentInputType = determineInputType(trimmedValue);
      setInputType(currentInputType);

      if (currentInputType === "email") {
        form.setValue("loginMethod", {
          type: "email",
          email: trimmedValue,
        });
      } else {
        const cleanedValue = trimmedValue.replace(/[^\d+]/g, "");

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
        } catch {
          form.setValue("loginMethod", {
            type: "phone",
            prefix: "",
            phoneNumber: cleanedValue.replace(/^\+/, ""),
          });
        }
      }

      form.trigger("loginMethod");
    } catch (error) {
      console.error("Input processing error:", error);
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;

    if (typeof error === "object" && "type" in error) {
      const loginError = error as Record<string, any>;

      if (loginError?.prefix?.message) return loginError.prefix.message;
      if (loginError?.phoneNumber?.message)
        return loginError.phoneNumber.message;

      if (loginError?.email?.message) return loginError.email.message;
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
          placeholder="Enter phone number or email"
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
