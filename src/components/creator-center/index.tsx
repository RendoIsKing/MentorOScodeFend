"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Statistics from "./statistics";
import Earnings from "./earnings";
import InnerPageHeader from "../shared/inner-page-header";
import { Separator } from "../ui/separator";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

function CreatorCenter() {
  const { isMobile } = useClientHardwareInfo();
  return (
    <>
      <InnerPageHeader showBackButton={!!isMobile} title="Creator Center" />
      <Separator />
      <Tabs defaultValue="statistics" className="w-full mx-auto ">
        <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-secondary lg:h-20">
          <TabsTrigger
            value="statistics"
            className="data-[state=active]:text-primary data-[state=active]:border-b border-primary italic data-[state=active]:bg-transparent lg:text-xl lg:font-normal lg:h-20"
          >
            Statistics
          </TabsTrigger>
          <TabsTrigger
            value="earnings"
            className="data-[state=active]:text-primary data-[state=active]:border-b border-primary italic data-[state=active]:bg-transparent lg:text-xl lg:font-normal lg:h-20"
          >
            Earnings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="statistics">
          <Statistics />
        </TabsContent>
        <TabsContent value="earnings">
          <Earnings />
        </TabsContent>
      </Tabs>
    </>
  );
}

export default CreatorCenter;
