import type { ButtonHTMLAttributes, Ref } from "react";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

function Button({
  className = "",
  variant = "default",
  size = "default",
  asChild = false,
  ref,
  ...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  const Comp = asChild ? Slot : "button";

  const variantStyles: Record<string, string> = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizeStyles: Record<string, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return (
    <Comp
      className={`
        inline-flex items-center justify-center gap-2 whitespace-nowrap
        rounded-md text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
        disabled:pointer-events-none disabled:opacity-50
        [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      ref={ref}
      {...props}
    />
  );
}

export { Button };
