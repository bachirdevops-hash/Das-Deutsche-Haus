import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border-2 border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus-visible:outline-none focus-visible:border-[#FFCE00] focus-visible:shadow-[0_0_0_4px_rgba(255,206,0,0.15)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
