"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Edit } from "lucide-react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { Separator } from "@/components/ui/separator";
import ReportProblemPopup from "@/components/shared/popup/report-problem-popup";
import { ABeeZee } from "next/font/google";
import { useGetSupportQuery } from "@/redux/services/haveme/user";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const ReportAProblem = () => {
  const { isMobile } = useClientHardwareInfo();
  const [isOpen, setIsOpen] = useState(false);
  const { topics } = useGetSupportQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError, isFetching }) => {
      return {
        topics: data?.length > 0 ? data[0]?.topics : [],
        isLoading: isLoading,
        isError: isError,
        isFetching: isFetching,
      };
    },
  });

  return (
    <div className="w-full justify-center mx-auto ">
      <div className="flex justify-between  pt-8 mx-auto ml-4">
        <div className="mt-1">
          <img
            src="/assets/images/Signup/back.svg"
            alt="Back"
            className="mr-4"
          />
        </div>
        <div className="flex flex-col w-full">
          <div className={` text-2xl mb-4 ${fontItalic.className}`}>
            Report a Problem
          </div>
          <Separator className="bg-foreground/40" />
        </div>
        <div
          className="mt-1 mx-6 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Edit />
        </div>
      </div>

      <div className="text-muted-foreground text-xl mt-4 mb-2 w-11/12 mx-auto">
        {"Topic"}
      </div>
      <div>
        <Accordion type="single" collapsible className="lg:mx-6">
          {topics?.map(
            (
              topic: {
                title: string;
                content: { title: string; subContent: string[] }[];
              },
              index: number
            ) => (
              <AccordionItem key={index} value={`item-${index + 1}`}>
                <AccordionTrigger
                  className={` text-lg px-4 ${fontItalic.className}`}
                >
                  {topic.title}
                </AccordionTrigger>
                <AccordionContent className="px-4 bg-muted-foreground/10">
                  <Accordion type="single" collapsible>
                    {topic.content.map((item, subIndex) => (
                      <AccordionItem
                        key={subIndex}
                        value={`subitem-${subIndex + 1}`}
                      >
                        <AccordionTrigger className="text-base font-semibold lg:font-normal tracking-wide my-2">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          {item.subContent.map((subItem, subSubIndex) => (
                            <div key={subSubIndex} className="py-2">
                              {subItem}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            )
          )}
        </Accordion>
      </div>
      {isOpen && (
        <ReportProblemPopup openPopup={isOpen} setOpenPopup={setIsOpen} />
      )}
    </div>
  );
};

export default ReportAProblem;
