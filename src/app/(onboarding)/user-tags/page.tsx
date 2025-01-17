"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/shared/page-header";
import ChippyCheckbox from "@/components/shared/chippy-checkbox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import Logo from "@/components/shared/Logo";
import { Label } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import BackArrow from "@/assets/images/Signup/back.svg";
import { ABeeZee } from "next/font/google";
import { useToast } from "@/components/ui/use-toast";
import {
  useGetInterestsQuery,
  useUpdateInterestsMutation,
} from "@/redux/services/haveme";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const UserTags = () => {
  const { toast } = useToast();
  const { isMobile } = useClientHardwareInfo();
  const router = useRouter();
  const [updateInterestsTrigger] = useUpdateInterestsMutation();
  const { data: interestsData, isLoading } = useGetInterestsQuery();

  const [checkboxes, setCheckboxes] = useState([]);

  useEffect(() => {
    if (interestsData) {
      const initialCheckboxes = interestsData.data.map((interest) => ({
        id: interest._id,
        value: interest._id,
        label: interest.title,
        checked: false,
      }));
      setCheckboxes(initialCheckboxes);
    }
  }, [interestsData]);

  const handleCheckboxChange = (id: string) => {
    setCheckboxes((prevCheckboxes) =>
      prevCheckboxes.map((checkbox) =>
        checkbox.id === id
          ? { ...checkbox, checked: !checkbox.checked }
          : checkbox
      )
    );
  };

  const updateTags = () => {
    const interests = checkboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
    updateInterestsTrigger({ interestIds: interests })
      .unwrap()
      .then((res) => {
        toast({
          variant: "success",
          description: "Interests added successfully!",
        });
        router.push("/age-confirmation");
      })
      .catch((err) => {
        console.log("error", err);
        toast({
          variant: "destructive",
          description: "Something went wrong",
        });
      });
  };
  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex flex-col flex-grow">
        {isMobile && (
          <PageHeader
            title="What describes you best?"
            description="Select the boxes that match you best"
          />
        )}
        <div className="lg:flex lg:w-4/12 lg:self-center">
          {/* {!isMobile && (
            <div>
              <BackArrow
                className="fill-foreground cursor-pointer mt-4 mr-4"
                onClick={() => {
                  router.back();
                }}
              />
            </div>
          )} */}

          <div className="lg:border-2 lg:border-solid lg:rounded-xl lg:border-muted-foreground/30 lg:my-0 lg:mr-auto lg:ml-auto lg:p-[3.5rem]">
            {!isMobile && (
              <>
                <Logo />
                <Label className={`text-3xl mt-14 ${fontItalic.className}`}>
                  What describes you best?
                </Label>
              </>
            )}

            {/* <div className="mt-7 flex flex-wrap  gap-3 max-h-96 overflow-y-auto"> */}
            <ScrollArea className="">
              <div className="mt-7 flex flex-wrap lg:max-h-96 max-h-[70svh]  gap-3 justify-center ">
                {checkboxes.map((checkbox) => (
                  <ChippyCheckbox
                    key={checkbox.id}
                    id={checkbox.id}
                    value={checkbox.value}
                    label={checkbox.label}
                    checked={checkbox.checked}
                    onChange={() => handleCheckboxChange(checkbox.id)}
                  />
                ))}
              </div>
            </ScrollArea>

            <Button
              className="block w-full my-5"
              onClick={() => updateTags()}
              // onClick={() => router.push("/age-confirmation")}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTags;
