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
  password: z.string().min(8, "Password must be at least 8 characters"),
});
// .refine((data) => phoneNumberRefine(data.phoneNumber, data.prefix), {
//   message: "Please Enter valid number",
//   path: ["phoneNumber"],
// });
