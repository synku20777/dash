import * as React from "react";
import { cn } from "../../lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "critical" | "warning";
};

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return <section role="status" className={cn("ui-alert", `ui-alert-${variant}`, className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("ui-alert-title", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("ui-alert-description", className)} {...props} />;
}

