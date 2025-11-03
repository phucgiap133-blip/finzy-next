"use client";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button">;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = "", ...rest }, ref) => {
    return (
      <button
        ref={ref}
        {...rest}
        className={
          `inline-flex items-center justify-center px-md py-sm rounded-control
         bg-brand-primary text-white text-btn shadow-sm hover:shadow-md transition ` +
          className
        }
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
