import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "priority";
  priority?: "P0" | "P1" | "P2" | "P3";
}

function Badge({ className = "", variant = "default", priority, ...props }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-border",
    priority: "border-transparent",
  };

  const priorityStyles: Record<string, string> = {
    P0: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    P1: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    P2: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    P3: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  const appliedStyle =
    variant === "priority" && priority ? priorityStyles[priority] : variantStyles[variant];

  return (
    <div
      className={`
        inline-flex items-center rounded-full border px-2 py-0.5
        text-xs font-semibold transition-colors
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${appliedStyle}
        ${className}
      `}
      {...props}
    />
  );
}

export { Badge };
