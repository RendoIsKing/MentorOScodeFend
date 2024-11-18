"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { setUserSearchFromTagsData } from "@/redux/slices/adapters";
import { useAppDispatch } from "@/redux/store";
import { useDebounce } from "@/hooks/use-debounce";
import { useUserTagsContext } from "@/context/UserTags";

// * value is userId
// * label is userName
type Options = Record<"value" | "label", string>;

export function TagMultiSelect({ options, setQuery }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const debouncedInputValue = useDebounce(inputValue, 500);

  const { state, dispatch } = useUserTagsContext();
  const { userTag, taggedUsers } = state;

  const appDispatch = useAppDispatch();

  const handleUnselect = React.useCallback(
    (option) => {
      dispatch({ type: "REMOVE_TAGGED_USER", payload: option.userId });
    },
    [dispatch]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            dispatch({
              type: "REMOVE_TAGGED_USER",
              payload: taggedUsers[taggedUsers.length - 1]?.userId,
            });
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [dispatch, taggedUsers]
  );

  const selectables = options.filter(
    (option) => !taggedUsers.some((user) => user.userId === option.value)
  );

  const handleSelect = (option) => {
    setInputValue("");
    dispatch({
      type: "SET_USER_TAG",
      payload: {
        ...userTag,
        userId: option.value,
        userName: option.label,
      },
    });

    dispatch({
      type: "ADD_TAGGED_USER",
      payload: {
        userId: option.value,
        userName: option.label,
        location: { x: userTag.location.x, y: userTag.location.y },
      },
    });
  };

  React.useEffect(() => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      searchTerm: debouncedInputValue,
    }));
    appDispatch(setUserSearchFromTagsData(debouncedInputValue));
  }, [debouncedInputValue]);

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {taggedUsers.map((option) => {
            return (
              <Badge key={option.userId} variant="secondary">
                {option.userName}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    handleUnselect(option);
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Select..."
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables?.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((option) => {
                  return (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        handleSelect(option);
                      }}
                      className={"cursor-pointer"}
                    >
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
}
