"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-white-50 text-black-950 hover:bg-white-200 disabled:bg-white-100 disabled:text-white-300",
        secondary:
          "bg-black-700 text-white-50 border border-black-100 hover:bg-black-200 hover:border-black-100 disabled:bg-black-700 disabled:text-white-900 disabled:border-black-100",
        violet:
          "bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-200 disabled:text-violet-50",
        coral:
          "bg-coral-500 text-white hover:bg-coral-600 disabled:bg-coral-300 disabled:text-coral-50",
        amber:
          "bg-amber-400 text-white hover:bg-amber-500 disabled:bg-amber-200 disabled:text-amber-50",
        cyan:
          "bg-cyan-400 text-white hover:bg-cyan-600 disabled:bg-cyan-200 disabled:text-cyan-50",
        ghost:
          "bg-transparent text-white hover:bg-transparent disabled:text-white-900",
      },
      size: {
        xs: "h-[32px] px-[8px] py-[8px] text-[12px] leading-[16px] tracking-[0px]",
        sm: "h-[36px] px-[12px] py-[8px] text-[14px] leading-[20px] tracking-[-0.084px]",
        md: "h-[40px] px-[16px] py-[10px] text-[14px] leading-[20px] tracking-[-0.084px]",
        lg: "h-[44px] px-[18px] py-[10px] text-[16px] leading-[24px] tracking-[-0.096px]",
        xl: "h-[48px] px-[20px] py-[12px] text-[16px] leading-[24px] tracking-[-0.096px]",
        "2xl": "h-[58px] px-[24px] py-[16px] text-[18px] leading-[26px] tracking-[-0.198px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading = false, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="size-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
});

export { Button, buttonVariants };
export type { ButtonProps };
