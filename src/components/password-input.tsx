"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, InputProps } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PasswordInputProps = InputProps & {
  toggleVisibility?: boolean;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, toggleVisibility = true, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className={cn("relative flex items-center", className)}>
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className="h-12 pl-6 border-muted-foreground/30"
          placeholder="Password"
          {...props}
        />
        {toggleVisibility && (
          <Button
            type="button"
            variant="ghost"
            className="absolute right-2 p-4"
            onClick={() => setVisible((prev) => !prev)}
          >
            {visible ? (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Eye className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
