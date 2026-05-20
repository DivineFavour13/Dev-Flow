import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "ghost" | "outline" | "destructive";
type Size = "sm" | "md" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-foreground text-background hover:opacity-90",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
  outline: "border border-border text-foreground hover:bg-muted",
  destructive: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs rounded-md gap-1.5",
  md: "h-9 px-3.5 text-sm rounded-lg gap-2",
  icon: "h-8 w-8 rounded-md",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-colors select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
);

Button.displayName = "Button";