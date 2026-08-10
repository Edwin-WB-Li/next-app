import { forwardRef, type LabelHTMLAttributes } from "react";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className} `}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
