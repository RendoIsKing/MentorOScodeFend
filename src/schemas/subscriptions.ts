import { z } from "zod";

export const FixedFormSchema = z.object({
  type: z.string(),
  title: z.string(),
  price: z
    .union([
      z.string().transform((x) => x.replace(/[^0-9.-]+/g, "")),
      z.number(),
    ])
    .pipe(
      z.coerce
        .number({ required_error: "Please enter a price.(i.e 0.00)" })
        .min(0.01)
        .max(99)
        .multipleOf(0.01)
    ),
  permissions: z.array(
    z.object({
      feature: z.string(),
      isAvailable: z.boolean(),
      description: z.string(),
    })
  ),
});

export const CustomFormSchema = z.object({
  type: z.string(),
  title: z
    .string({ required_error: "Plan name is Required" })
    .min(5, { message: "Plan should be at least 5 characters" })
    .max(12, { message: "Plan should be max 12 characters." }),
  price: z
    .union([
      z.string().transform((x) => x.replace(/[^0-9.-]+/g, "")),
      z.number(),
    ])
    .pipe(
      z.coerce
        .number({ required_error: "Please enter a price.(i.e 0.00)" })
        .min(0.01)
        .max(99)
        .multipleOf(0.01)
    ),
  permissions: z
    .array(
      z.object({
        feature: z.string(),
        isAvailable: z.boolean(),
        description: z.string(),
      })
    )
    .refine((value) => value.some((item) => item.isAvailable), {
      message: "You have to select at least one permission.",
    }),
});

export const permissions = [
  {
    isAvailable: false,
    feature: "Early access to new video + exclusive content",
  },
  {
    isAvailable: false,
    feature: "Can send direct message",
  },
  {
    isAvailable: false,
    feature: "Shoutout on live",
  },
] as const;
