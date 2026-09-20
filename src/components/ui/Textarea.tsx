import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef, type TextareaHTMLAttributes } from "react";

const textareaVariants = cva(
  "w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "min-h-[84px] px-3 py-2 rounded-lg",
        md: "min-h-[96px] px-4 py-2.5 rounded-lg",
        lg: "min-h-[120px] px-4 py-3 rounded-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof textareaVariants>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, size, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={clsx(textareaVariants({ size }), className)}
      {...props}
    />
  );
});

export { Textarea, textareaVariants };
export type { TextareaProps };
