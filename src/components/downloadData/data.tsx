"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRound, Clock4, Bolt } from "lucide-react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import InnerPageHeader from "../shared/inner-page-header";
import { ABeeZee } from "next/font/google";
import { Separator } from "../ui/separator";
import {
  useLazyDownloadUserDataQuery,
  useLazyGetUserDataQuery,
  useLazyProcessUserDataQuery,
} from "@/redux/services/haveme/user";
import { toast } from "../ui/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const HaveMeData: React.FC = () => {
  const { isMobile } = useClientHardwareInfo();
  const [selectedDataFormat, setSelectedDataFormat] = useState("text");
  const [requestUserDataTrigger] = useLazyProcessUserDataQuery();
  const [downloadUserDataTrigger] = useLazyDownloadUserDataQuery();
  const [getUserDataTrigger] = useLazyGetUserDataQuery();
  const [activeTab, setActiveTab] = useState("requestData");
  const [userData, setUserData] = useState({
    userDataText: null,
    userDataJson: null,
  });

  const requestUserData = () => {
    const requestObj = { fileFormat: selectedDataFormat };
    requestUserDataTrigger(requestObj)
      .unwrap()
      .then(() => {
        toast({
          variant: "success",
          description: "Your request has been submitted successfully.",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Could not process request. Something went wrong",
        });
      });
  };

  const downloadData = (data, type) => {
    const fileFormatObj = {
      fileFormat: data?.fileFormat,
    };
    downloadUserDataTrigger(fileFormatObj)
      .unwrap()
      .then((res) => {
        toast({
          variant: "success",
          description:
            "Your request has been submitted successfully. You will receive a mail.",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Could not process request. Something went wrong",
        });
      });
  };

  useEffect(() => {
    if (activeTab === "downloadData") {
      getUserDataTrigger()
        .unwrap()
        .then((res) => {
          setUserData(res);
        })
        .catch((err) => {
          console.log("error : " + err);
        });
    }
  }, [activeTab, getUserDataTrigger]);

  return (
    <>
      <InnerPageHeader title="Download HaveMe Data" showBackButton={true} />
      <div className="">
        <div className="bg-muted/90 p-2 lg:m-8 lg:rounded-xl">
          <Tabs defaultValue={activeTab}>
            <TabsList className="grid w-full grid-cols-2  bg-transparent border-secondary  ">
              <div className=" border-secondary ">
                <TabsTrigger
                  onClick={() => setActiveTab("requestData")}
                  value="requestData"
                  className="w-full lg:text-xl data-[state=active]:text-primary data-[state=active]:border-b border-primary data-[state=active]:bg-transparent data-[state=active]:italic sm:py-3"
                >
                  Request Data
                </TabsTrigger>
              </div>
              <div className=" border-b border-secondary">
                <TabsTrigger
                  onClick={() => setActiveTab("downloadData")}
                  value="downloadData"
                  className="w-full lg:text-xl data-[state=active]:text-primary data-[state=active]:border-b border-primary data-[state=active]:bg-transparent data-[state=active]:italic sm:py-3"
                >
                  Download Data
                </TabsTrigger>
              </div>
            </TabsList>

            <TabsContent value="requestData">
              <div className="lg:p-4">
                <div>
                  <div className="text-md mt-6 sm:px-5">
                    Your request may take a few days to process. After your file
                    is ready it will be available to download for up to 4 days.
                    It will expire if you request data again
                  </div>
                  <div className="mt-6 text-muted-foreground sm:px-4">
                    Data may Include
                  </div>
                </div>
                <div className="sm:flex sm:justify-around sm:border-b sm:border-secondary">
                  <div className="mt-3 mb-3 flex border-b border-secondary sm:border-0 sm:px-3 sm:mt-3 sm:mb-2">
                    <div className="mr-4">
                      <UserRound />
                    </div>
                    <div>
                      <h4
                        className={`mb-1 font-medium ${fontItalic.className}`}
                      >
                        Your profile
                      </h4>
                      <div className="text-sm mb-3 text-muted-foreground">
                        Includes your username, profile photo, bio, and contact
                        info (such as your email address and phone number)
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 mb-5 flex border-b border-secondary sm:border-0 sm:px-3 sm:mt-3 sm:mb-2">
                    <div className="mr-4">
                      <Clock4 />
                    </div>
                    <div>
                      <h4
                        className={`mb-1 font-medium ${fontItalic.className}`}
                      >
                        Your activity
                      </h4>
                      <div className="text-sm mb-3 text-muted-foreground">
                        Includes your video history, comment history, chat
                        history, virtual items purchase history, like history,
                        Favourites history, and shopping activity
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 mb-5 flex border-b border-secondary sm:border-0 sm:px-3 sm:mt-3 sm:mb-2">
                    <div className="mr-4">
                      <Bolt />
                    </div>
                    <div>
                      <h4
                        className={`mb-1 font-medium ${fontItalic.className}`}
                      >
                        Your app settings
                      </h4>{" "}
                      <div className="text-sm mb-4 text-muted-foreground">
                        Includes your privacy settings, notification settings,
                        and language settings
                      </div>
                    </div>
                  </div>
                </div>

                <h5 className="mb-2 text-muted-foreground sm:mt-10 sm:ms-4">
                  Select File Format
                </h5>

                <RadioGroup
                  defaultValue={selectedDataFormat}
                  className="sm:flex"
                >
                  <div className="flex items-center space-x-2 sm:basis-2/6">
                    <RadioGroupItem
                      value="text"
                      id="r1"
                      className="mx-3"
                      onClick={() => setSelectedDataFormat("text")}
                    />
                    <div className="">
                      <Label
                        htmlFor="r1"
                        className={`text-md ${fontItalic.className}`}
                      >
                        TXT
                      </Label>
                      <br />
                      <Label
                        htmlFor="r1"
                        className="font-normal text-muted-foreground"
                      >
                        Easy-to-read text file
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="json"
                      id="r2"
                      className="mx-3"
                      onClick={() => setSelectedDataFormat("json")}
                    />
                    <div>
                      <Label
                        htmlFor="r2"
                        className={`text-md ${fontItalic.className}`}
                      >
                        JSON
                      </Label>
                      <br />
                      <Label
                        htmlFor="r2"
                        className="font-normal text-muted-foreground "
                      >
                        Machine readable file
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
                <div className="flex justify-center mt-6 sm:flex sm:justify-end sm:me-5 sm:mt-12">
                  <Button
                    className="w-full h-14 sm:w-72 mb-10"
                    onClick={requestUserData}
                  >
                    Request Data
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="downloadData">
              <>
                {isMobile ? (
                  <div>
                    <div className={`mt-10 text-2xl  ${fontItalic.className}`}>
                      Download your data
                    </div>
                    <div className="mt-3 mb-5">
                      {` Your Information includes things you've shared, your
                      activity and things we collect.`}
                    </div>
                    <div className="mb-8">
                      First, choose the information that you want. Then, when
                      your files are ready, we can transfer them to another
                      service or you can download them to your device.
                    </div>
                    {userData.userDataText && (
                      <div>
                        <Button
                          disabled={userData?.userDataText?.isExpired}
                          className={cn("w-full bg-primary h-14", {
                            "bg-secondary-muted":
                              userData.userDataText?.isExpired,
                          })}
                          onClick={() =>
                            downloadData(
                              userData.userDataText,
                              "application/txt"
                            )
                          }
                        >
                          {!userData.userDataText?.isExpired
                            ? "Download Text"
                            : "Expired"}
                        </Button>
                        <p
                          className={`text-xs text-muted-foreground my-4 text-center ${fontItalic.className}`}
                        >
                          {`Download before ${format(
                            userData?.userDataText?.downloadBefore,
                            "PPP"
                          )}, it will be expired`}
                        </p>
                      </div>
                    )}
                    {userData.userDataJson && (
                      <div>
                        <Button
                          disabled={userData?.userDataJson?.isExpired}
                          className={cn("w-full bg-primary h-14", {
                            "bg-secondary-muted":
                              userData.userDataJson?.isExpired,
                          })}
                          onClick={() =>
                            downloadData(
                              userData.userDataJson,
                              "application/json"
                            )
                          }
                        >
                          {!userData?.userDataJson?.isExpired
                            ? "Download JSON"
                            : "Expired"}
                        </Button>
                        <p
                          className={`text-xs text-muted-foreground my-4 text-center ${fontItalic.className}`}
                        >
                          {`Download before ${format(
                            userData?.userDataJson?.downloadBefore,
                            "PPP"
                          )}, it will be expired`}
                        </p>
                      </div>
                    )}
                  </div>
                ) : userData.userDataJson || userData.userDataText ? (
                  <div className="p-4">
                    {userData.userDataJson && (
                      <div className="flex justify-between items-center pb-5">
                        <div className="w-3/5">
                          <h1 className={`text-xl ${fontItalic.className}`}>
                            File.json
                          </h1>
                          <p className="text-sm">
                            {`This data includes thing that you've shared, your
                            activity and things that we collect.`}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {`Requested date ${format(
                              userData?.userDataJson?.requested_date,
                              "PPP"
                            )}`}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-col items-end justify-end w-1/3">
                          <Button
                            disabled={userData?.userDataJson?.isExpired}
                            className={cn("w-40", {
                              "bg-secondary-muted":
                                userData.userDataJson?.isExpired,
                            })}
                            onClick={() =>
                              downloadData(
                                userData.userDataJson,
                                "application/json"
                              )
                            }
                          >
                            {!userData?.userDataJson?.isExpired
                              ? "Download"
                              : "Expired"}
                          </Button>
                          <p
                            className={`text-xs text-muted-foreground mt-4 ${fontItalic.className}`}
                          >
                            {`Download before ${format(
                              userData?.userDataJson?.downloadBefore,
                              "PPP"
                            )}, it will be expired`}
                          </p>
                        </div>
                      </div>
                    )}
                    {userData.userDataText && (
                      <>
                        <Separator className="bg-muted-foreground/20" />
                        <div className="flex justify-between items-center pb-5 mt-5">
                          <div className="w-3/5">
                            <h1 className={`text-xl ${fontItalic.className}`}>
                              File.txt
                            </h1>
                            <p className="text-sm">
                              {`This data includes thing that you've shared, your
                            activity and things that we collect.`}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {`Requested date ${format(
                                userData?.userDataText?.requested_date,
                                "PPP"
                              )}`}
                            </p>
                          </div>
                          <div className="mt-3 flex w-1/3 flex-col items-end">
                            <Button
                              disabled={userData.userDataText?.isExpired}
                              className={cn("w-40", {
                                "bg-secondary-muted":
                                  userData.userDataText?.isExpired,
                              })}
                              onClick={() =>
                                downloadData(
                                  userData.userDataText,
                                  "application/txt"
                                )
                              }
                            >
                              {!userData.userDataText?.isExpired
                                ? "Download"
                                : "Expired"}
                            </Button>
                            <p
                              className={`text-xs text-muted-foreground mt-4 ${fontItalic.className}`}
                            >
                              {`Download before ${format(
                                userData?.userDataText?.downloadBefore,
                                "PPP"
                              )}, it will be expired`}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    <Separator className="bg-muted-foreground/20" />
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-center text-muted-foreground text-lg">
                      No data available for download. Please request your data
                      first.
                    </p>
                  </div>
                )}
              </>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default HaveMeData;
