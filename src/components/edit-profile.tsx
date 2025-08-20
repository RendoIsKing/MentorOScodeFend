import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";
import { useLazyCheckUsernameQuery } from "@/redux/services/haveme";
import { useDebounce } from "@/hooks/use-debounce";

// min shouldbe added when api call is done
const FormSchema = z.object({
  fullName: z
    .string({
      required_error: "Please enter name.",
    })
    .min(3, { message: "Name should be at least 3 characters." }),
  userName: z.string().min(3, {
    message: "Username must be at least 3 characters and unique.",
  }),
  bio: z.string({
    required_error: "Please enter Bio.",
  }),
  link: z.string({
    required_error: "Please enter Link.",
  }),
  instagramLink: z
    .string({
      required_error: "Please enter Instagram Url.",
    })
    .refine((val) => {
      if (val == "") return true;
      else {
        const regex = /^\s*(http\:\/\/)?instagram\.com\/[a-z\d-_]{1,255}\s*$/i;
        return regex.test(val);
      }
    }),
  youtubeLink: z.string({
    required_error: "Please enter Youtube Url.",
  }),
  tiktokLink: z.string({
    required_error: "Please enter Tiktok Url.",
  }),
});

const EditProfile = () => {
  const { user } = useUserOnboardingContext();
  const [updateMeTrigger] = useUpdateMeMutation();
  const [usernameText, setUsernameText] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState(null);
  const [checkUsernameMethod] = useLazyCheckUsernameQuery();
  const [isUserNameModified, setIsUserNameModified] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: "",
      userName: "",
      bio: "",
      instagramLink: "",
      link: "",
      tiktokLink: "",
      youtubeLink: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        userName: user.userName || "",
        bio: user.bio || "",
        instagramLink: user.instagramLink || "",
        link: `MentorOS.com/@${user.userName}`,
        tiktokLink: user.tiktokLink || "",
        youtubeLink: user.youtubeLink || "",
      });
    }
  }, [user, form]);

  const debouncedValue = useDebounce(usernameText, 500);

  useEffect(() => {
    if (debouncedValue) {
      checkUsernameMethod({ username: debouncedValue })
        .unwrap()
        .then((response) => {
          if (response.isAvailable) {
            setUsernameAvailability("Username is available");
            form.clearErrors("userName");
          } else {
            setUsernameAvailability(null);

            form.setError("userName", {
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
    if (usernameAvailability || !isUserNameModified) {
      updateMeTrigger(data)
        .unwrap()
        .then((response) => {
          toast({
            variant: "success",
            description: response?.message,
          });
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            description: "Error updating user",
          });
          console.log(error);
        });
    } else {
      form.setError("userName", {
        type: "manual",
        message: "Username is already taken",
      });
    }
  }

  return (
    <div className="px-3 mt-0 lg:-mt-12 lg:flex lg:flex-col lg:justify-center lg:w-[55%] lg:mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <div className="m-2 flex flex-col gap-4">
            <h2 className="text-primary my-1">About You</h2>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="flex gap-4 lg:gap-14 items-baseline">
                  <FormLabel className="w-28 text-md">Name</FormLabel>
                  <FormControl className="w-full flex flex-col gap-2">
                    <div>
                      <Input
                        className="px-4 border-none bg-background/10  focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:ring-0 text-md"
                        placeholder="Enter name"
                        {...field}
                      />
                      <Separator />
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem className="flex gap-4 lg:gap-14 items-baseline">
                  <FormLabel className="w-28 text-md">Username</FormLabel>
                  <FormControl className="w-full flex flex-col gap-2">
                    <div>
                      <Input
                        className="px-4 focus-visible:ring-offset-0  border-none bg-background/10  focus-visible:outline-none  focus-visible:ring-0 text-md"
                        placeholder="Enter username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setUsernameText(e.target.value);
                          setIsUserNameModified(true);
                        }}
                      />
                      <Separator />
                      {usernameAvailability && (
                        <FormMessage className="text-green-600">
                          {usernameAvailability}
                        </FormMessage>
                      )}
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="flex gap-4 lg:gap-14  items-baseline">
                  <FormLabel className="w-28 text-md">Bio</FormLabel>
                  <FormControl className="w-full flex flex-col gap-2">
                    <div>
                      <Textarea
                        className="px-4 focus-visible:ring-offset-0 text-md border-none bg-background/10  focus-visible:outline-none  focus-visible:ring-0 resize-none text-md"
                        placeholder="Enter Bio"
                        {...field}
                      />
                      <Separator />
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem className="flex gap-4 lg:gap-14  items-baseline">
                  <FormLabel className="w-28 text-md">Link</FormLabel>
                  <FormControl className="w-full flex flex-col gap-2">
                    <div>
                      <Input
                        className="px-4 focus-visible:ring-offset-0 border-none bg-background/10  focus-visible:outline-none focus-visible:ring-0 text-md"
                        placeholder="Enter Link"
                        {...field}
                      />
                      <Separator />
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <h2 className="text-primary mt-2">Social Media Accounts</h2>

            <FormField
              control={form.control}
              name="instagramLink"
              render={({ field }) => (
                <FormItem className="flex gap-4 lg:gap-14  items-baseline">
                  <FormLabel className="w-28 text-md">Instagram</FormLabel>
                  <FormControl className="w-full text-muted-foreground flex flex-col gap-2">
                    <div>
                      <Input
                        className="px-4 focus-visible:ring-offset-0 border-none bg-background/10  focus-visible:outline-none focus-visible:ring-0 text-md"
                        placeholder="Add Instagram"
                        {...field}
                      />
                      <Separator />
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtubeLink"
              render={({ field }) => (
                <FormItem className="flex gap-4 lg:gap-14 items-baseline">
                  <FormLabel className="w-28 text-md">Youtube</FormLabel>
                  <FormControl className="w-full text-muted-foreground flex flex-col gap-2">
                    <div>
                      <Input
                        className="px-4 focus-visible:ring-offset-0 border-none bg-background/10  focus-visible:outline-none focus-visible:ring-0 text-md"
                        placeholder="Add Youtube"
                        {...field}
                      />
                      <Separator />
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tiktokLink"
              render={({ field }) => (
                <FormItem className="flex gap-4 lg:gap-14  items-baseline">
                  <FormLabel className="w-28 text-md">Tiktok</FormLabel>
                  <FormControl className="w-full text-muted-foreground flex flex-col gap-2">
                    <div>
                      <Input
                        className="px-4 focus-visible:ring-offset-0 border-none bg-background/10  focus-visible:outline-none focus-visible:ring-0 text-md"
                        placeholder="Add Tiktok"
                        {...field}
                      />
                      <Separator />
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="space-y-2 flex gap-4 lg:gap-14 items-baseline">
              <div className="lg:w-28"></div>
              <div className="lg:w-48 w-full">
                <Button className="w-full text-md" type="submit">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditProfile;
