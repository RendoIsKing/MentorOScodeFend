"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Calendar } from "./calendar";

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1; // Month is zero-based, so add 1
const day = currentDate.getDate();
export const formattedDate = `${year}, ${month}, ${day}`;

export function DatePickerWithRange({ date, setDate }) {
  return (
    <div className={cn("grid gap-2")}>
      <div className="flex justify-center lg:text-primary">
        <Popover>
          <img
            src="/assets/images/Creator-center/calendar.svg"
            className="mr-2 h-4 w-4 self-center"
            alt="calender"
          />

          <PopoverTrigger asChild>
            <div
              id="date"
              // variant={"outline"}
              className={cn(
                "justify-start text-left font-normal self-center lg:mr-3",
                !date && "text-muted-foreground"
              )}
            >
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
          <ChevronDown className="mr-2 h-4 w-4 self-center" />
        </Popover>
      </div>
    </div>
  );
}
