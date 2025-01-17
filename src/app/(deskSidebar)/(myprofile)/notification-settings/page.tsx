"use client";
import InnerPageHeader from "@/components/shared/inner-page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useState } from "react";

const NotificationSettings: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedOptionGroup1, setSelectedOptionGroup1] = useState("");

  const handleOptionChangeGroup1 = (value: string) => {
    setSelectedOptionGroup1(value);
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  return (
    <div>
      <InnerPageHeader showBackButton={true} title="Notification Settings" />
      <hr />
      <div className="p-4">
        <div className="text-sm text-muted-foreground">
          <Label>
            Personalized post and LIVE notifications are based, on viewing
            frequency and other data.
          </Label>
        </div>
      </div>
      <div className=" p-4">
        <Label>{`Blanc’s Posts`}</Label>
      </div>
      <div className="bg-secondary/40">
        <RadioGroup
          defaultValue="txt"
          value={selectedOptionGroup1}
          onValueChange={handleOptionChangeGroup1}
        >
          <div className="flex items-center space-x-2 mt-3">
            <RadioGroupItem value="option1" id="r1" className="mx-3" />
            <div>
              <Label htmlFor="r1">All</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="r2" className="mx-3" />
            <div>
              <Label htmlFor="r2">Personalized</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="option3" id="r3" className="mx-3" />
            <div>
              <Label htmlFor="r3">None</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="mt-3 p-4">
        <Label>{`Blanc’s LIVE Videos`}</Label>
      </div>
      <div className="bg-secondary/40">
        <RadioGroup
          defaultValue="txt"
          value={selectedOption}
          onValueChange={handleOptionChange}
        >
          <div className="flex items-center space-x-2 mt-3">
            <RadioGroupItem value="option4" id="r4" className="mx-3" />
            <div>
              <Label htmlFor="r4">All</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option5" id="r5" className="mx-3" />
            <div>
              <Label htmlFor="r5">Personalized</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="option6" id="r6" className="mx-3" />
            <div>
              <Label htmlFor="r6">None</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
      <div className="mt-3 p-4">
        <Button className="w-full bg-primary h-14">Save</Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
