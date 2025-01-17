import { z } from "zod";

export const tipAmountSchema = z.object({
  amount: z
    .number()
    .min(1)
    .max(100)
    .multipleOf(0.01, { message: "Upto 2 digits allowed" }),
  message: z.string().max(100).optional(),
  // comment: z.string(),
});
