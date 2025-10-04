import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export default function Button({ children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={
        `inline-flex items-center justify-center px-md py-sm rounded-control
         bg-brand-primary text-white text-btn shadow-sm hover:shadow-md transition ` + className
      }
    >
      {children}
    </button>
  );
}
