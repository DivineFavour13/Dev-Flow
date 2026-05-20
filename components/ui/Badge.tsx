import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "info";

const variants: Record<Variant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/10 text-emerald-400",
  warning: "bg-orange-500/10 text-orange-400",
  danger: "bg-red-500/10 text-red-400",
  info: "bg-blue-500/10 text-blue-400",
};

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export function Badge({ children, variant = "default", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded text-[11px] font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}