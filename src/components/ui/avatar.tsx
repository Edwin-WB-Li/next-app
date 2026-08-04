import type { ComponentProps } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

function Avatar({ className = "", ref, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={`
        relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full
        ${className}
      `}
      {...props}
    />
  );
}

function AvatarImage({
  className = "",
  ref,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={`aspect-square h-full w-full ${className}`}
      {...props}
    />
  );
}

function AvatarFallback({
  className = "",
  ref,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={`
        flex h-full w-full items-center justify-center rounded-full
        bg-muted text-muted-foreground text-sm font-medium
        ${className}
      `}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
