"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { Label } from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/shared/Logo";
import PageHeader from "@/components/shared/page-header";
import { Manrope } from "next/font/google";
import {
  useCreateUserMutation,
  useLazyCheckUsernameQuery,
} from "@/redux/services/haveme";
import { formatFullName } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

const fontItalic = Manrope({ subsets: ["latin"], weight: ["700"], display: "swap" });

const GoogleUserInfo = () => {
  const { toast } = useToast();
  const router = useRouter();

  const { isMobile } = useClientHardwareInfo();
  const [otherGender, setOtherGender] = useState(false);
  const [usernameText, setUsernameText] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState<string | null>(null);

  const [checkUsernameMethod] = useLazyCheckUsernameQuery();
  const [createUserMethod] = useCreateUserMutation();

  // Schema without email and password since Google provides them
  const FormSchema: any = z.object({
    fullName: z.string().min(4, {
      message: "Full Name must be at least 4 characters.",
    }),

    username: z
      .string()
      .min(3, {
        message: "Name must be at least 3 characters and unique.",
      })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: "UserName must contain only alphanumeric characters.",
      }),

    genderType: z.string({
      required_error: "Please select your gender.",
    }),

    otherGender: z
      .string()
      .refine(
        (value = "") => {
          return form.getValues("genderType") === "other"
            ? value.trim().length > 0
            : true;
        },
        {
          message: "Please specify your gender",
        }
      ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: "",
      username: "",
      genderType: "",
      otherGender: "",
    },
  });

  const fieldError = Object.keys(form.formState.errors).length === 0;
  const debouncedValue = useDebounce(usernameText, 500);
  
  useEffect(() => {
    if (debouncedValue) {
      checkUsernameMethod({ username: debouncedValue })
        .unwrap()
        .then((response) => {
          if (response.isAvailable) {
            setUsernameAvailability("Username is available");
            form.clearErrors("username");
          } else {
            setUsernameAvailability(null);
            form.setError("username", {
              type: "manual",
              message: "Username is already taken",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [debouncedValue]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (usernameAvailability) {
      let createUserObject = {
        fullName: formatFullName(data.fullName),
        userName: data.username,
        gender:
          data.genderType.toLowerCase() === "other"
            ? data.otherGender
            : data.genderType,
      };
      
      createUserMethod(createUserObject)
        .unwrap()
        .then((res) => {
          router.replace("/user-photo");
          toast({
            variant: "success",
            description: "Details added successfully",
          });
        })
        .catch((err) => {
          console.log(err);
          toast({
            variant: "destructive",
            description: err?.data?.error?.message || "Something went wrong",
          });
        });
    } else {
      form.setError("username", {
        type: "manual",
        message: "Username is already taken",
      });
    }
  }

  return (
    <div>
      {isMobile && (
        <PageHeader
          title="Complete Your Profile"
          description="Just a few more details to get started"
        />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 space-y-6 lg:space-y-4 lg:border-2 lg:border-solid lg:rounded-xl lg:border-muted-foreground/30 lg:w-[550px] lg:my-0 lg:mr-auto lg:ml-auto lg:p-8"
        >
          {!isMobile && (
            <>
              <div className="mb-14">
                <Logo />
              </div>
              <Label className={` text-3xl ${fontItalic.className}`}>
                Complete Your Profile
              </Label>
              <p className="text-sm text-muted-foreground">
                We&apos;ve got your email from Google. Just add a few more details.
              </p>
            </>
          )}
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6 ">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={` font-normal ${fontItalic.className}`}
                    >
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 border-muted-foreground/50"
                        type="text"
                        placeholder="Enter your full name here"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={` font-normal ${fontItalic.className}`}
                    >
                      Create Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-12"
                        type="text"
                        placeholder="Enter username here"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setUsernameText(e.target.value);
                        }}
                      />
                    </FormControl>
                    {usernameAvailability && (
                      <FormMessage
                        className={
                          !fieldError ? "text-red-600" : "text-green-600"
                        }
                      >
                        {usernameAvailability}
                      </FormMessage>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                              placeholder="Select a gender to proceed"
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
            </div>
            <Button className="block w-full" type="submit">
              Confirm
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GoogleUserInfo;

