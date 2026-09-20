"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

const tooltipContentVariants = cva(
  "relative z-tooltip rounded-lg font-sans text-[0.75rem] leading-[1rem] font-medium shadow-[0_0.75rem_1rem_rgba(16,24,40,0.08),0_0.25rem_0.375rem_rgba(16,24,40,0.03)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      theme: {
        light: "bg-white text-[#161616]",
        dark: "bg-[#161616] text-white",
      },
    },
    defaultVariants: {
      theme: "dark",
    },
  }
);

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  title?: string;
  theme?: "light" | "dark";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  delayDuration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    VariantProps<typeof tooltipContentVariants> & {
      title?: string;
    }
>(function TooltipContent(
  { className, theme, title, sideOffset = 6, children, ...props },
  ref
) {
  const hasDescription = !!title;

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={clsx(
          tooltipContentVariants({ theme }),
          hasDescription ? "w-[18.75rem] p-[0.75rem]" : "px-[0.75rem] py-[0.5rem]",
          className
        )}
        {...props}
      >
        {title ? (
          <>
            <p className="mb-[0.5rem] text-[0.75rem] font-bold leading-[1rem]">{title}</p>
            <p
              className={clsx(
                "text-[0.75rem] font-medium leading-[1rem]",
                theme === "light" ? "text-[#576072]" : "text-white"
              )}
            >
              {children}
            </p>
          </>
        ) : (
          <span className={clsx(
            "text-[12px] font-medium leading-[16px]",
            theme === "light" ? "text-[#161616]" : "text-white"
          )}>
            {children}
          </span>
        )}
        <TooltipPrimitive.Arrow
          className={clsx(
            theme === "light" ? "fill-white" : "fill-gray-950"
          )}
          width={16}
          height={6}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});

function Tooltip({
  children,
  content,
  title,
  theme = "dark",
  side = "top",
  align = "center",
  sideOffset = 6,
  delayDuration = 200,
  open,
  onOpenChange,
}: TooltipProps) {
  return (
    <TooltipRoot open={open} onOpenChange={onOpenChange} delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent theme={theme} side={side} align={align} sideOffset={sideOffset} title={title}>
        {content}
      </TooltipContent>
    </TooltipRoot>
  );
}

export {
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  tooltipContentVariants,
};
