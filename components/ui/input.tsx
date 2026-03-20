import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/30",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
