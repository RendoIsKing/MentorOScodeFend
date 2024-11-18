"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar-dropdown";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ABeeZee } from "next/font/google";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useCreateUserMutation,
  useUploadImageMutation,
} from "@/redux/admin-services/admin/admin";
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

interface Location {
  lat: number;
  long: number;
}

interface ResponseBody {
  email: string;
  dob: Date;
  fullName: string;
  userName: string;
  bio: string;
  gender: string;
  location: Location[];
}

const AdminForm = () => {
  let responseBody: ResponseBody = {
    email: "",
    fullName: "",
    userName: "",
    bio: "",
    gender: "",
    dob: new Date(),

    location: [],
  };

  const [imageID, setImageId] = useState("");
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const [createUser] = useCreateUserMutation();

  const [otherGender, setOtherGender] = useState(false);
  const [selectedImage, setSelectedImage] = useState();
  const [locationObj, setLocationObj] = useState<Location | null>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      const obj = {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      };
      //console.log("obj", obj);
      setLocationObj(obj);
    });
  }, []);

  //console.log("imageId", imageID);
  const FormSchema: any = z.object({
    username: z
      .string()
      .min(5, {
        message: "Username must be at least 5 characters.",
      })
      .refine((s) => !s.includes(" "), "No Spaces!"),
    fullname: z
      .string()
      .min(5, {
        message: "Username must be at least 5 characters.",
      })
      .refine((s) => !s.includes(" "), "No Spaces!"),

    email: z.string().email({
      message: "Email must be a valid email address.",
    }),

    bio: z
      .string()
      .min(10, {
        message: "Bio must be at least 10 characters.",
      })
      .max(160, {
        message: "Bio must not be longer than 30 characters.",
      }),
    genderType: z.string({
      required_error: "Please select your gender.",
    }),

    otherGender: z
      .string()
      .optional()
      .refine(
        (value) => {
          const gender = form.getValues("genderType");

          if (gender == "male" || gender == "female") return true;
          else {
            if (!value) return false;
            else return true;
          }
        },
        {
          message: "Please specify your gender",
        }
      ),

    dob: z.date({
      required_error: "A date of birth is required.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const recDate = new Date(data.dob);

    if (locationObj) responseBody.location.push(locationObj);
    responseBody.email = data.email;
    responseBody.fullName = data.fullname;
    responseBody.userName = data.username;
    responseBody.bio = data.bio;
    responseBody.gender = data.genderType;
    responseBody.dob = new Date(data.dob);

    const userFunction = async () => {
      try {
        let response = await createUser(responseBody)
          .unwrap()
          .then((payload) => {
            toast({
              variant: "success",
              title: "Success",
              description: payload.message,
            });
            return payload;
          });
      } catch (error) {
        console.log(" create user error", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
      }
    };

    userFunction();
  }

  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <div className="text-3xl mb-10">Create User</div>

      <div className="flex flex-col items-center justify-center w-[70%] ">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            " pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Fullname</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="genderType"
              render={({ field }) => (
                <FormItem>
                  <>
                    {field.value === "other"
                      ? setOtherGender(true)
                      : setOtherGender(false)}
                    <FormLabel
                      className={` font-normal ${fontItalic.className}`}
                    >
                      Gender
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-full p-3 h-12 text-muted-foreground">
                          <SelectValue
                            placeholder="Select a gender to procced"
                            className=" border-muted-foreground/50  "
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    {otherGender ? (
                      <FormField
                        control={form.control}
                        name="otherGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={` font-normal mt-10 ${fontItalic.className}`}
                            >
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
                    ) : (
                      <></>
                    )}
                  </>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" className="w-[35%]">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminForm;
