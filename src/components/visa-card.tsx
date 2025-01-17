"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const userCardData = {
  username: "John Doe",
  country: "india",
  state: "state1",
  expriy: "12/30",
  cvc: "927",
  street: "omega-city 15g",
  cardNumber: "42424242424242",
};

const VisaCard = () => {
  const FormSchema: any = z.object({
    username: z.string().min(3, {
      message: "Name must be at least 3 characters.",
    }),

    country: z.string({
      required_error: "Please select your country.",
    }),

    state: z.string({
      required_error: "Please select your state.",
    }),

    expiry: z.string({
      required_error: "Please enter card expiry date",
    }),

    cvc: z
      .string({
        required_error: "Please enter the cvc",
      })
      .refine(
        (value) => {
          // Check if value is not empty
          return value.trim() !== "";
        },
        {
          message: "CVC is required.",
        }
      ),

    street: z
      .string({
        required_error: "Please enter your address.",
      })
      .min(10, {
        message: "Address must be at least 10 characters long",
      }),

    cardNumber: z.string().refine((val) => /^\d{16}$/.test(val), {
      message: "Please enter a valid 16-digit card number.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: userCardData.username,
      street: userCardData.street,
      cardNumber: userCardData.cardNumber,
      expiry: userCardData.expriy,
      cvc: userCardData.cvc,
      country: userCardData.country,
      state: userCardData.state,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="p-5">
      <div className="md:flex md:items-center flex-col">
        <p className="w-full  md:max-w-md md:w-1/2 text-lg mt-8 text-muted-foreground">
          Billing Details
        </p>
      </div>

      <div className="mt-5 ">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-4">
              <div className="flex justify-between gap-3 md:flex-col md:items-center">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="w-1/2 max-w-md">
                      <FormLabel
                        className={`text-base ${fontItalic.className}`}
                      >
                        Country
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-full bg-transparent p-4  border-muted-foreground">
                            <SelectValue
                              placeholder="Select Country"
                              className=""
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="pakistan">Pakistan</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="w-1/2 max-w-md ">
                      <FormLabel
                        className={`text-base ${fontItalic.className}`}
                      >
                        State Province
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-full bg-transparent p-4  border-muted-foreground ">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="state1">state1</SelectItem>
                          <SelectItem value="state2">state2</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="md:mt-1">
                        <FormLabel
                          className={`text-base ${fontItalic.className}`}
                        >
                          Street
                        </FormLabel>
                        <FormControl className="rounded-full bg-transparent border-muted-foreground">
                          <Input
                            placeholder="Enter street address"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2">
                  <p className="mt-10 text-lg text-muted-foreground">
                    Card Details
                  </p>
                </div>
              </div>
              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className={`text-base ${fontItalic.className}`}
                        >
                          Name on Card
                        </FormLabel>
                        <FormControl className="rounded-full bg-transparent border-muted-foreground">
                          <Input placeholder="Enter name on card" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="md:flex md:justify-center ">
                <div className="md:max-w-md md:w-1/2 mt-1">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className={`text-base ${fontItalic.className}`}
                        >
                          Card Number
                        </FormLabel>
                        <FormControl className="rounded-full bg-transparent border-muted-foreground">
                          <Input placeholder="0000 0000 0000 0000" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 md:justify-center">
                <FormField
                  control={form.control}
                  name="expiry"
                  // pattern="\d{2}/\d{2}"
                  render={({ field }) => (
                    <FormItem className="w-1/2 md:max-w-56 md:w-1/4 mt-1">
                      <FormLabel
                        className={`text-base ${fontItalic.className}`}
                      >
                        Expiration Date
                      </FormLabel>
                      <FormControl className="rounded-full bg-transparent border-muted-foreground">
                        <Input placeholder="MMYY" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvc"
                  render={({ field }) => (
                    <FormItem className="w-1/2 md:max-w-56 md:w-1/4 mt-1">
                      <FormLabel
                        className={`font-normal text-base  ${fontItalic.className}`}
                      >
                        CVC
                      </FormLabel>
                      <FormControl className="rounded-full bg-transparent border-muted-foreground">
                        <Input placeholder="" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between gap-3 md:justify-center">
                <div className="w-1/2 md:max-w-56 md:w-1/4 ">
                  <Button type="submit" className="w-full">
                    Save
                  </Button>
                </div>

                <div className="w-1/2 md:max-w-56 md:w-1/4 ">
                  <Button type="submit" className="w-full bg-[#eb5757]">
                    Delete this card
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default VisaCard;
