import * as React from "react";
import { cn } from "../../lib/utils";

type TooltipProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn("ui-tooltip", className)}>
      {children}
      <span className="ui-tooltip-content" role="tooltip">
        {label}
      </span>
    </span>
  );
}
