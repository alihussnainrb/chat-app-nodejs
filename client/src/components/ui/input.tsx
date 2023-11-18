'use client'
import * as React from "react";

import { cn } from "@/lib/utils";
import { EyeClosedIcon, EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Button } from "./button";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [pwdVisble, setPwdVisible] = React.useState(false);
    return (
      <div className="relative w-full">
        <input
          type={type === "password" ? (pwdVisble ? "text" : "password") : type}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {type === "password" && (
          <Button
            type="button"
            variant={"ghost"}
            size={"icon"}
            onClick={() => setPwdVisible(!pwdVisble)}
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            {pwdVisble ? (
              <EyeNoneIcon className="w-5 h-5" />
            ) : (
              <EyeOpenIcon className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

type InputElProps = InputProps & {
  leading?: React.ReactNode;
};

const InputEl = React.forwardRef<HTMLInputElement, InputElProps>(
  ({ className, leading, type, ...props }, ref) => {
    return (
      <div
        className={cn(
          "w-full rounded-md border border-slate-200 bg-white flex items-center h-10",
          className
        )}
      >
        {leading && (
          <span className="min-w-max h-[90%] text-sm flex items-center px-3 border-r border-slate-200">
            {leading}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full h-full px-3 rounded-md text-sm shadow-sm transition-colors bg-transparent file:border-0 file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
InputEl.displayName = "InputEl";

export { Input, InputEl };