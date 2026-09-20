import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef, type ElementType, type ComponentPropsWithoutRef } from "react";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "font-display text-[4rem] leading-[4.5rem] tracking-[-0.01em]",
      h2: "font-display text-[3.25rem] leading-[4rem] tracking-[-0.01em]",
      h3: "font-display text-[2.75rem] leading-[3.5rem] tracking-[-0.01em]",
      h4: "font-display text-[2rem] leading-[2.5rem] tracking-[-0.005em]",
      h5: "font-display text-[1.75rem] leading-[2.5rem] tracking-[-0.005em]",
      h6: "font-display text-[1.5rem] leading-[2rem] tracking-[-0.005em]",
      h7: "font-display text-[1.25rem] leading-[1.75rem] tracking-[-0.005em]",
      "text-lg": "font-sans text-[1.125rem] leading-[1.625rem] tracking-[-0.011em]",
      "text-md": "font-sans text-[1rem] leading-[1.5rem] tracking-[-0.006em]",
      "text-sm": "font-sans text-[0.875rem] leading-[1.25rem] tracking-[-0.006em]",
      "text-xs": "font-sans text-[0.75rem] leading-[1.25rem] tracking-[-0.006em]",
      "text-xxs": "font-sans text-[0.625rem] leading-[1.125rem] tracking-[0em]",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "text-md",
    weight: "regular",
  },
});

const DEFAULT_TAG_MAP: Record<string, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  h7: "h6",
  "text-lg": "p",
  "text-md": "p",
  "text-sm": "p",
  "text-xs": "span",
  "text-xxs": "span",
};

type TextVariantProps = VariantProps<typeof textVariants>;

type TextProps<T extends ElementType = "p"> = {
  as?: T;
  className?: string;
} & TextVariantProps &
  Omit<ComponentPropsWithoutRef<T>, "className" | "as">;

const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as, variant = "text-md", weight = "regular", className, children, ...props },
  ref
) {
  const Component = as ?? DEFAULT_TAG_MAP[variant ?? "text-md"] ?? "p";

  return (
    <Component
      ref={ref}
      className={clsx(textVariants({ variant, weight }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}) as <T extends ElementType = "p">(
  props: TextProps<T> & { ref?: React.Ref<HTMLElement> }
) => React.ReactElement | null;

export { Text, textVariants };
export type { TextProps, TextVariantProps };
