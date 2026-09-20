import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

const inputVariants = cva(
  "w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "h-9 px-3 rounded-lg",
        md: "h-10 px-4 rounded-lg",
        lg: "h-11 px-4 rounded-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof inputVariants>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size, type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={clsx(inputVariants({ size }), className)}
      {...props}
    />
  );
});

export { Input, inputVariants };
export type { InputProps };
