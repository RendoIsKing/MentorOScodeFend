"use client";
import React, { useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ABeeZee } from "next/font/google";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSendUserQueryMutation } from "@/redux/services/haveme/report";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface ReportProblemPopupProps {
  openPopup: boolean;
  setOpenPopup: (a: boolean) => void;
}

const FormSchema = z.object({
  reportQuery: z
    .string({
      required_error: "Required",
    })
    .min(20),
});

const ReportProblemPopup = ({
  openPopup,
  setOpenPopup,
}: ReportProblemPopupProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setOpenPopup(false);
      }
    };

    if (openPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPopup, setOpenPopup]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reportQuery: "",
    },
  });
  const [sendQuery] = useSendUserQueryMutation();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const { reportQuery } = data;
      const reportData = {
        query: reportQuery,
      };
      sendQuery(reportData);
      setOpenPopup(false);
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  }

  return (
    <AlertDialog open={openPopup}>
      <AlertDialogContent
        className="p-0 w-11/12 lg:w-1/2 max-w-md border-0 "
        ref={dialogRef}
      >
        <AlertDialogHeader>
          <div className="border-b flex justify-between py-2 px-4 items-center border-muted-foreground/40">
            <AlertDialogTitle className={`${fontItalic.className}`}>
              Report a problem
            </AlertDialogTitle>
            <div onClick={() => setOpenPopup(false)}>
              <X className="text-muted-foreground/40" />
            </div>
          </div>
        </AlertDialogHeader>

        <div className="px-5 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
              <FormField
                control={form.control}
                name="reportQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div>
                        <Textarea
                          {...field}
                          placeholder="Please include as much info as possible"
                          className="h-36 border-muted-foreground/40"
                        />
                        <FormMessage />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <p className={`text-sm font-light mt-2 ${fontItalic.className}`}>
                Your username and browser information will be automatically
                included in your report
              </p>
              <div className="flex justify-between mt-5">
                <Button className="w-2/5 ">Send Report</Button>
                {/* <Button className="w-2/5 bg-muted-foreground">Add a file</Button> */}
              </div>
            </form>
          </Form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReportProblemPopup;
