"use client";

import React, { ChangeEvent, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ISearchQuery } from "@/contracts/requests/ISearchQuery";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDebounce } from "@/hooks/use-debounce";

const SearchField = () => {
  const router = useRouter();

  const [query, setQuery] = useState<ISearchQuery>({
    searchTerm: "",
    type: "",
    filter: "",
  });

  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 1000);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const resetFiled = () => {
    setInputValue("");
  };

  useEffect(() => {
    setQuery({ ...query, searchTerm: debouncedValue });
    router.push(`?q=${debouncedValue}&type=posts`, {
      scroll: false,
    });
  }, [debouncedValue, router]);

  return (
    <div className="relative flex justify-between">
      <Input
        type="text"
        onChange={handleChange}
        value={inputValue}
        className="px-14 text-muted-foreground bg-muted border border-muted h-12 w-full rounded-3xl text-sm"
        placeholder="Search"
      />
      <Image
        src="/assets/images/search/search-normal.svg"
        alt="search-icon"
        className="search-icon absolute top-1/2 transform -translate-y-1/2 text-primary left-6"
        width={20}
        height={20}
      />

      {inputValue && (
        <Label
          className="cancel-button absolute lg:right-8 top-1/2 cursor-pointer transform -translate-y-1/2 right-1"
          onClick={resetFiled}
        >
          Cancel
        </Label>
      )}
    </div>
  );
};

export default SearchField;
