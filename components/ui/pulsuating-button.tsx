import React from "react";
import { cn } from "@/utils";

interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
}

export const PulsatingButton = React.forwardRef<
  HTMLButtonElement,
  PulsatingButtonProps
>(
  (
    {
      className,
      children,
      pulseColor = "#ff9080",
      duration = "2.5s",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          " relative flex cursor-pointer items-center justify-center rounded-[20rem]  px-4 py-2 text-center text-blue w-60 bg-white text-[#1E3470]",
          className
        )}
        style={
          {
            "--pulse-color": pulseColor,
            "--duration": duration,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <div className="absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-3xl bg-inherit " />
      </button>
    );
  }
);

PulsatingButton.displayName = "PulsatingButton";
