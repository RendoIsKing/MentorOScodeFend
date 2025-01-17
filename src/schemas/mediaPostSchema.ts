import { z } from "zod";

export const MediaPostFormSchema = z
  .object({
    description: z.string(),
    // .max(500)
    // .min(3, { message: "Description must contain at least 3 characters" }),
    uploadString: z.enum(["story", "post"], {
      required_error: "Please select a media type",
    }),
    // viewOptions: z.string({
    //   required_error: "Please select a view option.",
    // }),
    viewOptions: z.enum(["public", "subscriber", "pay-per-view"], {
      required_error: "Please select a view option.",
    }),
    price: z
      .union([
        z.string().transform((x) => x.replace(/[^0-9.-]+/g, "")),
        z.number(),
      ])
      .pipe(
        z.coerce
          .number({ required_error: "Please enter a priceuuuuuu.(i.e 0.00)" })
          .min(1)
          .max(99)
          .multipleOf(0.01)
      )
      .optional(),
  })
  .refine(
    (data) =>
      isPricePerViewSelected(data.viewOptions, data.price, data.uploadString),
    {
      message: "Please enter a price.(i.e 0.00)",
      path: ["price"],
    }
  )
  // .refine((data) => checkUploadString(data.uploadString, data.description), {
  //   message: "Please enter description",
  //   path: ["description"],
  // });

// public , subscriber, pay per view

const isPricePerViewSelected = (viewOption, price, type) => {
  if (type === "post") {
    if (viewOption === "pay-per-view" && price === undefined) return false;
    else return true;
  } else return true;
};

const checkUploadString = (uploadString, description) => {

  if (uploadString === "story") {
    return true;
  } else if (uploadString === "post") {
    if (description && description.length > 3 && description.length < 500) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};
