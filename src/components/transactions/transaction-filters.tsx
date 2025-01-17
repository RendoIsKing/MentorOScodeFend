import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";

interface Option {
  label: string;
  value: string;
}

interface IDropdownProps {
  options: Option[];
  initialValue: string;
  onChange: (value: string) => void;
}
const TransactionFilterSelect: React.FC<IDropdownProps> = ({
  options,
  initialValue,
  onChange,
}: IDropdownProps) => {
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const handleSelectChange = (newValue: string) => {
    setSelectedValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="">
          {options.find((option) => option.value === selectedValue)?.label}{" "}
          <ChevronDown className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={handleSelectChange}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TransactionFilterSelect;
