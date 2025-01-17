"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "../../ui/calendar-dropdown";
import { useFormContext } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
interface Props {
  initialDate?: Date;
}

export function DatePicker({ initialDate }: Props) {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [stringDate, setStringDate] = useState(
    initialDate ? format(initialDate, "PPP") : ""
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useFormContext();

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate);
    setStringDate(format(selectedDate, "PPP"));
    setErrorMessage("");
    form.setValue("dob", selectedDate, { shouldValidate: true });
  };

  return (
    <div>
      <Popover key={date?.getDate()}>
        <div className="relative">
          <Input
            type="string"
            className="h-[62px]"
            value={stringDate}
            onFocus={() => {
              if (date) setStringDate(format(date, "MM/dd/yyyy"));
            }}
            onChange={(e) => {
              if (date) setStringDate("");
              setStringDate(e.target.value);
            }}
            onBlur={(e) => {
              let parsedDate = new Date(e.target.value);
              if (parsedDate.toString() === "Invalid Date") {
                setErrorMessage("Invalid Date");
              } else {
                setErrorMessage("");
                setDate(parsedDate);
                setStringDate(format(parsedDate, "PPP"));
              }
            }}
          />
          {errorMessage !== "" && (
            <div className="absolute bottom-[-1.75rem] left-0 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "font-normal absolute right-0 translate-y-[-50%] top-[50%] rounded-l-none lg:p-6 h-[62px]",
                !date && "text-muted-foreground"
              )}
            >
              <img src="/assets/images/Home/calendar.svg" alt="calendar" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent align="end" className="w-auto p-0">
          <Calendar
            mode="single"
            captionLayout="dropdown-buttons"
            selected={date}
            defaultMonth={date}
            onSelect={(selectedDate) => {
              if (!selectedDate) return;
              handleDateSelect(selectedDate);
            }}
            fromYear={1960}
            toYear={2030}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
