"use client";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ABeeZee } from "next/font/google";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "./ui/drawer";
import {
  ArrowLeftIcon,
  SquareDotIcon,
  BellOff,
  PinIcon,
  Ban,
  Info,
} from "lucide-react";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useParams } from "next/navigation";
import {
  useGetUserDetailsByUserNameQuery,
  useGetUserProfilePhotoQuery,
} from "@/redux/services/haveme/user";
import { baseServerUrl, getInitials } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSendUserReportMutation } from "@/redux/services/haveme/report";

interface RadioOption {
  value: string;
  text: string;
}

const initialRadioOptions: RadioOption[] = [
  { value: "violence", text: "Violence" },
  { value: "regulated-goods", text: "Regulated goods and activities" },
  { value: "hate-harassment", text: "Hate or harassment" },
  { value: "fraud", text: "Fraud" },
  { value: "pretending", text: "Pretending to be someone else" },
  { value: "ip-violation", text: "Intellectual property violation" },
  { value: "spam", text: "Spam" },
  { value: "other", text: "Other" },
];

const FormSchemaReportUser = z.object({
  problemType: z.enum([
    "violence",
    "regulated-goods",
    "hate-harassment",
    "fraud",
    "pretending",
    "ip-violation",
    "spam",
    "other",
  ]),
});
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

export default function MoreProfileSettings() {
  const userName = useParams();
  const [sendReport] = useSendUserReportMutation();

  const { userDetailsData, isUserDetailsLoading } =
    useGetUserDetailsByUserNameQuery(
      { userName: userName.userid as string },
      {
        selectFromResult: ({ data, isLoading }) => {
          return {
            userDetailsData: data?.data,
            isUserDetailsLoading: isLoading,
          };
        },
      }
    );

  const { data: userPhotoData } = useGetUserProfilePhotoQuery(
    userDetailsData?.photoId,
    {
      skip: !userDetailsData?.photoId,
    }
  );

  const form = useForm<z.infer<typeof FormSchemaReportUser>>({
    resolver: zodResolver(FormSchemaReportUser),
  });

  function onSubmit(data: z.infer<typeof FormSchemaReportUser>) {
    try {
      const { problemType } = data;
      const reportData = {
        actionToUser: userDetailsData?._id,
        reason: problemType,
        actionType: "report_user",
      };
      sendReport(reportData);
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  }

  return (
    <div className="flex flex-col">
      <Separator />

      <div className="flex items-center p-4">
        <Avatar>
          <AvatarImage
            alt={`${userDetailsData?.userName}`}
            src={`${baseServerUrl}/${userPhotoData?.path}`}
            // src={"/assets/images/Home/small-profile-img.svg"}
          />
          <AvatarFallback>
            {getInitials(userDetailsData?.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h2 className="text-lg font-semibold">{userDetailsData?.fullName}</h2>
          <p className="text-sm ">{`@${userDetailsData?.userName}`}</p>
        </div>
      </div>
      <Separator />

      <div className="flex items-center justify-between px-4 py-2 my-4">
        <div className="flex items-center space-x-2">
          <BellOff />
          <span>Mute Notifications</span>
        </div>
        <Switch id="mute-notifications" />
      </div>
      <Button
        variant={"link"}
        className="w-full text-destructive flex justify-start gap-2"
      >
        {" "}
        <Ban /> Block
      </Button>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant={"link"}
            className="w-full text-destructive flex justify-start gap-2"
          >
            {" "}
            <Info />
            Report
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Report</DrawerTitle>
          </DrawerHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col px-4 py-2 space-y-2"
            >
              <FormField
                control={form.control}
                name="problemType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 mb-2"
                      >
                        {initialRadioOptions?.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-baseline gap-4  border-secondary  border-b-2 p-1 "
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel
                              className={`text-lg font-light ${fontItalic.className}`}
                            >
                              {option.text}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DrawerFooter>
                <DrawerClose>
                  <div className="my-4 flex w-full justify-center">
                    <Button className="w-full h-14" type="submit">
                      Submit
                    </Button>
                  </div>{" "}
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
