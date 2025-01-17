"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Edit } from "lucide-react";
import InnerPageHeader from "@/components/shared/inner-page-header";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import accordionData from "./accordionData.json";
import { ABeeZee } from "next/font/google";
import { useGetSupportQuery } from "@/redux/services/haveme/user";
import ReportProblemPopup from "@/components/shared/popup/report-problem-popup";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const TransactionProblems = () => {
  const { isMobile } = useClientHardwareInfo();
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
  const [openReport, setOpenReport] = useState(false);

  return (
    <div className="w-full justify-center mx-auto ">
      <div className="flex items-center">
        <div className="w-full">
          <InnerPageHeader
            showBackButton={true}
            title={isMobile ? "Report a Problem" : "Help & Supports"}
            // icon={<Edit />}
          />
        </div>
        <div
          className="mt-1 mx-6 cursor-pointer"
          onClick={() => setOpenReport(true)}
        >
          <Edit />
        </div>
      </div>
      <div className="text-muted-foreground text-xl mt-4 mb-2 mx-4 lg:mx-10 lg:mt-6">
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
      {openReport && (
        <ReportProblemPopup
          openPopup={openReport}
          setOpenPopup={setOpenReport}
        />
      )}
    </div>
  );
};

export default TransactionProblems;
