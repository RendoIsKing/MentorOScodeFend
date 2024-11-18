"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { ABeeZee } from "next/font/google";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

export function GenderSelectForm() {
  const router = useRouter();

  const FormSchema: any = z.object({
    type: z.enum(["Male", "Female", "Others"], {
      required_error: "You need to select a gender.",
    }),
    otherGender: z
      .string()
      .optional()
      .refine(
        (value = "") => {
          return form.getValues("type") === "Others"
            ? value.trim().length > 0
            : true;
        },
        {
          message: "Please specify your gender",
        }
      ),
  });
  type FormData = z.infer<typeof FormSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit() {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4"></pre>
      ),
    });
    router.push("/home");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full mt-6 space-y-8"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0 p-4 ring-1 ring-secondary ring-inset rounded-3xl">
                    <FormControl>
                      <RadioGroupItem value="Male" />
                    </FormControl>
                    <FormLabel className="font-normal">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 p-4 ring-1 ring-secondary ring-inset rounded-3xl">
                    <FormControl>
                      <RadioGroupItem value="Female" />
                    </FormControl>
                    <FormLabel className="font-normal">Female</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 p-4 ring-1 ring-secondary ring-inset rounded-3xl">
                    <FormControl>
                      <RadioGroupItem value="Others" />
                    </FormControl>
                    <FormLabel className="font-normal">Other</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="otherGender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`font-normal ${fontItalic.className}`}>
                Specify your gender
              </FormLabel>
              <FormControl>
                <Input
                  className="h-12"
                  type="string"
                  placeholder="Enter your gender"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          <Button className="w-full">Next</Button>
        </div>
      </form>
    </Form>
  );
}
