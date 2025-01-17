import { phoneNumberRefine } from "@/lib/utils";
import { z } from "zod";

export const signupFormSchema = z.object({
  phoneNumber: z.string({
    required_error: "Phone Number is required",
  }),
  prefix: z.string({
    required_error: "Please select a country.",
  }),
});

export const signinFormSchema = z.object({
  loginMethod: z.union([
    z.object({
      type: z.literal("phone"),
      prefix: z.string().min(1, "Dial code is required"),
      phoneNumber: z.string().min(8, "Phone number is too short"),
    }),
    z.object({
      type: z.literal("email"),
      email: z.string().email("Invalid email address"),
    }),
  ]),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export const resetPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must not exceed 50 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// .refine((data) => phoneNumberRefine(data.phoneNumber, data.prefix), {
//   message: "Please Enter valid number",
//   path: ["phoneNumber"],
// });
