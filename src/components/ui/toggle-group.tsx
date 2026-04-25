import * as React from "react";
import { cn } from "../../lib/utils";

type ToggleGroupProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  children: React.ReactNode;
  className?: string;
};

type ToggleContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const ToggleContext = React.createContext<ToggleContextValue | null>(null);

export function ToggleGroup<T extends string>({ value, onValueChange, children, className }: ToggleGroupProps<T>) {
  return (
    <ToggleContext.Provider value={{ value, onValueChange: onValueChange as (value: string) => void }}>
      <div className={cn("ui-toggle-group", className)} role="group">
        {children}
      </div>
    </ToggleContext.Provider>
  );
}

type ToggleGroupItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function ToggleGroupItem({ className, value, ...props }: ToggleGroupItemProps) {
  const context = React.useContext(ToggleContext);
  const selected = context?.value === value;

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn("ui-toggle-item", selected && "is-selected", className)}
      onClick={() => context?.onValueChange(value)}
      {...props}
    />
  );
}

