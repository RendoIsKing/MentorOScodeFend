import { phoneNumberRefine } from "@/lib/utils";
import { z } from "zod";

export const authFormSchema = z
  .object({
    phoneNumber: z
      .string({
        required_error: "Phone Number is required",
      })
      ,
    prefix: z.string({
      required_error: "Please select a country.",
    }),
  })
  // .refine((data) => phoneNumberRefine(data.phoneNumber, data.prefix), {
  //   message: "Please Enter valid number",
  //   path: ["phoneNumber"],
  // });
