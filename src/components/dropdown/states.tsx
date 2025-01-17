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
import { cn, lowerCase, sentenceCase } from "@/lib/utils";
import states from "@/data/states.json";
import { type StateProps } from "@/lib/countryStateType";
import { useFormContext } from "react-hook-form";

const StateDropdown = () => {
  const form = useFormContext();

  const [openStateDropdown, setOpenStateDropdown] = useState(false);
  const SD = states as StateProps[];
  const S = SD.filter(
    (state) => state.country_name === form.getValues("country")
  );

  return (
    <Popover open={openStateDropdown} onOpenChange={setOpenStateDropdown}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={openStateDropdown}
          className="rounded-full flex justify-between"
          disabled={!form.getValues("country") || S.length === 0}
        >
          {form.getValues("state") ? (
            <div className="flex items-end gap-2">
              <span>
                {
                  S.find(
                    (state) =>
                      lowerCase(state.name) ===
                      form.getValues("state").toLowerCase()
                  )?.name
                }
              </span>
            </div>
          ) : (
            <span>Select State...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] rounded-[6px] border border-[#27272a] p-0">
        <Command>
          <CommandInput placeholder="Search state..." />
          <CommandList>
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[300px] w-full">
                {S.map((state) => (
                  <CommandItem
                    key={state.id}
                    value={state.name}
                    onSelect={(currentValue) => {
                      form.setValue(
                        "state",
                        lowerCase(currentValue) === lowerCase(state.name)
                          ? currentValue
                          : "",
                        { shouldValidate: true }
                      );
                      setOpenStateDropdown(false);
                    }}
                    className="flex cursor-pointer items-center justify-between text-xs hover:!bg-[#27272a] hover:!text-white"
                  >
                    <div className="flex items-end gap-2">
                      <span className="">{state.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        form.getValues("state") === lowerCase(state.name)
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

export default StateDropdown;
