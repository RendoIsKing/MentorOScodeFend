import React, { useEffect } from "react";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type dropDownOptionType = {
  value: string;
  label: string;
};

export const dropdownOptions: dropDownOptionType[] = [
  { value: "1", label: "Yesterday" },
  { value: "0", label: "Today" },
  { value: "7", label: "This Week" },
  { value: "14", label: "14 Days" },
  { value: "30", label: "30 Days" },
  { value: "90", label: "90 Days" },
];

interface IStatsRangeOptionProps {
  duration: string;
  setDuration: (duration: string) => void;
}
const StatsRangeOption: React.FC<IStatsRangeOptionProps> = ({
  duration,
  setDuration,
}) => {
  const [buttonText, setButtonText] = React.useState("Yesterday");
  const [range, setRange] = React.useState("");

  useEffect(() => {
    const selectedOption = dropdownOptions.find(
      (option) => option.value === duration
    );
    if (selectedOption) {
      setButtonText(selectedOption.label);
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - parseInt(duration));
      const endDate = new Date(today);
      const formattedStartDate = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const formattedEndDate = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      setRange(`${formattedStartDate} - ${formattedEndDate}`);
    }
  }, [duration]);
  const { isMobile } = useClientHardwareInfo();
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-primary h-8 lg:my-2 lg:mx-2">
            {buttonText} <ChevronDown className="ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border-0 lg:w-36">
          {dropdownOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setDuration(option.value)}
              className="pl-3 py-2 cursor-pointer"
            >
              {duration === option.value ? (
                <span className="text-primary">{option.label}</span>
              ) : (
                option.label
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {!isMobile && <span className="mx-2">{range}</span>}
    </div>
  );
};

export default StatsRangeOption;
