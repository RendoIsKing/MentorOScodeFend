import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Info, X } from "lucide-react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { ABeeZee } from "next/font/google";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "../ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useSendUserReportMutation } from "@/redux/services/haveme/report";

interface IReportProblemAlertProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface RadioOption {
  value: string;
  text: string;
}

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

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

const ReportProblemAlert: React.FC<IReportProblemAlertProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const form = useForm<z.infer<typeof FormSchemaReportUser>>({
    resolver: zodResolver(FormSchemaReportUser),
  });
  const [sendReport] = useSendUserReportMutation();

  function onSubmit(data: z.infer<typeof FormSchemaReportUser>) {
    try {
      const { problemType } = data;
      const reportData = {
        actionToUser: userId,
        reason: problemType,
        actionType: "report_user",
      };
      sendReport(reportData);
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  }
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="border-0 lg:w-[26rem] lg:h-auto p-4">
        <AlertDialogHeader className="relative">
          <div className="flex justify-between text-center align-middle w-full border-1 border-b border-secondary py-2">
            <AlertDialogTitle
              className={`w-full text-center lg:text-2xl lg:pb-2 ${fontItalic.className}`}
            >
              Report
            </AlertDialogTitle>
            <X
              className="lg:size-8 text-secondary-muted cursor-pointer flex absolute right-2 top-2"
              onClick={onClose}
            />
          </div>
        </AlertDialogHeader>

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
            <div className="my-4 flex w-full justify-center">
              <Button className="w-full h-14" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReportProblemAlert;
