"use client";

import React, { useEffect, useState, useRef } from "react";
import PageHeader from "@/components/shared/page-header";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/shared/date-picker/select-dob";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import Logo from "@/components/shared/Logo";
// import SharedPopupsComponent from "@/components/shared/popup/doc-age-popup";
import BackArrow from "@/assets/images/Signup/back.svg";
import { differenceInYears } from "date-fns";

import { Manrope } from "next/font/google";
import {
  useUploadDocumentMutation,
  useUploadFileMutation,
} from "@/redux/services/haveme";
import { useCreateUserMutation } from "@/redux/services/haveme";
import { useUserOnboardingContext } from "@/context/UserOnboarding";

// TODO: Make this font definition dynamic
const fontItalic = Manrope({ subsets: ["latin"], weight: ["700"], display: "swap" });

const AgeConfirmation = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile] = useUploadFileMutation();
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();

  const [openPopup, setOpenPopup] = useState(false);
  const [openReviewPopup, setOpenReviewPopup] = useState(false);

  const { isMobile } = useClientHardwareInfo();
  const router = useRouter();
  const { user } = useUserOnboardingContext();

  const [confirmAgeTrigger] = useCreateUserMutation();

  const FormSchema = z.object({
    dob: z.date().refine(
      (dob) =>
        // Allow users under 18
        differenceInYears(new Date(), new Date(dob)) >= 0,
      {
        message: "Please enter your birthdate",
      }
    ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  let responseBody = {
    title: "passport",
    description: "ID proof",
    type: "passport",
    // docUrl: "",
    // status: 1,
    documentMediaId: "",
  };
  useEffect(() => {
    if (user?.hasConfirmedAge && !user.hasDocumentVerified) {
      setOpenPopup(true);
    }
  }, [user, openPopup]);

  const handleSubmit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files[0]) {
        if (!files[0].type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "Please select an Image",
          });
          return; // Exit the function if the file is not an image
        }
        const formData = new FormData();
        formData.append("file", files[0]);
        try {
          await uploadFile(formData)
            .unwrap()
            .then(async (response) => {
              if (response?.id) {
                let res = await uploadDocument({
                  title: "passport",
                  description: "ID proof",
                  type: "passport",
                  documentMediaId: response?.id,
                });
                setOpenPopup(false);
                setOpenReviewPopup(true);
              }
            });
        } catch (error) {
          console.error("Upload failed:", error);
          toast({
            variant: "destructive",
            description: "Something went wrong",
          });
        }
      }
    }
  };

  const submitReview = async () => {
    router.push("/home");
  };
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await confirmAgeTrigger(data).unwrap();
      // Mark onboarding cookie cleared to avoid middleware forcing /user-info
      if (typeof document !== 'undefined') {
        document.cookie = "onboarding=; Path=/; Max-Age=0; SameSite=None; Secure";
      }
      setOpenPopup(true);
      router.push("/home");
      toast({ variant: "success", description: "User on boarded successfully" });
    } catch (err) {
      console.log(err);
      toast({ variant: "destructive", description: "Something went wrong" });
    }
  };

  return (
    <div>
      {isMobile && (
        <PageHeader
          title="When is your Birthday?"
          description="Your birthdate won’t be shown publicly"
        />
      )}

      {/* <SharedPopupsComponent
        openPopup={openPopup}
        titleText="Upload your ID proof"
        btnText="Upload Your ID"
        titleDescription="You can upload forms of identification like passport, driver license or ID card. Result can take 2 days"
        setOpenPopup={setOpenPopup}
        imageUrl="\assets\images\Home\upload.svg"
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        fileInputRef={fileInputRef}
      />

      <SharedPopupsComponent
        openPopup={openReviewPopup}
        titleText="We are reviewing your ID"
        btnText="Continue"
        titleDescription="You can upload forms of identification like passport, driver license or ID card. Result can take 2 days"
        setOpenPopup={setOpenReviewPopup}
        imageUrl="\assets\images\pending-verification\pending-verification.svg"
        handleSubmit={submitReview}
        exitText="Logout"
      /> */}
      <div className="lg:flex">
        {/* {!isMobile && (
          <div className="mt-4">
            <BackArrow
              className="fill-foreground mr-4 cursor-pointer"
              onClick={() => {
                router.back();
              }}
            />
          </div>
        )} */}

        <Form {...form}>
          <div className="lg:border-2 lg:border-solid lg:rounded-xl lg:border-muted-foreground/30 lg:my-0 lg:mr-auto lg:ml-auto lg:min-w-fit lg:w-3/12 lg:p-8">
            {!isMobile && (
              <>
                <div className="mb-14">
                  <Logo />
                </div>
                <h1 className={` text-3xl text-center ${fontItalic.className}`}>
                  When is your Birthday?
                </h1>
                <p className="text-muted-foreground mt-2 text-center">
                  Your birthdate won’t be shown publicly
                </p>
              </>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12">
              <div className="flex flex-col gap-24">
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="w-full ">
                            <DatePicker />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <DatePicker /> */}
                </div>

                <div>
                  <Button className="block w-full">Next</Button>
                </div>
              </div>
            </form>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AgeConfirmation;
