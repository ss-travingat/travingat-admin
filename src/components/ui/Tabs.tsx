"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { clsx } from "clsx";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={clsx(
        "inline-flex items-center gap-2",
        className
      )}
      {...props}
    />
  );
});

const TabsTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={clsx(
        "inline-flex h-[2.5rem] items-center rounded-full px-[1.5rem] font-sans text-[1rem] leading-[1.5rem] tracking-[-0.0375rem] transition-colors",
        "bg-black-800 text-white-300 font-normal",
        "border border-transparent",
        "hover:bg-black-600 hover:text-white",
        "data-[state=active]:bg-black-600 data-[state=active]:border-white data-[state=active]:text-white data-[state=active]:font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
        className
      )}
      {...props}
    />
  );
});

const TabsContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={clsx(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
        className
      )}
      {...props}
    />
  );
});

export { Tabs, TabsList, TabsTrigger, TabsContent };
