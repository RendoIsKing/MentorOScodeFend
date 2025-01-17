"use client";
import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, lowerCase } from "@/lib/utils";
import { type CountryProps } from "@/lib/countryStateType";
import { useFormContext } from "react-hook-form";
import countries from "@/data/countries.json";

interface CountryDropdownProps {
  disabled?: boolean;
}

const CountryDropdown = ({ disabled }: CountryDropdownProps) => {
  const [openCountryDropdown, setOpenCountryDropdown] = useState(false);
  const C = countries as CountryProps[];

  const form = useFormContext();

  return (
    <Popover open={openCountryDropdown} onOpenChange={setOpenCountryDropdown}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={openCountryDropdown}
          className="rounded-full flex justify-between"
          disabled={disabled}
        >
          <span>
            {form.getValues("country")?.length > 0 ? (
              <div className="flex items-end gap-2">
                <span>
                  {
                    countries.find(
                      (country) =>
                        lowerCase(country.name) ===
                        form.getValues("country").toLowerCase()
                    )?.emoji
                  }
                </span>
                <span>
                  {
                    countries.find(
                      (country) =>
                        lowerCase(country.name) ===
                        form.getValues("country").toLowerCase()
                    )?.name
                  }
                </span>
              </div>
            ) : (
              <span>Select Country...</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] rounded-[6px] border border-[#27272a] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[300px] w-full">
                {C?.map((country) => (
                  <CommandItem
                    key={country?.id}
                    value={country?.name}
                    onSelect={(currentValue) => {
                      form.setValue(
                        "country",
                        lowerCase(currentValue) === lowerCase(country.name)
                          ? currentValue
                          : "",
                        { shouldValidate: true }
                      );

                      setOpenCountryDropdown(false);
                    }}
                    className="flex cursor-pointer items-center justify-between text-xs hover:!bg-[#27272a] hover:!text-white"
                  >
                    <div className="flex items-end gap-2">
                      <span>{country.emoji}</span>
                      <span className="">{country.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        form.getValues("country") === lowerCase(country.name)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryDropdown;
