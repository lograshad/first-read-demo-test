import * as React from "react";

import { cn } from "@repo/ui/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground text-text-body placeholder:text-text-caption selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-12 w-full min-w-0 rounded-full bg-bg-light px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm md:font-medium file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:ring-bg-light2 focus-visible:ring-[1.5px]",
        "aria-invalid:ring-text-danger dark:aria-invalid:ring-text-danger aria-invalid:ring-[1.5px] aria-invalid:bg-bg-danger dark:aria-invalid:bg-bg-danger",
        "aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none",
        "aria-[state=success]:ring-text-success aria-[state=success]:ring-[1.5px] aria-[state=success]:bg-success-200/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };
